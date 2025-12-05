"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, ServerCog, Database, Brain, Map } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchWithAuth } from "@/lib/api"

interface EmptyStateProps {
  onUploadSuccess: () => void
}

const ANALYSIS_STEPS = [
  { message: "서버로 대용량 데이터 전송 중...", icon: ServerCog },
  { message: "파일 저장 및 무결성 검사 수행...", icon: Database },
  { message: "AI 분석 엔진 가동 및 DB 저장...", icon: Brain },
  { message: "지역별 매출 시뮬레이션 완료.", icon: Map },
]

export function EmptyState({ onUploadSuccess }: EmptyStateProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    setProgress(0)
    setCurrentStep(0)

    const formData = new FormData()
    formData.append("file", file)

    try {
      simulateProgress() // 애니메이션 시작

      const res = await fetchWithAuth("http://localhost:8000/analysis/upload", {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        throw new Error("업로드 실패")
      }

      const data = await res.json()
      if (data.success) {
        // 분석 완료 애니메이션을 위해 잠시 대기
        setTimeout(() => {
            onUploadSuccess()
        }, 1000)
      } else {
        throw new Error(data.message || "분석에 실패했습니다.")
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || "파일 업로드 중 오류가 발생했습니다.")
      setIsUploading(false)
    }
  }

  // 🎬 분석 시퀀스 연출
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
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-2xl shadow-xl border-slate-200 relative overflow-hidden">
        
        {/* 로딩 오버레이 */}
        {isUploading && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900">데이터 분석 중...</h3>
                        <p className="text-slate-500">잠시만 기다려주세요. AI가 데이터를 분석하고 있습니다.</p>
                    </div>

                    {/* 진행률 바 */}
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* 단계별 진행 상황 */}
                    <div className="space-y-4">
                        {ANALYSIS_STEPS.map((step, index) => {
                            const Icon = step.icon
                            const isActive = index === currentStep
                            const isCompleted = index < currentStep

                            return (
                                <div key={index} className={`flex items-center gap-4 transition-all duration-300 ${
                                    isActive ? "opacity-100 scale-105" : 
                                    isCompleted ? "opacity-50" : "opacity-30"
                                }`}>
                                    <div className={`p-2 rounded-full ${
                                        isActive ? "bg-primary text-white shadow-lg shadow-primary/30" : 
                                        isCompleted ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-400"
                                    }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={`font-medium ${
                                        isActive ? "text-slate-900" : "text-slate-500"
                                    }`}>{step.message}</span>
                                    {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )}

        <CardHeader className="text-center pb-8 pt-10">
          <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <FileSpreadsheet className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900">데이터 분석 시작하기</CardTitle>
          <CardDescription className="text-lg mt-3 text-slate-600">
            가맹점 매출/유동인구 데이터 파일을 업로드하여<br/>
            AI 기반 상권 분석 리포트를 받아보세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-10 px-10">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors relative group cursor-pointer">
            <input 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isUploading}
            />
            
            <div className="space-y-4 group-hover:scale-105 transition-transform duration-300">
                <div className="flex justify-center">
                  <Upload className="w-12 h-12 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-700">파일을 드래그하거나 클릭하여 업로드</p>
                  <p className="text-sm text-slate-500 mt-1">지원 형식: CSV, Excel (.xlsx)</p>
                </div>
                <Button className="mt-4 pointer-events-none" size="lg">
                  파일 선택하기
                </Button>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="mt-8 bg-slate-50 p-6 rounded-lg">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              분석 가능한 데이터 항목
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">• 일별/월별 매출 데이터</li>
              <li className="flex items-center gap-2">• 시간대별 유동인구</li>
              <li className="flex items-center gap-2">• 고객 연령대/성별 분포</li>
              <li className="flex items-center gap-2">• 재방문율 및 체류시간</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
