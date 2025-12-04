import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

interface GoogleUser {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  // 기존 로그인 (이메일/비번)
  async signIn(username: string, pass: string) {
    const user = await this.usersService.findOne(username);

    // 👇 [수정] user.password가 없거나(구글 유저), 비밀번호가 틀리면 에러
    if (!user || !user.password || !(await bcrypt.compare(pass, user.password))) {
      throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
    }

    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
      username: user.username,
    };
  }

  // ✅ 구글 로그인 유저 처리 (수정됨)
  async validateOrCreateGoogleUser(details: GoogleUser) {
    // 1. googleId로 검색
    const user = await this.prisma.user.findFirst({
      // 👇 @ts-ignore 주석 추가 (타입 검사 건너뛰기)
      // @ts-ignore
      where: { googleId: details.googleId },
    });

    if (user) return user;

    // 2. 없으면 생성
    const newUsername = details.email.split('@')[0];
    
    return await this.prisma.user.create({
      // 👇 @ts-ignore 주석 추가
      // @ts-ignore
      data: {
        googleId: details.googleId,
        email: details.email,
        username: newUsername,
        password: '', 
      },
    });
  }

  // JWT 발급
  async generateJwt(user: any) {
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
      username: user.username,
    };
  }
}