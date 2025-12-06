"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, FileBarChart, Trash2 } from "lucide-react"

import { AnalysisDashboard } from "@/components/analysis-dashboard"
import AnalysisPage from "../analysis/page"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [rawData, setRawData] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasData, setHasData] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const token = Cookies.get("accessToken")

      const res = await fetch("http://localhost:8000/analysis/stats", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 401) {
        throw new Error("UNAUTHORIZED")
      }
      if (!res.ok) {
        throw new Error("SERVER_ERROR")
      }

      const stats = await res.json()

      if (stats && stats.success) {
        const realRawData = stats.data.rawData || []
        const totalSamples = stats.data.totalSamples || realRawData.length || 0

        if (totalSamples > 0 && realRawData.length > 0) {
          setHasData(true)

          const regionAgeData = realRawData.map((d: any) => ({
            region: d.regionCity || d.region_city || "Unknown",
            ageGroup: d.ageGroup || d.age_group || "Unknown",
            totalPayment: d.totalPaymentMay || d.total_payment_may || 0,
            revisitRate: (d.retained90 || d.retained_90 || 0) * 100,
            totalUsage: d.totalDurationMin || d.total_duration_min || 0,
            sampleCount: 1,
          }))

          const regionGroups = regionAgeData.reduce((acc: any, curr: any) => {
            const region = curr.region
            if (!acc[region]) {
              acc[region] = { region, totalPayment: 0, totalUsage: 0, revisitRate: 0, count: 0 }
            }
            acc[region].totalPayment += curr.totalPayment
            acc[region].totalUsage += curr.totalUsage
            acc[region].revisitRate += curr.revisitRate
            acc[region].count += 1
            return acc
          }, {})

          const bestPerformers = Object.values(regionGroups)
            .map((g: any) => ({
              region: g.region,
              totalPayment: Math.round(g.totalPayment / g.count),
              avgUsage: Math.round(g.totalUsage / g.count),
              revisitRate: Math.round(g.revisitRate / g.count),
            }))
            .sort((a: any, b: any) => b.totalPayment - a.totalPayment)
            .slice(0, 5)

          setRawData(realRawData)
          setAnalysis({
            globalAvgUsage: stats.data.avgUsage,
            bestPerformers:
              bestPerformers.length > 0
                ? bestPerformers
                : [
                    {
                      region: "Seoul",
                      totalPayment: stats.data.avgRevenue,
                      avgUsage: stats.data.avgUsage,
                      revisitRate: stats.data.avgRetention,
                    },
                  ],
            regionAge: regionAgeData,
          })
        } else {
          setHasData(false)
        }
      }
    } catch (e: any) {
      console.error("통계 로드 실패:", e)

      if (e.message === "UNAUTHORIZED") {
        alert("세션이 만료되었습니다. 다시 로그인해 주세요.")
        Cookies.remove("accessToken")
        Cookies.remove("username")
        router.push("/login")
        return
      } else if (e.message === "SERVER_ERROR") {
        alert("서버 오류가 발생했습니다.")
      } else {
        alert("서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetData = async () => {
    if (!confirm("정말 모든 데이터를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.")) return

    try {
      const token = Cookies.get("accessToken")
      const res = await fetch("http://localhost:8000/analysis/reset", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        alert("데이터가 초기화되었습니다.")
        setHasData(false)
        setRawData([])
        setAnalysis(null)
      } else {
        alert("데이터 초기화에 실패했습니다.")
      }
    } catch (e) {
      console.error(e)
      alert("서버 오류")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <AnalysisPage
        onSuccess={() => {
          setLoading(true)
          loadDashboardData()
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> 메인으로
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileBarChart className="w-6 h-6 text-primary" />
              가맹점 분석 리포트
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleResetData} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-1" /> 데이터 초기화
            </Button>
            <Link href="/analysis">
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" /> 새 데이터 분석하기
              </Button>
            </Link>
          </div>
        </div>

        <AnalysisDashboard analysis={analysis} rawData={rawData} />
      </div>
    </div>
  )
}
