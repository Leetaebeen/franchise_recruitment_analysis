"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, TrendingUp, MapPin, Users, ArrowRight } from "lucide-react"
import { translateRegion } from "@/lib/utils"
import { AnalysisResult, ChartData } from "@/hooks/use-analysis-data"

interface AiInsightBoardProps {
  analysis: AnalysisResult
  chartData: ChartData
}

export function AiInsightBoard({ analysis, chartData }: AiInsightBoardProps) {
  if (!analysis || !chartData) return null

  const bestRegion = analysis.bestPerformers?.[0]
  const bestRegionName = translateRegion(bestRegion?.region) || "추천 지역 없음"

  const ageData = chartData.ageData || []
  const targetAge = ageData.reduce((max: any, current: any) => (current.revenue > (max?.revenue || 0) ? current : max), null)

  const monthlyTrend = chartData.monthlyTrend || []
  const lastMonth = monthlyTrend[monthlyTrend.length - 1]?.revenue || 0
  const firstMonth = monthlyTrend[0]?.revenue || 0
  const growthRate = firstMonth > 0 ? ((lastMonth - firstMonth) / firstMonth) * 100 : 0
  const isGrowing = growthRate >= 0

  return (
    <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Lightbulb className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">AI 주요 인사이트</CardTitle>
              <CardDescription className="text-slate-400">데이터 기반 추천 포인트</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-blue-500/50 text-blue-400 bg-blue-500/10 px-3 py-1">
            AI Analysis
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                <MapPin className="w-4 h-4 text-emerald-400" />
                추천 지역
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{bestRegionName}</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              매출/재방문/이용시간 지표를 종합해 <span className="text-emerald-400 font-semibold">{bestRegionName}</span> 지역이
              최우선 입지로 추천됩니다.
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                <Users className="w-4 h-4 text-pink-400" />
                핵심 연령대
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{targetAge?.name || "데이터 부족"}</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              매출 기여도가 가장 높은 연령대는{" "}
              <span className="text-pink-400 font-semibold">{targetAge?.name || "해당 없음"}</span> 입니다. 타깃 프로모션을
              고려하세요.
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                성장 추이
              </div>
              <Badge className={isGrowing ? "bg-blue-500/20 text-blue-300" : "bg-red-500/20 text-red-300"}>
                {isGrowing ? "+" : ""}
                {growthRate.toFixed(1)}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{isGrowing ? "상승 곡선" : "감소 주의"}</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              최근 4개월 매출 기준 {isGrowing ? "우상향" : "하락"} 추세입니다. 마케팅 예산과 운영 시간을 조정해
              대응하세요.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
          <span>* 최근 4개월 데이터 기준으로 계산된 인사이트입니다.</span>
          <div className="flex items-center gap-1 hover:text-blue-400 cursor-pointer transition-colors">
            상세 리포트 보기 <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
