"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  { name: "1월", value: 4000 },
  { name: "2월", value: 3000 },
  { name: "3월", value: 2000 },
  { name: "4월", value: 2780 },
  { name: "5월", value: 1890 },
  { name: "6월", value: 2390 },
  { name: "7월", value: 3490 },
]

export function DashboardPreview() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative w-full max-w-5xl mx-auto"
      style={{ perspective: "1200px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D 시점 효과 컨테이너 */}
      <div
        className="relative bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden transition-all duration-700 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isHovered ? "rotateX(0deg) scale(1)" : "rotateX(12deg) scale(0.95)",
        }}
      >
        {/* 상단 바 */}
        <div className="h-12 bg-slate-800/50 border-b border-slate-700 flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="ml-4 px-3 py-1 bg-slate-950/50 rounded-md text-xs text-slate-400 font-mono flex-1 text-center">
            sunmoon-pc-analysis.ai/dashboard
          </div>
        </div>

        {/* 주요 대시보드 요약 */}
        <div className="p-6 grid grid-cols-3 gap-4 bg-slate-950/80 backdrop-blur-sm">
          {/* 좌측: 메인 차트 */}
          <div className="col-span-2 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "총 매출", value: "₩45,231,000", delta: "+12.5%" },
                { label: "방문 수", value: "18,420명", delta: "+4.2%" },
                { label: "평균 이용시간", value: "3.1시간", delta: "+9.8%" },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                  <div className="text-xl font-bold text-white">{item.value}</div>
                  <div className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                    {item.delta} <span className="text-slate-600">vs 지난달</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 h-64">
              <div className="text-sm font-bold text-slate-300 mb-4">월별 매출 추이</div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#475569"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${v / 1000}k`}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 우측: 지역별 하이라이트 */}
          <div className="space-y-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 h-full">
              <div className="text-sm font-bold text-slate-300 mb-4">Top Regions</div>
              <div className="space-y-3">
                {[
                  { name: "강남", val: 85 },
                  { name: "홍대", val: 72 },
                  { name: "이태원", val: 64 },
                  { name: "부산", val: 58 },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{item.name}</span>
                      <span>{item.val}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 반사 효과 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* 그림자 효과 */}
      <div
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] h-20 bg-blue-500/20 blur-[100px] rounded-full -z-10 transition-all duration-700"
        style={{
          opacity: isHovered ? 0.8 : 0.5,
          transform: isHovered ? "translate(-50%, 0) scale(1.1)" : "translate(-50%, 0) scale(1)",
        }}
      />
    </div>
  )
}
