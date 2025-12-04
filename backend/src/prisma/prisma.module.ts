// backend/src/prisma/prisma.module.ts

import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 👈 (선택) Global을 붙이면 어디서든 편하게 쓸 수 있음
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 👈 핵심! 이걸 해줘야 다른 곳에서 PrismaService를 갖다 쓸 수 있음
})
export class PrismaModule {}