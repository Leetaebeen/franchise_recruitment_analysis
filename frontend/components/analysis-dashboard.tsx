"use client"

import { useMemo, useState, useCallback } from "react"
import Link from "next/link"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { useAnalysisData, AnalysisResult, AnalysisRow } from "@/hooks/use-analysis-data"
import { translateRegion } from "@/lib/utils"
import KakaoMap from "@/components/kakao-map"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SummaryMetrics } from "./dashboard/summary-metrics"
import { RevenueSimulator } from "./dashboard/revenue-simulator"
import { AiInsightBoard } from "./dashboard/ai-insight-board"

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6", "#84cc16"]

interface AnalysisDashboardProps {
  analysis: AnalysisResult | null
  rawData: AnalysisRow[]
  isLoading?: boolean
  error?: string | null
}

export function AnalysisDashboard({ analysis, rawData, isLoading, error }: AnalysisDashboardProps) {
  const [mapAge, setMapAge] = useState<"10대" | "20대" | "30대" | "40대+">("20대")
  const chartData = useAnalysisData(analysis, rawData)

  const realHourlyRate = useMemo(() => {
    if (!rawData || rawData.length === 0) return 1200
    const totalPay = rawData.reduce((acc, row) => acc + (Number((row as any).totalPaymentMay) || 0), 0)
    const totalMin = rawData.reduce((acc, row) => acc + (Number((row as any).totalDurationMin) || 0), 0)
    if (totalMin === 0) return 1200
    return Math.round(totalPay / (totalMin / 60))
  }, [rawData])

  const realAvgUsageHours = useMemo(() => {
    if (!analysis) return 0
    const avgMin = analysis.globalAvgUsage || 0
    return Number((avgMin / 60).toFixed(1))
  }, [analysis])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">데이터 불러오는 중...</h3>
        <p className="text-slate-500">잠시만 기다려 주세요.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border">
        <h3 className="text-xl font-semibold text-red-600 mb-2">데이터 로드 실패</h3>
        <p className="text-slate-500 mb-4">{error}</p>
        <Link href="/analysis">
          <Button size="lg">다시 시도</Button>
        </Link>
      </div>
    )
  }

  if (!analysis || !chartData || rawData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">분석 데이터가 없습니다.</h3>
        <p className="text-slate-500 mb-6">먼저 CSV를 업로드해 분석을 실행해 주세요.</p>
        <Link href="/analysis">
          <Button size="lg">분석 시작하기</Button>
        </Link>
      </div>
    )
  }

  const normalizeAgeGroup = useCallback((age: string) => {
    if (age === "Teens") return "10대"
    if (age === "Twenties") return "20대"
    if (age === "Thirties") return "30대"
    if (["Forties", "Fifties", "Sixties", "Seventies", "Forties+"].includes(age)) return "40대+"
    if (["10대", "20대", "30대", "40대", "50대", "60대", "70대"].includes(age)) {
      if (age === "40대") return "40대+"
      return age as any
    }
    return "기타"
  }, [])

  const ageRegionData = useMemo(() => {
    if (!analysis) return []
    const grouped: any = {}
    analysis.regionAge.forEach((item) => {
      const ageLabel = normalizeAgeGroup(item.ageGroup)
      const region = item.region
      if (!grouped[ageLabel]) grouped[ageLabel] = {}
      if (!grouped[ageLabel][region]) {
        grouped[ageLabel][region] = { region, totalPayment: 0, revisitRate: 0, usage: 0, count: 0 }
      }
      grouped[ageLabel][region].totalPayment += item.totalPayment
      grouped[ageLabel][region].revisitRate += item.revisitRate
      grouped[ageLabel][region].usage += item.totalUsage
      grouped[ageLabel][region].count += item.sampleCount || 1
    })
    return grouped
  }, [analysis, normalizeAgeGroup])

  const mapData = useMemo(() => {
    if (!ageRegionData[mapAge]) return []
    return Object.values(ageRegionData[mapAge]).map((g: any) => ({
      name: translateRegion(g.region),
      revenue: Math.round(g.totalPayment / 10000),
      revisitRate: Math.round(g.revisitRate / g.count),
      usage: Math.round(g.usage / g.count),
    })).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5)
  }, [ageRegionData, mapAge])

  const effectiveMapData = mapData.length > 0 ? mapData : chartData.regionData.slice(0, 5)
  const mapTitle = `타깃 고객 맵 - ${mapAge} 강세 지역 (TOP 5)`
  const mapSubtitle =
    mapData.length > 0
      ? `${mapAge} 매출/재방문/이용시간 지표가 높은 지역을 표시합니다.`
      : "선택한 연령대 데이터가 없어 전체 매출 상위 지역을 표시합니다."

  const topLocations = effectiveMapData.map((item: any) => item.name)
  const topRegions = chartData.regionData.slice(0, 3)

  return (
    <div className="space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 인사이트 보드 */}
      <AiInsightBoard analysis={analysis} chartData={chartData} />

      {/* 요약 */}
      <SummaryMetrics
        rawDataCount={rawData.length}
        expectedRevenue={chartData.expectedMonthlyRevenue}
        avgUsage={analysis.globalAvgUsage || analysis.bestPerformers[0]?.avgUsage || 0}
        topRegion={translateRegion(analysis.bestPerformers[0]?.region) || "-"}
        topRegionRevenue={analysis.bestPerformers[0]?.totalPayment || 0}
      />

      {/* 지도: 타깃 고객 맵 (연령대별 강세 지역) */}
      <Card className="shadow-lg border-none ring-1 ring-slate-200/60 bg-gradient-to-br from-white via-slate-50 to-slate-100 overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">{mapTitle}</CardTitle>
              <CardDescription>{mapSubtitle}</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100">
              Audience Map
            </Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {(["10대", "20대", "30대", "40대+"] as const).map((age) => (
              <Button
                key={age}
                variant={mapAge === age ? "default" : "outline"}
                size="sm"
                className={`h-8 ${mapAge === age ? "bg-blue-600 text-white" : "text-slate-600"}`}
                onClick={() => setMapAge(age)}
              >
                {age}
              </Button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {effectiveMapData.slice(0, 3).map((r: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 text-sm font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800">{r.name}</div>
                  <div className="text-xs text-slate-500 flex gap-3">
                    <span>매출 {r.revenue.toLocaleString()}만원</span>
                    <span>재방문 {r.revisitRate}%</span>
                    <span>이용 {r.usage}분</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full h-[600px]">
            <KakaoMap
              locations={topLocations}
              placesData={effectiveMapData.map((r: any) => ({
                name: r.name,
                revenue: r.revenue,
                revisitRate: r.revisitRate,
                usage: r.usage,
              }))}
              title={mapTitle}
              subtitle={mapSubtitle}
            />
          </div>
        </CardContent>
      </Card>

      {/* 월간/코호트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-none ring-1 ring-slate-200/60 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">월별 매출 & 방문자 추이</CardTitle>
                <CardDescription>매출(막대)과 방문/재방문(선)을 함께 확인하세요.</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                Mixed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData.monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMonthlyRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value: number) => `${value / 10000}만`}
                    label={{
                      value: "매출 (만원)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#94a3b8", fontSize: "10px" },
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: "#f97316" }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "방문자",
                      angle: 90,
                      position: "insideRight",
                      style: { fill: "#f97316", fontSize: "10px" },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any, name: any) => [
                      name === "revenue" ? `${value.toLocaleString()}원` : `${value}명`,
                      name === "revenue" ? "매출" : "방문자",
                    ]}
                    labelStyle={{ color: "#64748b", marginBottom: "0.5rem" }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMonthlyRevenue)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="customers"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#f97316", strokeWidth: 2, stroke: "#fff" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none ring-1 ring-slate-200/60 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">재방문율 코호트 분석</CardTitle>
                <CardDescription>전체 업로드 데이터 기준 재방문율(%)을 월별로 봅니다.</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                Cohort
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-2">기준: 업로드된 전체 고객 데이터 (재방문율 %)</p>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.cohortData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any) => [`${value}%`, "재방문율"]}
                  />
                  <Bar dataKey="rate" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40}>
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

      {/* 지역/연령 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="shadow-lg border-none ring-1 ring-slate-200/60 bg-white lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">지역별 경쟁력 분석</CardTitle>
            <CardDescription>상위 5지역 비교 (객단가: 백원, 이용시간: 분, 재방문율: %)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData.radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#475569", fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="객단가" dataKey="객단가" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.3} />
                  <Radar
                    name="평균 이용시간"
                    dataKey="평균 이용시간"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="#6366f1"
                    fillOpacity={0.3}
                  />
                  <Radar name="재방문율" dataKey="재방문율" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === "객단가") return [`${value.toLocaleString()}백원`, name]
                      if (name === "평균 이용시간") return [`${value}분`, name]
                      if (name === "재방문율") return [`${value}%`, name]
                      return [value, name]
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none ring-1 ring-slate-200/60 bg-white lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">지역별 예상 매출 TOP 10</CardTitle>
                <CardDescription>객단가 기준 상위 지역 순위</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-cyan-50 text-cyan-700 hover:bg-cyan-100">
                Ranking
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.regionData} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    tick={{ fontSize: 12, fill: "#475569", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any) => [`${value.toLocaleString()}만원`, "예상 매출"]}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={24} background={{ fill: "#f1f5f9", radius: [0, 4, 4, 0] }}>
                    {chartData.regionData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 연령/지불 상관 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-none ring-1 ring-slate-200/60 bg-white">
          <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-800">연령대별 매출 기여도</CardTitle>
                <CardDescription>단위: 매출(원, 합산), 기간: 업로드된 전체 데이터</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full flex">
              <div className="w-3/5 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.ageData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value: number) => `${value / 10000}만`}
                      label={{ value: "매출 (만원)", angle: -90, position: "insideLeft", style: { fill: "#94a3b8", fontSize: "10px" } }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: any) => [`${value.toLocaleString()}원`, "매출"]}
                    />
                    <Bar dataKey="revenue" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={30}>
                      {chartData.ageData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="w-2/5 h-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData.ageData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="revenue">
                      {chartData.ageData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value.toLocaleString()}원`, "매출"]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none ring-1 ring-slate-200/60 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">이용시간 vs 결제 금액 상관</CardTitle>
            <CardDescription>트렌드 라인으로 상관관계를 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="이용시간(분)"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: any) => {
                      if (typeof value !== "number" || value < 0) return ""
                      const hours = Math.floor(value / 60)
                      return `${hours}시간`
                    }}
                    domain={["auto", "auto"]}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="결제금액"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => `${value / 10000}만`}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === "이용시간") {
                        const hours = Math.floor(value / 60)
                        const mins = value % 60
                        return [`${hours}시간 ${mins}분`, "이용시간"]
                      }
                      return [`${value.toLocaleString()}원`, "결제 금액"]
                    }}
                  />
                  <Scatter name="고객" data={chartData.scatterData} fill="#8b5cf6" fillOpacity={0.5} />
                  <Line
                    type="monotone"
                    data={chartData.trendLineData}
                    dataKey="y"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                    name="추세선"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 시뮬레이터 */}
      <div className="pt-8">
        <RevenueSimulator initialHourlyRate={realHourlyRate} initialDailyHours={realAvgUsageHours} />
      </div>
    </div>
  )
}
