import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
// 👇 키 가져오기
import { DYNAMIC_SECRET_KEY } from './secrets';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    ConfigModule,
    JwtModule.register({
      global: true,
      // 👇 process.env 대신 이 키를 사용
      secret: DYNAMIC_SECRET_KEY, 
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
})
export class AuthModule {}