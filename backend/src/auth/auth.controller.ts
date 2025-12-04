import { Body, Controller, Post, HttpCode, HttpStatus, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Response } from 'express'; // 👈 [수정] import type으로 변경!

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  // 1. 구글 로그인 시작
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  // 2. 구글 리다이렉트 처리
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user;
    const jwtResult = await this.authService.generateJwt(user);
    
    const accessToken = jwtResult.access_token;
    const username = jwtResult.username;

    // 프론트엔드로 토큰 전달 (리다이렉트)
    return res.redirect(`http://localhost:3000/login?accessToken=${accessToken}&username=${username}`);
  }
}