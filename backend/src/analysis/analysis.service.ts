import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';
import * as Papa from 'papaparse';

@Injectable()
export class AnalysisService {
  constructor(private prisma: PrismaService) {}

  // 1. 파일 업로드 및 분석
  async uploadAndAnalyze(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }

    const csvContent = fs.readFileSync(file.path, 'utf8');

    const { data } = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    const BATCH_SIZE = 500;
    let savedCount = 0;

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      
      const formattedData = batch.map((row: any) => ({
        uid: row['uid'] || row['사용자_ID'] || 0,
        regionCity: row['region_city'] || row['지역_도시'] || 'Unknown',
        ageGroup: row['age_group'] || row['연령대'] || 'Unknown',
        age: row['age'] || row['나이'] || 0,
        visitDays: row['visit_days'] || row['방문일수'] || 0,
        totalDurationMin: row['total_duration_min'] || row['총_이용시간(분)'] || 0,
        avgDurationMin: row['avg_duration_min'] || row['평균_이용시간(분)'] || 0,
        totalPaymentMay: row['total_payment_may'] || row['5월_총결제금액'] || 0,
        retainedJune: row['retained_june'] || row['6월_재방문여부'] || 0,
        retainedJuly: row['retained_july'] || row['7월_재방문여부'] || 0,
        retainedAugust: row['retained_august'] || row['8월_재방문여부'] || 0,
        retained90: row['retained_90'] || row['90일_재방문여부'] || 0,
      }));

      const validData = formattedData.filter((d) => d.uid !== 0);

      if (validData.length > 0) {
        await this.prisma.analysisData.createMany({
          data: validData,
          skipDuplicates: true,
        });
        savedCount += validData.length;
      }
    }

    fs.unlinkSync(file.path); // 임시 파일 삭제

    return {
      message: '분석 및 저장이 완료되었습니다.',
      totalCount: data.length,
      savedCount: savedCount,
    };
  }

  // 2. 통계 데이터 조회 (프론트 대시보드용)
  async getNationwideStats() {
    try {
      // 1. 전체 데이터 가져오기 (차트 그리기용)
      // 2만건 정도는 한 번에 가져와도 괜찮습니다.
      const allData = await this.prisma.analysisData.findMany({
        orderBy: { totalPaymentMay: 'desc' } 
      });

      // 2. 통계 집계
      const aggregations = await this.prisma.analysisData.aggregate({
        _avg: {
          totalPaymentMay: true,
          retained90: true,
          visitDays: true,
          totalDurationMin: true, // 👈 추가
        },
        _count: {
          uid: true,
        }
      });

      return {
        success: true,
        data: {
          avgRevenue: Math.round(aggregations._avg.totalPaymentMay || 0),
          avgRetention: Math.round((aggregations._avg.retained90 || 0) * 100),
          avgUsage: Math.round(aggregations._avg.totalDurationMin || 0), // 👈 수정
          totalSamples: aggregations._count.uid,
          rawData: allData, // 👈 실제 데이터 포함
        }
      };
    } catch (error) {
      console.error("통계 조회 실패:", error);
      throw new BadRequestException("통계 데이터를 불러오지 못했습니다.");
    }
  }

  // 3. 데이터 초기화 (테스트용)
  async clearAllData() {
    await this.prisma.analysisData.deleteMany({});
    return { success: true, message: "모든 데이터가 삭제되었습니다." };
  }
}