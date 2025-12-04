// lib/db.ts

import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

// 핫 리로딩 시 DB 연결이 계속 늘어나는 것을 방지 (Next.js 필수 설정)
export const db = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db
}