"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" // 리다이렉트용
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      // ✅ NestJS 백엔드로 요청 보내기
      const res = await fetch("http://localhost:8000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        // 백엔드에서 보낸 에러 메시지 (예: 이미 존재하는 아이디입니다)
        throw new Error(data.message || "회원가입 실패")
      }

      // 성공 시 로그인 페이지로 이동
      alert("회원가입이 완료되었습니다!")
      router.push("/login")

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
          <CardDescription>
            서비스 이용을 위해 계정을 생성하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              {/* name 속성을 username으로 변경 */}
              <Input id="username" name="username" placeholder="user123" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" name="password" type="password" required />
            </div>

            {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}

            <Button type="submit" className="w-full h-11 text-lg" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "가입하기"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-primary hover:underline font-bold">
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}