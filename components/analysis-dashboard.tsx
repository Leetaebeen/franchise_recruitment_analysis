"use client"

import { useRef } from "react"

// ✅ 분리한 Hook과 Component 불러오기
import { useAnalysisData } from "@/hooks/use-analysis-data"
import { SummaryMetrics } from "@/components/dashboard/summary-metrics"

// ✅ 차트 라이브러리 (Recharts)
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
  ScatterChart, Scatter, ZAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area,
} from "recharts"

// ✅ UI 아이콘 및 컴포넌트
import { Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6", "#84cc16"]

interface AnalysisDashboardProps {
  analysis: any
  rawData: any[]
  onFileUpload: (e: any) => void
}

export function AnalysisDashboard({ analysis, rawData, onFileUpload }: AnalysisDashboardProps) {
  // 1. 데이터 계산 로직은 Hook으로 위임 (깔끔함 유지)
  const chartData = useAnalysisData(analysis, rawData)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCardClick = () => {
    fileInputRef.current?.click()
  }

  // 2. [로딩 상태] 데이터 분석 전 화면
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
                  onChange={(e) => onFileUpload(e)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Button size="lg" className="w-full h-14 text-lg" onClick={(e) => e.stopPropagation()}>
                  CSV 파일 선택하기
                </Button>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">데이터 분석 대기 중... (위에서 파일을 업로드해주세요)</p>
        </div>
      </div>
    )
  }

  // 3. [완료 상태] 분석 대시보드 화면
  return (
    <div className="space-y-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 🟢 섹션 1: 파일 재업로드 카드 (헤더 역할) */}
      <Card className="bg-white border-primary/20 shadow-xl shadow-primary/5 overflow-hidden relative">
         <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
         <div className="p-8 flex items-center justify-between relative z-10">
            <div>
               <h3 className="text-2xl font-bold flex items-center gap-2">
                 <Upload className="w-6 h-6 text-primary" /> 분석 완료
               </h3>
               <p className="text-slate-600">다른 데이터로 다시 분석하시려면 파일을 새로 업로드하세요.</p>
            </div>
            <div className="relative">
                <input ref={fileInputRef} type="file" accept=".csv" onChange={onFileUpload} className="hidden" />
                <Button onClick={handleCardClick} variant="outline">파일 다시 선택</Button>
            </div>
         </div>
      </Card>

      {/* 🟢 섹션 2: 핵심 지표 카드 (분리된 컴포넌트) */}
      <SummaryMetrics 
        rawDataCount={rawData.length}
        expectedRevenue={chartData.expectedMonthlyRevenue}
        avgUsage={analysis.bestPerformers[0]?.avgUsage || 0}
        topRegion={analysis.bestPerformers[0]?.region || "-"}
      />

      {/* 🟢 섹션 3: 메인 차트 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 3-1. 월별 매출 추이 (Area Chart) */}
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
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <b>📊 분석:</b> 상승 추세는 입지와 운영의 성공을 나타내며, 여름 성수기 패턴을 파악할 수 있습니다.
            </div>
          </CardContent>
        </Card>

        {/* 3-2. 재방문율 코호트 (Bar Chart) */}
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
            <div className="mt-4 p-3 bg-purple-50 rounded-lg text-sm text-purple-700">
              <b>📊 분석:</b> 90일 재방문율이 50% 이상이면 안정적인 단골 고객층을 확보한 것입니다.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🟢 섹션 4: 지역별 상세 분석 (Radar & Horizontal Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 4-1. 지역별 경쟁력 (Radar Chart) */}
        <Card className="shadow-xl border-none ring-1 ring-orange-100 bg-gradient-to-br from-white to-orange-50/30 lg:col-span-5">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-orange-900">지역별 경쟁력 분석</CardTitle>
            <CardDescription>주요 지표 3가지 비교 (매출/이용시간/재방문)</CardDescription>
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
            <div className="mt-4 p-3 bg-orange-50 rounded-lg text-sm text-orange-700">
              <b>📊 분석:</b> 삼각형의 면적이 넓을수록 균형 잡힌 우수 매장입니다.
            </div>
          </CardContent>
        </Card>

        {/* 4-2. 예상 매출 TOP 10 (Horizontal Bar Chart) */}
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
            <div className="mt-4 p-3 bg-cyan-50 rounded-lg text-sm text-cyan-700">
              <b>📊 분석:</b> 상위권 지역은 유동인구와 소비력이 검증된 곳입니다.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🟢 섹션 5: 연령대별 고객 분석 (Bar Chart) */}
      <Card className="shadow-xl border-none ring-1 ring-pink-100 bg-gradient-to-br from-white to-pink-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-pink-900">연령대별 고객 분석</CardTitle>
              <CardDescription>주요 타겟 고객층의 이용 패턴과 매출 기여도입니다.</CardDescription>
            </div>
            <Badge className="bg-pink-500 text-white">Demographics</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.ageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value:any, name:string) => (name === "revenue" ? `${value.toLocaleString()}만원` : `${value}%`)} />
                <Legend />
                <Bar dataKey="revenue" name="예상 매출(만원)" fill="#ec4899" radius={[6, 6, 0, 0]} />
                <Bar dataKey="revisitRate" name="재방문율(%)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-pink-50 rounded-lg text-sm text-pink-700">
            <b>📊 분석:</b> 20-30대는 메인 매출원, 40대 이상은 틈새 매출원입니다. 타겟에 맞는 게임 전략이 필요합니다.
          </div>
        </CardContent>
      </Card>

      {/* 🟢 섹션 6: 이용시간 vs 결제금액 상관관계 (Scatter Chart) */}
      <Card className="shadow-xl border-none ring-1 ring-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-indigo-900">이용 시간 vs 결제 금액 상관관계</CardTitle>
              <CardDescription>충성 고객의 이용 패턴을 시각화하여 고부가가치 고객군을 식별합니다.</CardDescription>
            </div>
            <Badge className="bg-indigo-500 text-white">Correlation</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="이용시간" unit="분" tick={{ fontSize: 12 }} />
                <YAxis type="number" dataKey="y" name="결제금액" unit="원" tick={{ fontSize: 12 }} />
                <ZAxis type="number" dataKey="z" range={[60, 400]} name="방문빈도" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter name="고객 데이터" data={chartData.scatterData} fill="#8b5cf6">
                  {chartData.scatterData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.6} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-700">
            <b>📊 분석:</b> 점이 크고 우상단에 위치할수록 VIP 고객입니다. 이들을 위한 멤버십 전략을 추천합니다.
          </div>
        </CardContent>
      </Card>

    </div>
  )
}