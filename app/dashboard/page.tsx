"use client"

import { useState, useEffect } from "react"
import { AnalysisDashboard } from "@/components/analysis-dashboard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Upload, FileBarChart } from "lucide-react"

export default function DashboardPage() {
  const [rawData, setRawData] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 페이지 들어오면 DB에서 데이터 가져오기
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await fetch("http://localhost:8000/analysis/stats")
      const stats = await res.json()

      if(stats && stats.success) {
          const dummyData = Array(stats.data.totalSamples || 0).fill(0).map(() => ({})) 
          setRawData(dummyData)
          
          setAnalysis({
              bestPerformers: [{ 
                region: "Seoul", 
                totalPayment: stats.data.avgRevenue, 
                avgUsage: stats.data.avgUsage, 
                revisitRate: stats.data.avgRetention 
              }],
              regionAge: []
          })
      }
    } catch (e) {
      console.error("통계 로딩 실패:", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 헤더: 메인으로 가기 & 새 분석 하기 */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> 메인으로
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <FileBarChart className="w-6 h-6 text-primary" />
                    가맹점 상권 분석 리포트
                </h1>
            </div>
            
            <Link href="/analysis">
                <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" /> 새 데이터 분석하기
                </Button>
            </Link>
        </div>
        
        {/* 로딩 중일 때 */}
        {loading && (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        )}

        {/* 분석 대시보드 (차트) */}
        {!loading && (
            <AnalysisDashboard 
                analysis={analysis} 
                rawData={rawData} 
            />
        )}
      </div>
    </div>
  )
}