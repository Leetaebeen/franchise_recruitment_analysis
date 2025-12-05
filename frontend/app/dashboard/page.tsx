"use client"

import { useState, useEffect } from "react"
import { AnalysisDashboard } from "@/components/analysis-dashboard"
import AnalysisPage from "../analysis/page" // 👈 기존 분석 페이지 재사용
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Upload, FileBarChart, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

export default function DashboardPage() {
  const [rawData, setRawData] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasData, setHasData] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = Cookies.get("accessToken")
      
      const res = await fetch("http://localhost:8000/analysis/stats", {
        cache: "no-store", 
        headers: {
          "Authorization": `Bearer ${token}` 
        }
      })

      // 401: 토큰 만료/서버 재시작 -> 로그아웃
      if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
      
      // 500 등 기타 에러
      if (!res.ok) {
        throw new Error("SERVER_ERROR");
      }

      const stats = await res.json()

      if(stats && stats.success) {
          const totalSamples = stats.data.totalSamples || 0;
          
          if (totalSamples > 0) {
            setHasData(true);
            
            // 1. 실제 데이터 설정
            const realRawData = stats.data.rawData || [];
            setRawData(realRawData);

            // 2. 차트용 분석 데이터 가공
            const regionAgeData = realRawData.map((d: any) => ({
                region: d.regionCity || d.region_city || "Unknown",
                ageGroup: d.ageGroup || d.age_group || "Unknown", // 👈 추가: 연령대 정보
                totalPayment: d.totalPaymentMay || d.total_payment_may || 0,
                revisitRate: (d.retained90 || d.retained_90 || 0) * 100,
                totalUsage: d.totalDurationMin || d.total_duration_min || 0,
                sampleCount: 1 // 👈 추가: 집계용 카운트
            }));

            // 3. 지역별 매출 상위 5개 추출 (레이더 차트용)
            // 지역별로 그룹화하여 평균 계산
            const regionGroups = regionAgeData.reduce((acc: any, curr: any) => {
                const region = curr.region;
                if (!acc[region]) {
                    acc[region] = { region, totalPayment: 0, totalUsage: 0, revisitRate: 0, count: 0 };
                }
                acc[region].totalPayment += curr.totalPayment;
                acc[region].totalUsage += curr.totalUsage;
                acc[region].revisitRate += curr.revisitRate;
                acc[region].count += 1;
                return acc;
            }, {});

            const bestPerformers = Object.values(regionGroups)
                .map((g: any) => ({
                    region: g.region,
                    totalPayment: Math.round(g.totalPayment / g.count), // 평균 매출
                    avgUsage: Math.round(g.totalUsage / g.count),       // 평균 이용시간 (속성명 수정: totalUsage -> avgUsage)
                    revisitRate: Math.round(g.revisitRate / g.count)    // 평균 재방문율
                }))
                .sort((a: any, b: any) => b.totalPayment - a.totalPayment) // 매출 높은 순 정렬
                .slice(0, 5); // 상위 5개만

            setAnalysis({
                globalAvgUsage: stats.data.avgUsage, // 👈 전역 평균 이용시간 추가
                bestPerformers: bestPerformers.length > 0 ? bestPerformers : [{ 
                  region: "Seoul", 
                  totalPayment: stats.data.avgRevenue, 
                  avgUsage: stats.data.avgUsage, 
                  revisitRate: stats.data.avgRetention 
                }],
                regionAge: regionAgeData
            })
          } else {
            setHasData(false);
          }
      }
    } catch (e: any) {
      console.error("통계 로딩 실패:", e)

      // 👇 [핵심] 서버가 꺼져있거나(fetch fail), 인증 실패 시 강제 로그아웃
      if (e.message === "UNAUTHORIZED") {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        // 안전하게 로그아웃 처리
        Cookies.remove("accessToken")
        Cookies.remove("username")
        router.push("/login")
        return; // 여기서 함수 종료
      } else if (e.message === "SERVER_ERROR") {
        alert("서버 오류가 발생했습니다.");
      } else {
        // fetch 자체가 실패한 경우 (서버 꺼짐)
        alert("서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
      }
      
    } finally {
      setLoading(false)
    }
  }

  const handleResetData = async () => {
    if (!confirm("정말 모든 데이터를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.")) return;

    try {
      const token = Cookies.get("accessToken")
      const res = await fetch("http://localhost:8000/analysis/reset", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert("데이터가 초기화되었습니다.");
        setHasData(false);
        setRawData([]);
        setAnalysis(null);
      } else {
        alert("데이터 초기화 실패");
      }
    } catch (e) {
      console.error(e);
      alert("서버 오류");
    }
  }

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 데이터가 없을 때: 기존 AnalysisPage 컴포넌트를 그대로 보여줌 (재사용)
  if (!hasData) {
    return <AnalysisPage onSuccess={() => {
      setLoading(true);
      loadDashboardData();
    }} />
  }

  // 데이터가 있을 때: 대시보드 보여줌
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
                    가맹점 상권 분석 리포트
                </h1>
            </div>
            {/* 데이터가 있을 때만 상단 버튼들 표시 */}
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
