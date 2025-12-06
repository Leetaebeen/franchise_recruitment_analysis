import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';
import * as Papa from 'papaparse';

type RawCsvRow = Record<string, any>;

@Injectable()
export class AnalysisService {
  constructor(private prisma: PrismaService) {}

  private aliasMap: Record<string, string[]> = {
    uid: ['uid', 'user_id', 'id'],
    regionCity: ['region_city', 'regioncity', 'region_city_group', 'region_city_group_no', 'region'],
    ageGroup: ['age_group', 'agegroup'],
    age: ['age'],
    visitDays: ['visit_days', 'visitdays'],
    totalDurationMin: ['total_duration_min', 'totaldurationmin'],
    avgDurationMin: ['avg_duration_min', 'avgdurationmin'],
    totalPaymentMay: ['total_payment_may', 'totalpaymentmay'],
    retainedJune: ['retained_june', 'retainedjune'],
    retainedJuly: ['retained_july', 'retainedjuly'],
    retainedAugust: ['retained_august', 'retainedaugust'],
    retained90: ['retained_90', 'retained90'],
  };

  private validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 없습니다.');
    }
    const allowedMime = ['text/csv', 'application/vnd.ms-excel'];
    if (!allowedMime.includes(file.mimetype)) {
      throw new BadRequestException('CSV 파일만 업로드할 수 있습니다.');
    }
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('파일 용량이 10MB를 초과합니다.');
    }
  }

  private normalizeKeyName(key: string) {
    return key.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/\s+/g, '_');
  }

  private normalizeKeys(row: RawCsvRow) {
    const normalized: RawCsvRow = {};
    Object.keys(row).forEach((key) => {
      const cleanKey = this.normalizeKeyName(key);
      normalized[cleanKey] = row[key];
    });
    return normalized;
  }

  private getValue(row: RawCsvRow, aliases: string[]) {
    for (const key of aliases) {
      if (row[key] !== undefined && row[key] !== null) {
        return row[key];
      }
    }
    return undefined;
  }

  private normalizeRow(row: RawCsvRow) {
    const uid = this.getValue(row, this.aliasMap.uid);
    if (uid === undefined || uid === null) return null;

    return {
      uid: Number(uid) || 0,
      regionCity: String(this.getValue(row, this.aliasMap.regionCity) || 'Unknown'),
      ageGroup: String(this.getValue(row, this.aliasMap.ageGroup) || 'Unknown'),
      age: Number(this.getValue(row, this.aliasMap.age) || 0),
      visitDays: Number(this.getValue(row, this.aliasMap.visitDays) || 0),
      totalDurationMin: Number(this.getValue(row, this.aliasMap.totalDurationMin) || 0),
      avgDurationMin: Number(this.getValue(row, this.aliasMap.avgDurationMin) || 0),
      totalPaymentMay: Number(this.getValue(row, this.aliasMap.totalPaymentMay) || 0),
      retainedJune: Number(this.getValue(row, this.aliasMap.retainedJune) || 0),
      retainedJuly: Number(this.getValue(row, this.aliasMap.retainedJuly) || 0),
      retainedAugust: Number(this.getValue(row, this.aliasMap.retainedAugust) || 0),
      retained90: Number(this.getValue(row, this.aliasMap.retained90) || 0),
    };
  }

  // 1. CSV 업로드 후 분석 저장
  async uploadAndAnalyze(file: Express.Multer.File) {
    this.validateFile(file);

    const rows: RawCsvRow[] = [];

    await new Promise<void>((resolve, reject) => {
      const stream = fs.createReadStream(file.path);
      Papa.parse(stream, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        step: (result) => {
          const normalizedRow = this.normalizeKeys(result.data as RawCsvRow);
          rows.push(normalizedRow);
        },
        complete: () => resolve(),
        error: (err) => reject(err),
      });
    }).catch((err) => {
      throw new BadRequestException(`CSV 파싱 실패: ${err.message}`);
    });

    if (rows.length === 0) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('CSV 내용이 비어 있습니다.');
    }

    const headers = new Set(Object.keys(rows[0]));
    const missingCanonical = Object.entries(this.aliasMap)
      .filter(([canonical, aliases]) => !aliases.some((key) => headers.has(key)))
      .map(([canonical]) => canonical);

    if (missingCanonical.length > 0) {
      fs.unlinkSync(file.path);
      throw new BadRequestException(
        `CSV 헤더가 올바르지 않습니다. 부족한 필드: ${missingCanonical.join(', ')}`
      );
    }

    const BATCH_SIZE = 500;
    let savedCount = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const formattedData = batch.map((row: RawCsvRow) => this.normalizeRow(row)).filter(Boolean);
      const validData = (formattedData as any[]).filter((d) => d.uid !== 0);

      if (validData.length > 0) {
        await this.prisma.analysisData.createMany({
          data: validData,
          skipDuplicates: true,
        });
        savedCount += validData.length;
      }
    }

    fs.unlinkSync(file.path);

    return {
      message: '분석 데이터가 저장되었습니다.',
      totalCount: rows.length,
      savedCount,
    };
  }

  // 2. 통계 조회 (프런트 대시보드용)
  async getNationwideStats() {
    try {
      const aggregations = await this.prisma.analysisData.aggregate({
        _avg: {
          totalPaymentMay: true,
          retained90: true,
          visitDays: true,
          totalDurationMin: true,
        },
        _count: {
          uid: true,
        },
      });

      const rawData = await this.prisma.analysisData.findMany({
        orderBy: { totalPaymentMay: 'desc' },
      });

      // 집계가 비었을 때도 rawData 길이로 보정
      const totalSamples = aggregations._count.uid || rawData.length || 0;

      return {
        success: true,
        data: {
          avgRevenue: Math.round(aggregations._avg.totalPaymentMay || 0),
          avgRetention: Math.round((aggregations._avg.retained90 || 0) * 100),
          avgUsage: Math.round(aggregations._avg.totalDurationMin || 0),
          totalSamples,
          rawData,
        },
      };
    } catch (error) {
      console.error('통계 조회 실패:', error);
      throw new BadRequestException('통계 데이터를 불러오지 못했습니다.');
    }
  }

  // 3. 초기화
  async clearAllData() {
    await this.prisma.analysisData.deleteMany({});
    return { success: true, message: '모든 데이터가 삭제되었습니다.' };
  }
}
