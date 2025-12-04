import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHello() {
    return "Hello World!";
  }

  // 👇 여기 추가! (연결 테스트용 API)
  @Get('ping')
  ping() {
    return { message: "Pong! 연결 성공 🏓" };
  }
}