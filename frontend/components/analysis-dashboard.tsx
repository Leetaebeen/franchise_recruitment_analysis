"use client"

import { useMemo } from "react" // useMemo 추가

// ✅ Hook & Components
import { useAnalysisData } from "@/hooks/use-analysis-data"
import { SummaryMetrics } from "@/components/dashboard/summary-metrics"
import { RevenueSimulator } from "@/components/dashboard/revenue-simulator"
import { translateRegion } from "@/lib/utils"

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

  // ✅ [추가] 데이터 기반 시뮬레이터 초기값 계산
  const realHourlyRate = useMemo(() => {
    if (!rawData || rawData.length === 0) return 1200
    const totalPay = rawData.reduce((acc, row) => acc + (Number(row["5월_총결제금액"]) || 0), 0)
    const totalMin = rawData.reduce((acc, row) => acc + (Number(row["총_이용시간(분)"]) || 0), 0)
    if (totalMin === 0) return 1200
    return Math.round(totalPay / (totalMin / 60)) // 시급 = 총매출 / 총시간(hr)
  }, [rawData])

  const realAvgUsageHours = useMemo(() => {
    const avgMin = analysis.globalAvgUsage || 0
    return Number((avgMin / 60).toFixed(1)) // 분 -> 시간 (소수점 1자리)
  }, [analysis])

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
        avgUsage={analysis.globalAvgUsage || analysis.bestPerformers[0]?.avgUsage || 0} // 👈 전역 평균 우선 사용
        topRegion={translateRegion(analysis.bestPerformers[0]?.region) || "-"}
        topRegionRevenue={analysis.bestPerformers[0]?.totalPayment || 0}
      />

      {/* 🟢 섹션 2: 메인 차트 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 월별 매출 추이 */}
        <Card className="shadow-lg border-none ring-1 ring-slate-200/60 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">월별 매출 추이 (5-8월)</CardTitle>
                <CardDescription>시간에 따른 매출 변화와 재방문 고객 수를 추적합니다.</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Time Series</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMonthlyRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value: number) => `${value / 10000}만`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value:any) => [`${value.toLocaleString()}원`, "매출"]}
                    labelStyle={{ color: '#64748b', marginBottom: '0.5rem' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorMonthlyRevenue)" 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 재방문율 코호트 */}
        <Card className="shadow-lg border-none ring-1 ring-slate-200/60 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">재방문율 코호트 분석</CardTitle>
                <CardDescription>시간 경과에 따른 고객 충성도를 측정합니다.</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100">Cohort</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.cohortData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value:any) => [`${value}%`, "재방문율"]}
                  />
                  <Bar 
                    dataKey="rate" 
                    fill="#8b5cf6" 
                    radius={[6, 6, 0, 0]} 
                    barSize={40}
                  >
                    {chartData.cohortData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#8b5cf6" : "#a78bfa"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🟢 섹션 3: 지역별 상세 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 레이더 차트 */}
        <Card className="shadow-lg border-none ring-1 ring-slate-200/60 bg-white lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">지역별 경쟁력 분석</CardTitle>
            <CardDescription>주요 지표 3가지 비교</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData.radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="매출" dataKey="매출" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                  <Radar name="재방문" dataKey="재방문율" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                  <Radar name="시간" dataKey="이용시간" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.3} />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 막대 차트 */}
        <Card className="shadow-lg border-none ring-1 ring-slate-200/60 bg-white lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
               <div>
                  <CardTitle className="text-lg font-bold text-slate-800">지역별 예상 월 매출 TOP 10</CardTitle>
                  <CardDescription>객단가(1인당 평균 지출)가 가장 높은 지역 순위입니다.</CardDescription>
               </div>
               <Badge variant="secondary" className="bg-cyan-50 text-cyan-700 hover:bg-cyan-100">Ranking</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.regionData} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={80} 
                    tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value:any) => [`${value.toLocaleString()}만원`, "월 매출"]} 
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={24} background={{ fill: '#f1f5f9', radius: [0, 4, 4, 0] }}>
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
        <Card className="shadow-lg border-none ring-1 ring-slate-200/60 bg-white">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-800">연령대별 매출 기여도</CardTitle>
                <CardDescription>어떤 연령층이 가장 많은 매출을 발생시키나요?</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.ageData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 12, fill: '#64748b' }} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis 
                                tick={{ fontSize: 12, fill: '#64748b' }} 
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value: number) => `${value / 10000}만`}
                            />
                            <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                formatter={(value:any) => [`${value.toLocaleString()}원`, "매출"]}
                            />
                            <Bar dataKey="revenue" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={40}>
                                {chartData.ageData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#ec4899" : "#f472b6"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-lg border-none ring-1 ring-slate-200/60 bg-white">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-800">이용 시간 vs 결제 금액 상관관계</CardTitle>
                <CardDescription>오래 머무는 고객이 실제로 더 많이 지출할까요?</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                                type="number" 
                                dataKey="x" 
                                name="이용시간" 
                                unit="분" 
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis 
                                type="number" 
                                dataKey="y" 
                                name="결제금액" 
                                unit="원" 
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value: number) => `${value / 10000}만`}
                            />
                            <Tooltip 
                                cursor={{ strokeDasharray: "3 3" }} 
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                formatter={(value:any, name:any) => [
                                    name === '이용시간' ? `${value}분` : `${value.toLocaleString()}원`, 
                                    name === '이용시간' ? '이용 시간' : '결제 금액'
                                ]}
                            />
                            <Scatter name="고객" data={chartData.scatterData} fill="#8b5cf6" fillOpacity={0.6} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* 🔥 수익률 시뮬레이터 */}
      <div className="pt-8">
        <RevenueSimulator 
            initialHourlyRate={realHourlyRate}
            initialDailyHours={realAvgUsageHours}
        />
      </div>

    </div>
  )
}