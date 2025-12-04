"use client"

// ✅ Hook & Components
import { useAnalysisData } from "@/hooks/use-analysis-data"
import { SummaryMetrics } from "@/components/dashboard/summary-metrics"
import { RevenueSimulator } from "@/components/dashboard/revenue-simulator"

// ✅ Charts
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
  ScatterChart, Scatter, ZAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link" // 링크 추가
import { Button } from "@/components/ui/button" // 버튼 추가

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6", "#84cc16"]

interface AnalysisDashboardProps {
  analysis: any
  rawData: any[]
}

export function AnalysisDashboard({ analysis, rawData }: AnalysisDashboardProps) {
  const chartData = useAnalysisData(analysis, rawData)

  // 데이터가 없으면 "분석하러 가기" 버튼 표시
  if (!analysis || !chartData || rawData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">데이터가 없습니다.</h3>
        <p className="text-slate-500 mb-6">먼저 상권 분석 데이터를 업로드해주세요.</p>
        <Link href="/analysis">
            <Button size="lg">분석 시작하기</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 🟢 섹션 1: 핵심 지표 */}
      <SummaryMetrics 
        rawDataCount={rawData.length}
        expectedRevenue={chartData.expectedMonthlyRevenue}
        avgUsage={analysis.bestPerformers[0]?.avgUsage || 0}
        topRegion={analysis.bestPerformers[0]?.region || "-"}
      />

      {/* 🟢 섹션 2: 메인 차트 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 월별 매출 추이 */}
        <Card className="shadow-xl border-none ring-1 ring-blue-100 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-blue-900">월별 매출 추이 (5-8월)</CardTitle>
                <CardDescription>시간에 따른 매출 변화와 재방문 고객 수를 추적합니다.</CardDescription>
              </div>
              <Badge className="bg-blue-500 text-white">Time Series</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.monthlyTrend}>
                  <defs>
                    <linearGradient id="colorMonthlyRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value:any) => `${value.toLocaleString()}천원`} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMonthlyRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 재방문율 코호트 */}
        <Card className="shadow-xl border-none ring-1 ring-purple-100 bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-purple-900">재방문율 코호트 분석</CardTitle>
                <CardDescription>시간 경과에 따른 고객 충성도를 측정합니다.</CardDescription>
              </div>
              <Badge className="bg-purple-500 text-white">Cohort</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.cohortData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value:any) => `${value}%`} />
                  <Bar dataKey="rate" fill="#a855f7" radius={[8, 8, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🟢 섹션 3: 지역별 상세 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 레이더 차트 */}
        <Card className="shadow-xl border-none ring-1 ring-orange-100 bg-gradient-to-br from-white to-orange-50/30 lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-orange-900">지역별 경쟁력 분석</CardTitle>
            <CardDescription>주요 지표 3가지 비교</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData.radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="매출" dataKey="매출" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
                  <Radar name="재방문" dataKey="재방문율" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  <Radar name="시간" dataKey="이용시간" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 막대 차트 */}
        <Card className="shadow-xl border-none ring-1 ring-cyan-100 bg-gradient-to-br from-white to-cyan-50/30 lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
               <div>
                  <CardTitle className="text-xl font-bold text-cyan-900">지역별 예상 월 매출 TOP 10</CardTitle>
                  <CardDescription>가장 높은 수익이 예측되는 상위 지역입니다.</CardDescription>
               </div>
               <Badge className="bg-cyan-500 text-white">Ranking</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.regionData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value:any) => [`${value.toLocaleString()}만원`, "월 매출"]} />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={20}>
                    {chartData.regionData.map((entry:any, index:number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🟢 섹션 4: 연령대별 & 산점도 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl border-none ring-1 ring-pink-100 bg-gradient-to-br from-white to-pink-50/30">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-pink-900">연령대별 고객 분석</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.ageData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#ec4899" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-xl border-none ring-1 ring-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-indigo-900">상관관계 분석</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="x" name="이용시간" unit="분" />
                            <YAxis type="number" dataKey="y" name="결제금액" unit="원" />
                            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                            <Scatter name="고객" data={chartData.scatterData} fill="#8b5cf6" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* 🔥 수익률 시뮬레이터 */}
      <div className="pt-8">
        <RevenueSimulator />
      </div>

    </div>
  )
}