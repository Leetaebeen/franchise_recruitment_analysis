import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import * as crypto from 'crypto';

// 🔥 [핵심] 서버가 켜질 때마다 새로운 랜덤 비밀키 생성 (32바이트)
// 다른 파일(JwtStrategy)에서 갖다 쓸 수 있게 export 합니다.
export const RANDOM_SECRET_KEY = crypto.randomBytes(32).toString('hex');
console.log('🔑 서버 세션 키(재시작 시 갱신됨):', RANDOM_SECRET_KEY);

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    ConfigModule,
    JwtModule.register({
      global: true,
      // 위에서 만든 랜덤 키를 사용합니다.
      secret: RANDOM_SECRET_KEY, 
      signOptions: { expiresIn: '1h' }, // 토큰 유효시간 1시간
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
})
export class AuthModule {}