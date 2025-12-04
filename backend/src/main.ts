import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as crypto from 'crypto';

// 1. 서버 시작 시 랜덤 키 생성 후 환경변수에 주입
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
console.log('🔑 새 세션 키 생성됨 (재시작 시 로그아웃):', process.env.JWT_SECRET);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 👇 CORS 설정 추가 (프론트엔드 허용)
  app.enableCors({
    origin: 'http://localhost:3000', // 프론트 주소
    credentials: true,
  });

  await app.listen(8000);
}
bootstrap();