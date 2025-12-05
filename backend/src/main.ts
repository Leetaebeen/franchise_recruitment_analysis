import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // ❌ process.env.JWT_SECRET 설정 코드 삭제

  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(8000);
}
bootstrap();