// components/dashboard/summary-metrics.tsx

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, DollarSign, Activity, Award } from "lucide-react"

interface SummaryMetricsProps {
  rawDataCount: number
  expectedRevenue: number
  avgUsage: number
  topRegion: string
  topRegionRevenue: number
}

export function SummaryMetrics({ rawDataCount, expectedRevenue, avgUsage, topRegion, topRegionRevenue }: SummaryMetricsProps) {
  const stats = [
    {
      title: "총 분석 데이터",
      value: `${rawDataCount.toLocaleString()}건`,
      sub: "실시간 처리 완료",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      title: "예상 월 평균 매출",
      value: `${expectedRevenue.toLocaleString()}원`,
      sub: "표준 매장 (월 1,500명) 기준",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
    },
    {
      title: "평균 이용 시간",
      value: `${avgUsage}분`,
      sub: "전국 평균 대비 +15%",
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
    {
      title: "최고 추천 지역",
      value: topRegion,
      sub: `객단가 1위 (${topRegionRevenue.toLocaleString()}원)`,
      icon: Award,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
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
  )
}