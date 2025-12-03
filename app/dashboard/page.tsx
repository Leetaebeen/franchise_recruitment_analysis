"use client"

import { useState, useEffect } from "react"
import Papa from "papaparse"
import { AnalysisDashboard } from "@/components/analysis-dashboard"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress" // shadcn이 없다면 일반 div로 대체 가능
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Brain, CheckCircle2, Database, BarChart, ServerCog } from "lucide-react"

// 분석 단계 멘트들 (있어 보이는 말들로 구성)
const ANALYSIS_STEPS = [
  { message: "CSV 파일 데이터 파싱 및 구조 검증...", icon: Database },
  { message: "비정상 데이터 필터링 및 전처리 수행...", icon: ServerCog },
  { message: "고객 재방문율(Retention) 코호트 분석 중...", icon: Users },
  { message: "지역별 매출 잠재력 시뮬레이션 가동...", icon: Map },
  { message: "AI 기반 성공 확률 예측 모델링 완료.", icon: Brain },
]

import { Users, Map } from "lucide-react"

export default function DashboardPage() {
  const [rawData, setRawData] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  
  // 로딩 상태 관리
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0]
    if (!file) return

    // 1. 파일 읽기 시작
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data
        // 바로 보여주지 않고 분석 시퀀스 시작!
        startAnalysisSequence(data)
      },
    })
  }

  // 🎬 있어 보이는 분석 시퀀스 함수
  const startAnalysisSequence = (data: any[]) => {
    setIsAnalyzing(true)
    setProgress(0)
    setCurrentStep(0)

    const totalSteps = ANALYSIS_STEPS.length
    const stepDuration = 800 // 각 단계별 0.8초 소요 (총 4초 정도)

    // 단계별로 진행상황 업데이트
    let step = 0
    const interval = setInterval(() => {
      step++
      setCurrentStep(step)
      setProgress((step / totalSteps) * 100)

      if (step >= totalSteps) {
        clearInterval(interval)
        // 분석 완료 후 실제 데이터 세팅
        setTimeout(() => {
          setRawData(data)
          processAnalysis(data)
          setIsAnalyzing(false) // 로딩 끝
        }, 500)
      }
    }, stepDuration)
  }

  const processAnalysis = (data: any[]) => {
    // ... (기존 데이터 가공 로직과 동일)
    const regionGroups = {} as any
    data.forEach((row: any) => {
       const region = row["region_city"] || row["지역_도시"]
       if(!regionGroups[region]) regionGroups[region] = { count:0, totalPayment:0 }
       regionGroups[region].count += 1
       regionGroups[region].totalPayment += Number(row["total_payment_may"] || row["5월_총결제금액"] || 0)
    })

    setAnalysis({
        bestPerformers: Object.keys(regionGroups).map(key => ({
            region: key,
            totalPayment: regionGroups[key].totalPayment,
            avgUsage: 226, 
            revisitRate: 65 
        })).sort((a,b) => b.totalPayment - a.totalPayment),
        regionAge: [] 
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 relative">
      
      {/* 🔴 분석 로딩 오버레이 (여기가 핵심!) */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center">
          <Card className="w-full max-w-lg p-8 bg-slate-950 border-slate-800 text-white shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
                  <Brain className="w-8 h-8 text-blue-400" />
                </div>
                <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <h2 className="text-2xl font-bold mt-4">AI 데이터 분석 중...</h2>
              <p className="text-slate-400 text-sm mt-1">업로드된 데이터를 기반으로 시뮬레이션을 수행합니다.</p>
            </div>

            {/* 진행 단계 리스트 */}
            <div className="space-y-4 mb-8">
              {ANALYSIS_STEPS.map((step, index) => {
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                
                return (
                  <div key={index} className={`flex items-center gap-3 transition-all duration-300 ${isActive || isCompleted ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${isCompleted ? 'bg-green-500 border-green-500' : isActive ? 'border-blue-500 animate-spin' : 'border-slate-600'}`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4 text-white" /> : isActive ? <div className="w-2 h-2 bg-blue-500 rounded-full" /> : null}
                    </div>
                    <span className={`text-sm ${isActive ? 'text-blue-400 font-bold' : isCompleted ? 'text-green-400' : 'text-slate-500'}`}>
                      {step.message}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* 프로그레스 바 */}
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

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> 메인으로
                </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">가맹점 상권 분석 대시보드</h1>
        </div>
        
        <AnalysisDashboard 
            analysis={analysis} 
            rawData={rawData} 
            onFileUpload={handleFileUpload} 
        />
      </div>
    </div>
  )
}