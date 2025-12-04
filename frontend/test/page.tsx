"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestPage() {
  const [result, setResult] = useState("대기 중...")

  const checkConnection = async () => {
    try {
      setResult("연결 시도 중...")
      // 백엔드(8000번)로 요청 보내기
      const res = await fetch("http://localhost:8000/ping")
      const data = await res.json()
      setResult(data.message) // "Pong! 연결 성공 🏓"
    } catch (error) {
      setResult("❌ 연결 실패 (백엔드 서버 켜져 있나요?)")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">백엔드 연결 테스트</h1>
      <div className="p-4 border rounded text-lg font-mono bg-slate-100">
        {result}
      </div>
      <Button onClick={checkConnection}>Ping 날리기 🚀</Button>
    </div>
  )
}