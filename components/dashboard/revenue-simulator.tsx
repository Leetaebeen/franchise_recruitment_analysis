"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

export function RevenueSimulator() {
  const [pcCount, setPcCount] = useState(80)
  const [hourlyRate, setHourlyRate] = useState(1200)
  const [dailyHours, setDailyHours] = useState(8)
  const [rentCost, setRentCost] = useState(350)

  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [monthlyCost, setMonthlyCost] = useState(0)
  const [netProfit, setNetProfit] = useState(0)

  useEffect(() => {
    const revenue = pcCount * hourlyRate * dailyHours * 30 * 1.2
    const laborCost = 4 * 2000000 
    const utilityCost = pcCount * 30000
    const rent = rentCost * 10000
    const totalCost = laborCost + utilityCost + rent
    const profit = revenue - totalCost

    setMonthlyRevenue(revenue)
    setMonthlyCost(totalCost)
    setNetProfit(profit)
  }, [pcCount, hourlyRate, dailyHours, rentCost])

  const formatMoney = (val: number) => {
    return (Math.round(val / 10000)).toLocaleString()
  }

  return (
    <Card className="shadow-xl border-none ring-1 ring-slate-200 bg-white">
      <CardHeader className="border-b bg-slate-50/50">
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                    <Calculator className="w-6 h-6 text-primary" />
                    창업 수익률 시뮬레이터
                </CardTitle>
                <CardDescription>
                    매장 규모와 요금 설정을 변경하여 예상 순수익을 계산해보세요.
                </CardDescription>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                Interactive Lab
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
                <div className="space-y-4">
                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>🖥️ PC 설치 대수</span>
                        <span className="text-primary">{pcCount}대</span>
                    </div>
                    <Slider defaultValue={[pcCount]} max={200} min={30} step={10} onValueChange={(val) => setPcCount(val[0])} className="py-2" />
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>💰 시간당 요금</span>
                        <span className="text-primary">{hourlyRate.toLocaleString()}원</span>
                    </div>
                    <Slider defaultValue={[hourlyRate]} max={2000} min={800} step={100} onValueChange={(val) => setHourlyRate(val[0])} className="py-2" />
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>⏳ 일 평균 가동 시간</span>
                        <span className="text-primary">{dailyHours}시간</span>
                    </div>
                    <Slider defaultValue={[dailyHours]} max={24} min={1} step={0.5} onValueChange={(val) => setDailyHours(val[0])} className="py-2" />
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>🏢 예상 월세</span>
                        <span className="text-primary">{rentCost.toLocaleString()}만원</span>
                    </div>
                    <Slider defaultValue={[rentCost]} max={1000} min={100} step={10} onValueChange={(val) => setRentCost(val[0])} className="py-2" />
                </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="space-y-6 relative z-10">
                    <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wider border-b border-slate-700 pb-2">Simulation Result</h3>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-300">예상 월 매출</span>
                        <span className="text-xl font-bold flex items-center gap-1">
                            {formatMoney(monthlyRevenue)} <span className="text-sm font-normal text-slate-500">만원</span>
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-red-300">
                        <span className="flex items-center gap-2"><TrendingDown className="w-4 h-4" /> 예상 월 지출</span>
                        <span className="text-xl font-bold flex items-center gap-1">
                            - {formatMoney(monthlyCost)} <span className="text-sm font-normal text-slate-500 text-red-300/50">만원</span>
                        </span>
                    </div>
                    <div className="w-full h-px bg-slate-700 my-4"></div>
                    <div className="space-y-2">
                        <span className="text-slate-400 block">예상 월 순수익 (Net Profit)</span>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                                {formatMoney(netProfit)}
                            </span>
                            <span className="text-xl font-bold text-green-500 mb-2">만원</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">* 인건비, 전기세, 먹거리 부가수익 포함 추정치</p>
                    </div>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}