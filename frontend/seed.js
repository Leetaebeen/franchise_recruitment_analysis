// seed.js (수정버전: 안전장치 추가)
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 데이터 입력을 시작합니다...');

  // 1. CSV 파일 읽기
  const csvFilePath = path.join(__dirname, 'data.csv');
  
  if (!fs.existsSync(csvFilePath)) {
    console.error('❌ data.csv 파일을 찾을 수 없습니다!');
    return;
  }

  const fileContent = fs.readFileSync(csvFilePath, 'utf8');

  // 2. 파싱
  const { data } = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true, // 빈 줄 무시
    dynamicTyping: true,   // 숫자 자동 변환
  });

  console.log(`📦 총 ${data.length}개의 데이터를 발견했습니다.`);

  // 3. DB에 저장 (배치 처리)
  const BATCH_SIZE = 500; // 안전하게 500개씩
  
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    
    // 💡 안전하게 변환 (값이 없으면 0이나 빈 문자열 처리)
    const formattedData = batch.map((row) => ({
      uid: row['uid'] || row['사용자_ID'] || 0,
      regionCity: row['region_city'] || row['지역_도시'] || 'Unknown',
      ageGroup: row['age_group'] || row['연령대'] || 'Unknown',
      age: row['age'] || row['나이'] || 0,
      visitDays: row['visit_days'] || row['방문일수'] || 0,
      totalDurationMin: row['total_duration_min'] || row['총_이용시간(분)'] || 0,
      avgDurationMin: row['avg_duration_min'] || row['평균_이용시간(분)'] || 0,
      totalPaymentMay: row['total_payment_may'] || row['5월_총결제금액'] || 0,
      // 👇 여기가 에러 원인이었음 (안전하게 || 0 추가)
      retainedJune: row['retained_june'] || row['6월_재방문여부'] || 0,
      retainedJuly: row['retained_july'] || row['7월_재방문여부'] || 0,
      retainedAugust: row['retained_august'] || row['8월_재방문여부'] || 0,
      retained90: row['retained_90'] || row['90일_재방문여부'] || 0,
    }));

    // 유효하지 않은 데이터(예: uid가 0인 것)는 필터링
    const validData = formattedData.filter(d => d.uid !== 0);

    if (validData.length > 0) {
        await prisma.analysisData.createMany({
            data: validData,
            skipDuplicates: true,
        });
    }

    console.log(`✅ ${Math.min(i + BATCH_SIZE, data.length)} / ${data.length} 저장 완료...`);
  }

  console.log('🎉 모든 데이터가 DB에 성공적으로 저장되었습니다!');
}

main()
  .catch((e) => {
    console.error('❌ 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });