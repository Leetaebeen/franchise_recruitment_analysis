import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // 👈 환경변수 설정용
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module'; // 👈 1. AuthModule 임포트 확인!
import { AnalysisModule } from './analysis/analysis.module';

@Module({
  imports: [
    // 환경변수 전역 설정 (중요!)
    ConfigModule.forRoot({ isGlobal: true }), 
    
    // 모듈 등록
    PrismaModule,
    UsersModule,
    AuthModule, // 👈 2. 여기에 AuthModule이 꼭! 있어야 합니다.
    AnalysisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}