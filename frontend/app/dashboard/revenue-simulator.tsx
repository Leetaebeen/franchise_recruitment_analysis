"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

export function RevenueSimulator() {
  // 시뮬레이션 변수들 (초기값)
  const [pcCount, setPcCount] = useState(80) // PC 대수
  const [hourlyRate, setHourlyRate] = useState(1200) // 시간당 요금
  const [dailyHours, setDailyHours] = useState(8) // 일 평균 가동 시간
  const [rentCost, setRentCost] = useState(350) // 월세 (만원)

  // 계산 결과 상태
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [monthlyCost, setMonthlyCost] = useState(0)
  const [netProfit, setNetProfit] = useState(0)

  // 숫자가 바뀔 때마다 자동 계산
  useEffect(() => {
    // 1. 월 매출 계산: PC대수 * 시간당요금 * 가동시간 * 30일
    // (부가수익률 20% 추가 가정)
    const revenue = pcCount * hourlyRate * dailyHours * 30 * 1.2
    
    // 2. 월 지출 계산
    // 인건비: 4명 * 200만원 (고정)
    // 전기세/유지비: PC 1대당 3만원
    // 월세: 입력값
    const laborCost = 4 * 2000000 
    const utilityCost = pcCount * 30000
    const rent = rentCost * 10000
    const totalCost = laborCost + utilityCost + rent

    // 3. 순수익
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
            {/* 🎛️ 왼쪽: 컨트롤러 (슬라이더) */}
            <div className="space-y-8">
                {/* 1. PC 대수 */}
                <div className="space-y-4">
                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>🖥️ PC 설치 대수</span>
                        <span className="text-primary">{pcCount}대</span>
                    </div>
                    <Slider 
                        defaultValue={[pcCount]} max={200} min={30} step={10} 
                        onValueChange={(val) => setPcCount(val[0])}
                        className="py-2"
                    />
                </div>

                {/* 2. 시간당 요금 */}
                <div className="space-y-4">
                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>💰 시간당 요금</span>
                        <span className="text-primary">{hourlyRate.toLocaleString()}원</span>
                    </div>
                    <Slider 
                        defaultValue={[hourlyRate]} max={2000} min={800} step={100} 
                        onValueChange={(val) => setHourlyRate(val[0])}
                        className="py-2"
                    />
                </div>

                {/* 3. 가동률 */}
                <div className="space-y-4">
                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>⏳ 일 평균 가동 시간</span>
                        <span className="text-primary">{dailyHours}시간</span>
                    </div>
                    <Slider 
                        defaultValue={[dailyHours]} max={24} min={1} step={0.5} 
                        onValueChange={(val) => setDailyHours(val[0])}
                        className="py-2"
                    />
                </div>

                {/* 4. 예상 월세 */}
                <div className="space-y-4">
                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>🏢 예상 월세</span>
                        <span className="text-primary">{rentCost.toLocaleString()}만원</span>
                    </div>
                    <Slider 
                        defaultValue={[rentCost]} max={1000} min={100} step={10} 
                        onValueChange={(val) => setRentCost(val[0])}
                        className="py-2"
                    />
                </div>
            </div>

            {/* 📊 오른쪽: 결과 패널 */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
                {/* 배경 효과 */}
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
                        <p className="text-xs text-slate-500 mt-2">
                            * 인건비, 전기세, 먹거리 부가수익이 포함된 추정치입니다.
                        </p>
                    </div>
                </div>

                <div className="mt-8 relative z-10">
                    <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
                        <TrendingUp className="w-4 h-4" />
                        <span>가동 시간을 1시간 늘리면 <strong>+{formatMoney(pcCount * hourlyRate * 30 * 1.2)}만원</strong> 더 법니다!</span>
                    </div>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}