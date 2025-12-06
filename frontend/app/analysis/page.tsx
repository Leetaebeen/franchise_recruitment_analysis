"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Brain, CheckCircle2, Database, Map, ServerCog, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { fetchWithAuth } from "@/lib/api"

const ANALYSIS_STEPS = [
  { message: "서버로 파일 전송 중...", icon: ServerCog },
  { message: "CSV 유효성/무결성 검증 중...", icon: Database },
  { message: "AI 분석 실행 및 DB 반영 중...", icon: Brain },
  { message: "지역별 매출 인사이트 생성 완료.", icon: Map },
]

export default function AnalysisPage({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const handleCardClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: any) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsAnalyzing(true)
    setProgress(0)
    setCurrentStep(0)

    const formData = new FormData()
    formData.append("file", file)

    try {
      simulateProgress()

      const res = await fetchWithAuth("http://localhost:8000/analysis/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        let detail = ""
        try {
          const body = await res.json()
          detail = body?.message || body?.error || JSON.stringify(body)
        } catch {
          try {
            detail = await res.text()
          } catch {
            detail = ""
          }
        }
        throw new Error(`파일 업로드 실패 (status: ${res.status}) ${detail}`)
      }

      const result = await res.json()
      console.log("분석 성공:", result)

      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/dashboard")
        }
      }, 1000)
    } catch (error) {
      console.error(error)
      alert("분석 중 문제가 발생했습니다. 다시 시도해 주세요.\n" + (error as Error)?.message)
      setIsAnalyzing(false)
    }
  }

  // 단순 진행바 애니메이션
  const simulateProgress = () => {
    const totalSteps = ANALYSIS_STEPS.length
    const stepDuration = 800
    let step = 0

    const interval = setInterval(() => {
      step++
      setCurrentStep(step)
      setProgress((step / totalSteps) * 100)

      if (step >= totalSteps) {
        clearInterval(interval)
      }
    }, stepDuration)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center relative">
      <div className="absolute top-6 left-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> 메인으로
          </Button>
        </Link>
      </div>

      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <Card className="w-full max-w-lg p-8 bg-slate-950 border-slate-800 text-white shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <Brain className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mt-4">AI 데이터 분석 중...</h2>
              <p className="text-slate-400 text-sm mt-1">잠시만 기다려 주세요.</p>
            </div>

            <div className="space-y-4 mb-8">
              {ANALYSIS_STEPS.map((step, index) => {
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 transition-all duration-300 ${isActive || isCompleted ? "opacity-100" : "opacity-30"}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        isCompleted ? "bg-green-500 border-green-500" : isActive ? "border-blue-500 animate-spin" : "border-slate-600"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4 text-white" /> : isActive ? <div className="w-2 h-2 bg-blue-500 rounded-full" /> : null}
                    </div>
                    <span className={`text-sm ${isActive ? "text-blue-400 font-bold" : isCompleted ? "text-green-400" : "text-slate-500"}`}>
                      {step.message}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="space-y-2">
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Processing...</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {!isAnalyzing && (
        <div className="w-full max-w-3xl space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">원본 CSV 분석 시작하기</h1>
            <p className="text-slate-500">보유하신 CSV 파일을 업로드하면 AI가 즉시 분석해 드립니다.</p>
          </div>

          <Card
            className="bg-white border-primary/20 shadow-xl shadow-primary/5 overflow-hidden relative group cursor-pointer hover:border-primary/50 transition-all duration-300"
            onClick={handleCardClick}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50 group-hover:opacity-80 transition-opacity" />
            <div className="p-16 flex flex-col items-center justify-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">분석할 파일 업로드</h3>
                <p className="text-slate-500">
                  클릭하여 CSV 파일을 선택하거나, 이 영역으로 드래그하세요.
                </p>
              </div>

              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />

              <Button size="lg" className="mt-4 px-8 h-12 text-lg shadow-lg shadow-primary/20">
                파일 선택하기
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
