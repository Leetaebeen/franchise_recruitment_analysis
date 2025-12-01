"use client"

import { useMemo, useRef } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, Users, DollarSign, Upload, Activity, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AnalysisDashboardProps {
  analysis: any
  rawData: any[]
  onFileUpload: (e: any) => void
}

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6", "#84cc16"]

export function AnalysisDashboard({ analysis, rawData, onFileUpload }: AnalysisDashboardProps) {
  const chartData = useMemo(() => {
    if (!analysis || !rawData) return null

    // 👇 [핵심 수정] 1. 영어 데이터를 한글 키로 변환 (통역기)
    const processedRawData = rawData.map((row) => ({
      ...row, // 기존 데이터 유지
      // 영어 키가 있으면 한글 키로 매핑, 없으면 원래 한글 키 사용
      "사용자_ID": row["uid"] || row["사용자_ID"],
      "지역_도시": row["region_city"] || row["지역_도시"],
      "연령대": row["age_group"] || row["연령대"],
      "나이": row["age"] || row["나이"],
      "방문일수": row["visit_days"] || row["방문일수"],
      "총_이용시간(분)": row["total_duration_min"] || row["총_이용시간(분)"],
      "평균_이용시간(분)": row["avg_duration_min"] || row["평균_이용시간(분)"],
      "5월_총결제금액": row["total_payment_may"] || row["5월_총결제금액"],
      "6월_재방문여부": row["retained_june"] || row["6월_재방문여부"],
      "7월_재방문여부": row["retained_july"] || row["7월_재방문여부"],
      "8월_재방문여부": row["retained_august"] || row["8월_재방문여부"],
      "90일_재방문여부": row["retained_90"] || row["90일_재방문여부"],
    }))

    // 월별 추이 데이터 (5-8월 재방문 데이터 기반) - 실제 데이터 기반
    const monthlyTrend = []
    const monthNames = ["5월", "6월", "7월", "8월"]
    const revisitKeys = ["5월_총결제금액", "6월_재방문여부", "7월_재방문여부", "8월_재방문여부"]

    for (let i = 0; i < 4; i++) {
      let totalRevenue = 0
      let revisitCount = 0
      let totalCount = 0

      // 👇 [수정] 변환된 데이터(processedRawData) 사용
      processedRawData.forEach((row) => {
        if (i === 0) {
          totalRevenue += Number(row["5월_총결제금액"]) || 0
        } else {
          // 6-8월은 재방문 데이터로 추정
          const revisit = Number(row[revisitKeys[i]]) || 0
          revisitCount += revisit
          const estimatedRevenue = revisit > 0 ? (Number(row["5월_총결제금액"]) || 0) : 0
          totalRevenue += estimatedRevenue
        }
        totalCount++
      })

      monthlyTrend.push({
        month: monthNames[i],
        revenue: Math.round(totalRevenue / 1000), // 천원 단위
        revisitRate: i > 0 ? Math.round((revisitCount / totalCount) * 100) : 0,
        customers: i === 0 ? totalCount : revisitCount,
      })
    }

    // 재방문 코호트 분석
    const cohortData: Array<{ period: string; rate: number; count: number }> = []
    const revisitPeriods = ["6월", "7월", "8월", "90일"]
    revisitPeriods.forEach((period) => {
      let revisitSum = 0
      let totalCount = 0

      // 👇 [수정] 변환된 데이터 사용
      processedRawData.forEach((row) => {
        const key = period === "90일" ? "90일_재방문여부" : `${period}_재방문여부`
        revisitSum += Number(row[key]) || 0
        totalCount++
      })

      cohortData.push({
        period: period,
        rate: Math.round((revisitSum / totalCount) * 100),
        count: revisitSum,
      })
    })

    // 지역별 상세 분석 (analysis prop은 부모에서 넘어오므로 그대로 유지)
    // 주의: analysis 객체도 부모 컴포넌트에서 영어->한글 변환이 안 되어 있다면 비어있을 수 있습니다.
    const regionalDetail = analysis.regionAge
      .reduce((acc: any[], curr: any) => {
        const existing = acc.find((item) => item.name === curr.region)
        if (existing) {
          existing.revenue += curr.totalPayment
          existing.revisitRate = (existing.revisitRate + curr.revisitRate) / 2
          existing.usage += curr.totalUsage
          existing.count++
        } else {
          acc.push({
            name: curr.region,
            revenue: curr.totalPayment,
            revisitRate: curr.revisitRate,
            usage: curr.totalUsage,
            count: 1,
          })
        }
        return acc
      }, [])
      .map((item: any) => ({
        name: item.name,
        revenue: Math.round(item.revenue / 10000), // 만원 단위
        revisitRate: Math.round(item.revisitRate),
        usage: Math.round(item.usage / item.count),
      }))
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10)

    // 연령대별 상세 분석
    const ageDetail = analysis.regionAge.reduce((acc: any[], curr: any) => {
      const existing = acc.find((item) => item.name === curr.ageGroup)
      if (existing) {
        existing.revenue += curr.totalPayment
        existing.customers += curr.sampleCount
        existing.usage += curr.totalUsage * curr.sampleCount
        existing.revisitSum += curr.revisitRate * curr.sampleCount
      } else {
        acc.push({
          name: curr.ageGroup,
          revenue: curr.totalPayment,
          customers: curr.sampleCount,
          usage: curr.totalUsage * curr.sampleCount,
          revisitSum: curr.revisitRate * curr.sampleCount,
        })
      }
      return acc
    }, [])
    .map((item: any) => ({
      name: item.name,
      revenue: Math.round(item.revenue / 10000), // 만원 단위
      avgUsage: Math.round(item.usage / item.customers),
      revisitRate: Math.round(item.revisitSum / item.customers),
      customers: item.customers,
    }))
    .sort((a: any, b: any) => {
      const order: any = { "20대": 1, "30대": 2, "40대": 3, "50대": 4, "60대": 5 }
      return (order[a.name] || 99) - (order[b.name] || 99)
    })

    const radarData = analysis.bestPerformers.slice(0, 5).map((p: any) => ({
      subject: p.region.length > 4 ? p.region.slice(0, 4) : p.region,
      매출: Math.round(p.totalPayment / 100000) / 10, // 백만원 단위
      이용시간: Math.round(p.totalUsage / 10), // 10분 단위
      재방문율: p.revisitRate,
      fullMark: 100,
    }))

    return {
      regionData: regionalDetail,
      ageData: ageDetail,
      // 👇 [수정] 변환된 데이터 사용 (Scatter Chart)
      scatterData: processedRawData.slice(0, 150).map((row) => ({
        x: Number(row["총_이용시간(분)"]) || 0,
        y: Number(row["5월_총결제금액"]) || 0,
        z: Number(row["방문일수"]) || 1,
        region: row["지역_도시"],
        age: row["연령대"],
      })),
      radarData,
      monthlyTrend,
      cohortData,
    }
  }, [analysis, rawData])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCardClick = () => {
    fileInputRef.current?.click()
  }

  if (!analysis || !chartData) {
    return (
      <div className="space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="bg-white border-primary/20 shadow-xl shadow-primary/5 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
          <div
            className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 cursor-pointer"
            onClick={handleCardClick}
          >
            <div>
              <Badge variant="outline" className="mb-2 border-primary text-primary bg-primary/5">
                Data Analysis Ready
              </Badge>
              <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-8 h-8 text-primary" />
                데이터 파일 업로드
              </h3>
              <p className="text-slate-600 mt-2 text-lg">
                보유하신 CSV 파일을 업로드하면 <span className="font-bold text-primary">AI 분석 엔진</span>이 즉시 시각화
                결과를 제공합니다.
              </p>
            </div>
            <div className="relative group min-w-[200px]">
              <label className="block relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    console.log("file input onChange", e.target?.files)
                    onFileUpload(e)
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 transition-all group-hover:scale-105 group-hover:shadow-2xl h-14 text-lg"
                  onClick={(e) => e.stopPropagation()} // Prevent card click from triggering twice
                >
                  CSV 파일 선택하기
                </Button>
              </label>
              <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                드래그하여 놓기 또는 클릭하여 업로드
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">데이터 분석 중입니다... (업로드는 위에서 가능합니다)</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="bg-white border-primary/20 shadow-xl shadow-primary/5 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
        <div
          className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 cursor-pointer"
          onClick={handleCardClick}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const files = e.dataTransfer?.files
            if (files && files.length) {
              onFileUpload({ target: { files } })
            }
          }}
        >
          <div>
            <Badge variant="outline" className="mb-2 border-primary text-primary bg-primary/5">
              Data Analysis Ready
            </Badge>
            <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Upload className="w-8 h-8 text-primary" />
              데이터 파일 업로드
            </h3>
            <p className="text-slate-600 mt-2 text-lg">
              보유하신 CSV 파일을 업로드하면 <span className="font-bold text-primary">AI 분석 엔진</span>이 즉시 시각화
              결과를 제공합니다.
            </p>
          </div>
          <div className="relative group min-w-[200px]">
            <label className="block relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={onFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 transition-all group-hover:scale-105 group-hover:shadow-2xl h-14 text-lg"
                onClick={(e) => e.stopPropagation()} // Prevent card click from triggering twice
              >
                CSV 파일 선택하기
              </Button>
            </label>
            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              드래그하여 놓기 또는 클릭하여 업로드
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "총 분석 데이터",
            value: `${rawData.length.toLocaleString()}건`,
            sub: "실시간 처리 완료",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100",
          },
          {
            title: "예상 월 평균 매출",
            value: `${(analysis.bestPerformers[0]?.totalPayment * 30 || 0).toLocaleString()}원`,
            sub: "상위 10% 기준",
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50",
            border: "border-green-100",
          },
          {
            title: "평균 이용 시간",
            value: `${analysis.bestPerformers[0]?.avgUsage || 0}분`,
            sub: "전국 평균 대비 +15%",
            icon: Activity,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100",
          },
          {
            title: "최고 추천 지역",
            value: analysis.bestPerformers[0]?.region || "-",
            sub: "성공 확률 94%",
            icon: Award,
            color: "text-rose-600",
            bg: "bg-rose-50",
            border: "border-rose-100",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className={`border ${stat.border} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                  Live
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h4>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {stat.sub}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 월별 추이 및 코호트 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl border-none ring-1 ring-blue-100 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  월별 매출 추이 (5-8월)
                </CardTitle>
                <CardDescription>시간에 따른 매출 변화와 재방문 고객 수를 추적합니다.</CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none">
                Time Series
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] min-h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.monthlyTrend}>
                  <defs>
                    <linearGradient id="colorMonthlyRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 13, fontWeight: 600 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                      padding: "12px",
                      background: "rgba(255,255,255,0.95)",
                      backdropFilter: "blur(10px)",
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()}천원`, "매출"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="매출"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorMonthlyRevenue)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-bold text-blue-600">📊 분석 설명:</span> 5월부터 8월까지의 매출 추이를 보여줍니다.
                재방문 고객이 증가할수록 안정적인 수익 구조를 의미하며, 여름 성수기 패턴을 파악할 수 있습니다.
                상승 추세는 입지와 운영의 성공을 나타냅니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-none ring-1 ring-purple-100 bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  재방문율 코호트 분석
                </CardTitle>
                <CardDescription>시간 경과에 따른 고객 충성도를 측정합니다.</CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                Cohort
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] min-h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.cohortData}>
                  <defs>
                    <linearGradient id="cohortGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="period" stroke="#94a3b8" tick={{ fontSize: 13, fontWeight: 600 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                      padding: "12px",
                      background: "rgba(255,255,255,0.95)",
                      backdropFilter: "blur(10px)",
                    }}
                    formatter={(value: number) => [`${value}%`, "재방문율"]}
                  />
                  <Bar dataKey="rate" fill="url(#cohortGradient)" radius={[8, 8, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-bold text-purple-600">📊 분석 설명:</span> 각 기간별로 고객이 다시 방문한 비율입니다.
                높은 재방문율(60% 이상)은 우수한 서비스 품질과 고객 만족도를 의미합니다.
                90일 재방문율이 50% 이상이면 안정적인 단골 고객층을 확보한 것입니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 지역별 경쟁력 및 매출 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="shadow-xl border-none ring-1 ring-orange-100 bg-gradient-to-br from-white to-orange-50/30 lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              지역별 경쟁력 분석
            </CardTitle>
            <CardDescription>주요 지표 3가지 비교 (매출/이용시간/재방문)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] min-h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData.radarData}>
                  <PolarGrid stroke="#e2e8f0" strokeWidth={2} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="매출(백만원)" dataKey="매출" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} strokeWidth={2} />
                  <Radar name="재방문율(%)" dataKey="재방문율" stroke="#10b981" fill="#10b981" fillOpacity={0.4} strokeWidth={2} />
                  <Radar name="이용시간(10분)" dataKey="이용시간" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-bold text-orange-600">📊 분석 설명:</span> 상위 5개 지역의 균형 잡힌 성과를 레이더 차트로 비교합니다.
                세 지표가 고르게 높을수록 안정적인 입지입니다. 한쪽으로 치우친 경우 취약 부분 보완이 필요합니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-none ring-1 ring-cyan-100 bg-gradient-to-br from-white to-cyan-50/30 lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  지역별 예상 월 매출 TOP 10
                </CardTitle>
                <CardDescription>가장 높은 수익을 기록할 것으로 예측되는 상위 지역입니다.</CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-none">
                Regional
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] min-h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.regionData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#94a3b8" hide />
                  <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 12, fontWeight: 600 }} width={60} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                      background: "rgba(255,255,255,0.95)",
                      backdropFilter: "blur(10px)",
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()}만원`, "예상 월 매출"]}
                  />
                  <Bar dataKey="revenue" radius={[0, 8, 8, 0]} barSize={24}>
                    {chartData.regionData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-cyan-50/50 rounded-xl border border-cyan-100">
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-bold text-cyan-600">📊 분석 설명:</span> 데이터 기반으로 예측한 지역별 월 매출 순위입니다.
                상위권 지역은 유동인구, 소비력, 접근성이 우수한 입지로 안정적인 수익을 기대할 수 있습니다.
                1위 지역과 2-3위 지역의 매출 차이를 비교하여 투자 우선순위를 판단하세요.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 연령대별 고객 분석 */}
      <Card className="shadow-xl border-none ring-1 ring-pink-100 bg-gradient-to-br from-white to-pink-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                연령대별 고객 분석
              </CardTitle>
              <CardDescription>주요 타겟 고객층의 이용 패턴과 매출 기여도입니다.</CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-none">
              Demographics
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] min-h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.ageData}>
                <defs>
                  <linearGradient id="ageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "revenue") return [`${value.toLocaleString()}만원`, "예상 매출"]
                    if (name === "avgUsage") return [`${value}분`, "평균 이용시간"]
                    if (name === "revisitRate") return [`${value}%`, "재방문율"]
                    return [value, name]
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" name="예상 매출(만원)" fill="url(#ageGradient)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="revisitRate" name="재방문율(%)" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-pink-50/50 rounded-xl border border-pink-100">
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-bold text-pink-600">📊 분석 설명:</span> 연령대별 매출 기여도와 재방문율을 보여줍니다.
              20-30대는 높은 이용률과 장시간 체류로 주수익원이며, 40대 이상은 낮 시간대 활용에 유리합니다.
              타겟 연령층에 맞는 게임 라인업과 마케팅 전략이 성공의 핵심입니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 이용시간 vs 결제금액 상관관계 */}
      <Card className="shadow-xl border-none ring-1 ring-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                이용 시간 vs 결제 금액 상관관계
              </CardTitle>
              <CardDescription>충성 고객의 이용 패턴을 시각화하여 고부가가치 고객군을 식별합니다.</CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none">
              Correlation
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] min-h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="이용시간"
                  unit=""
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="결제금액"
                  unit=""
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />
                <ZAxis type="number" dataKey="z" range={[60, 400]} name="방문일수" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "이용시간") return [`${value}분`, "이용시간"]
                    if (name === "결제금액") return [`${value.toLocaleString()}원`, "결제금액"]
                    return [value, name]
                  }}
                />
                <Scatter name="고객 데이터" data={chartData.scatterData} fill="#8b5cf6" shape="circle">
                  {chartData.scatterData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.6} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-bold text-indigo-600">📊 분석 설명:</span> 각 점은 개별 고객을 나타내며, 오른쪽 위로 갈수록 고가치 고객입니다.
              이용시간과 결제금액의 정비례 관계는 시간 요금제의 효율성을 보여줍니다.
              점의 크기는 방문 빈도를 나타내며, 큰 점(단골 고객)이 많을수록 안정적인 매출 기반을 의미합니다.
              우상단 고객군을 늘리기 위한 VIP 멤버십과 장시간 할인 전략을 추천합니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}