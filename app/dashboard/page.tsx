"use client"

import { useState } from "react"
import Papa from "papaparse"
import { AnalysisDashboard } from "@/components/analysis-dashboard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function DashboardPage() {
  const [rawData, setRawData] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<any>(null)

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data
        setRawData(data)
        processAnalysis(data)
      },
    })
  }

  // 간단한 데이터 가공 로직 (화면 표시용)
  const processAnalysis = (data: any[]) => {
    const regionGroups = {} as any
    data.forEach((row: any) => {
       const region = row["region_city"] || row["지역_도시"]
       if(!regionGroups[region]) regionGroups[region] = { count:0, totalPayment:0 }
       regionGroups[region].count += 1
       regionGroups[region].totalPayment += Number(row["total_payment_may"] || row["5월_총결제금액"] || 0)
    })

    setAnalysis({
        bestPerformers: Object.keys(regionGroups).map(key => ({
            region: key,
            totalPayment: regionGroups[key].totalPayment,
            avgUsage: 226, 
            revisitRate: 65 
        })).sort((a,b) => b.totalPayment - a.totalPayment),
        regionAge: [] 
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> 메인으로
                </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">가맹점 상권 분석 대시보드</h1>
        </div>
        <AnalysisDashboard 
            analysis={analysis} 
            rawData={rawData} 
            onFileUpload={handleFileUpload} 
        />
      </div>
    </div>
  )
}