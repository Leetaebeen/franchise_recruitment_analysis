"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calculator, TrendingUp, DollarSign, Users, Zap, Building } from "lucide-react"

interface RevenueSimulatorProps {
  initialHourlyRate?: number
  initialDailyHours?: number
}

export function RevenueSimulator({ initialHourlyRate, initialDailyHours }: RevenueSimulatorProps) {
  const [pcCount, setPcCount] = useState(80)
  const [hourlyRate, setHourlyRate] = useState(initialHourlyRate || 1200)
  const [dailyHours, setDailyHours] = useState(initialDailyHours || 8)
  const [rentCost, setRentCost] = useState(350) // 만원 단위

  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [monthlyCost, setMonthlyCost] = useState(0)
  const [netProfit, setNetProfit] = useState(0)
  const [laborCost, setLaborCost] = useState(0)
  const [utilityCost, setUtilityCost] = useState(0)
  const [rentCostValue, setRentCostValue] = useState(0)

  useEffect(() => {
    const revenue = pcCount * hourlyRate * dailyHours * 30 * 1.2 // 식음 매출 가중치 1.2 적용
    const labor = 4 * 2_000_000 // 직원 4명 가정
    const utility = pcCount * 30_000 // PC당 광열/전기
    const rent = rentCost * 10_000 // 만원 단위 입력

    const totalCost = labor + utility + rent
    const profit = revenue - totalCost

    setMonthlyRevenue(revenue)
    setLaborCost(labor)
    setUtilityCost(utility)
    setRentCostValue(rent)
    setMonthlyCost(totalCost)
    setNetProfit(profit)
  }, [pcCount, hourlyRate, dailyHours, rentCost])

  const formatMoney = (val: number) => Math.round(val / 10_000).toLocaleString()

  return (
    <Card className="shadow-lg border-none ring-1 ring-slate-200 bg-white">
      <CardHeader className="border-b bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Calculator className="w-6 h-6 text-primary" />
              매출/비용 시뮬레이터
            </CardTitle>
            <CardDescription>PC 대수, 요금, 운영시간, 임대료를 조정해 손익을 가늠해 보세요.</CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            Interactive Lab
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {initialHourlyRate && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3 text-sm text-blue-700">
            <Zap className="w-4 h-4 fill-blue-700" />
            <span>
              <strong>분석 결과 추천:</strong> 시간당 {initialHourlyRate.toLocaleString()}원, 일 평균 이용시간{" "}
              {initialDailyHours ?? 0}시간을 참고해 보세요.
            </span>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-8">
            {/* PC Count */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" /> PC 대수
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={pcCount}
                    onChange={(e) => setPcCount(Number(e.target.value))}
                    className="w-20 h-8 text-right"
                  />
                  <span className="text-sm text-slate-500 w-8">대</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-400 w-8 text-right">30</span>
                <Slider value={[pcCount]} max={200} min={30} step={10} onValueChange={(val) => setPcCount(val[0])} className="py-2 flex-1" />
                <span className="text-xs font-medium text-slate-400 w-8">200</span>
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" /> 시간당 요금
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-20 h-8 text-right"
                  />
                  <span className="text-sm text-slate-500 w-8">원</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-400 w-8 text-right">800</span>
                <Slider value={[hourlyRate]} max={2000} min={800} step={100} onValueChange={(val) => setHourlyRate(val[0])} className="py-2 flex-1" />
                <span className="text-xs font-medium text-slate-400 w-8">2000</span>
              </div>
            </div>

            {/* Daily Hours */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-400" /> 일 평균 이용시간
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-20 h-8 text-right"
                  />
                  <span className="text-sm text-slate-500 w-8">시간</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-400 w-8 text-right">1</span>
                <Slider value={[dailyHours]} max={24} min={1} step={0.5} onValueChange={(val) => setDailyHours(val[0])} className="py-2 flex-1" />
                <span className="text-xs font-medium text-slate-400 w-8">24</span>
              </div>
            </div>

            {/* Rent Cost */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-400" /> 월 임대료
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={rentCost}
                    onChange={(e) => setRentCost(Number(e.target.value))}
                    className="w-20 h-8 text-right"
                  />
                  <span className="text-sm text-slate-500 w-8">만원</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-400 w-8 text-right">100</span>
                <Slider value={[rentCost]} max={1000} min={100} step={10} onValueChange={(val) => setRentCost(val[0])} className="py-2 flex-1" />
                <span className="text-xs font-medium text-slate-400 w-8">1000</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 rounded-2xl p-6 text-white h-full flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 space-y-6">
                <div>
                  <h3 className="text-slate-400 font-medium text-xs uppercase tracking-wider mb-4">Monthly Projection</h3>

                  <div className="flex justify-between items-end mb-2">
                    <span className="text-slate-300 text-sm">예상 총매출</span>
                    <span className="text-2xl font-bold text-white">
                      {formatMoney(monthlyRevenue)} <span className="text-sm font-normal text-slate-500">만원</span>
                    </span>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-3 space-y-2 mb-4">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>인건비(4명)</span>
                      <span>-{formatMoney(laborCost)} 만원</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>광열/전기</span>
                      <span>-{formatMoney(utilityCost)} 만원</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>임대료</span>
                      <span>-{formatMoney(rentCostValue)} 만원</span>
                    </div>
                    <div className="border-t border-slate-700 pt-2 flex justify-between text-sm text-red-300 font-medium">
                      <span>총 비용</span>
                      <span>-{formatMoney(monthlyCost)} 만원</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-700" />

                <div>
                  <span className="text-slate-400 text-sm block mb-1">월 예상 순이익 (Net Profit)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                      {formatMoney(netProfit)}
                    </span>
                    <span className="text-xl font-bold text-green-500">만원</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    * 식음 매출을 20% 가정해 계산했습니다. <br />
                    * 운영 비용은 매장 상황에 따라 달라질 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
