"use client"

import { useState, useEffect, useRef } from "react"
import Papa from "papaparse"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, MapPin, ChevronDown, Trophy, Zap, PieChart } from "lucide-react"

// UI 컴포넌트 임포트
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnalysisDashboard } from "@/components/analysis-dashboard"
import KakaoMap from "@/components/kakao-map"

export default function PcBangFranchisePage() {
  // --- State 관리 ---
  const [activeSection, setActiveSection] = useState("hero")
  const [data, setData] = useState<any[]>([]) // CSV 원본 데이터
  const [loading, setLoading] = useState(false) // 로딩 상태
  const [fileUploaded, setFileUploaded] = useState(false) // 업로드 여부
  const [analysis, setAnalysis] = useState<any | null>(null) // 분석 결과 데이터
  const [isScrolled, setIsScrolled] = useState(false) // 스크롤 감지

  const resultsRef = useRef<HTMLDivElement>(null)

  // 스크롤 이벤트 리스너 (헤더 스타일 변경용)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // --- CSV 파싱 함수 ---
  const parseCSV = (csvText: string) => {
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // 숫자를 자동으로 Number 타입으로 변환
    })
    if (parsed && parsed.data) return parsed.data as any[]
    return []
  }

  // --- [핵심] 파일 업로드 핸들러 (데이터 변환 로직 포함) ---
  const handleFileUpload = (event: any) => {
    let file: File | null = null
    
    // 파일 객체 추출 (드래그앤드롭 또는 input 클릭 대응)
    if (event?.target?.files) {
      file = event.target.files[0]
    } else if (event instanceof File) {
      file = event
    } else if (event && event.length) {
      file = event[0]
    }

    if (!file) return

    setLoading(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      const csvData = e.target?.result as string
      const parsedData = parseCSV(csvData)

      // 👇 [수정됨] 영어 컬럼명을 한글로 변환하는 '데이터 통역' 과정
      // CSV 파일이 영어로 되어 있어도 코드가 이해할 수 있도록 한글 키로 매핑합니다.
      const mappedData = parsedData.map((row) => ({
        ...row, // 기존 데이터 유지
        "지역_도시": row["region_city"] || row["지역_도시"],
        "연령대": row["age_group"] || row["연령대"],
        "나이": row["age"] || row["나이"],
        "방문일수": row["visit_days"] || row["방문일수"],
        "총_이용시간(분)": row["total_duration_min"] || row["총_이용시간(분)"],
        "평균_이용시간(분)": row["avg_duration_min"] || row["평균_이용시간(분)"],
        "5월_총결제금액": row["total_payment_may"] || row["5월_총결제금액"],
        "6월_재방문여부": row["retained_june"] || row["6월_재방문여부"],
        "7월_재방문여부": row["retained_july"] || row["7월_재방문여부"],
        "8월_재방문여부": row["retained_august"] || row["8월_재방문여부"],
        "90일_재방문여부": row["retained_90"] || row["90일_재방문여부"],
        "사용자_ID": row["uid"] || row["사용자_ID"]
      }))

      // 유효한 데이터만 필터링 (필수 필드가 있는 경우만)
      const processedData = mappedData.filter(
        (row) =>
          row["지역_도시"] &&
          row["연령대"] &&
          (typeof row["총_이용시간(분)"] === "number" || !isNaN(Number(row["총_이용시간(분)"]))),
      )

      // 상태 업데이트
      setData(processedData)
      setFileUploaded(true)
      
      // 데이터 분석 실행
      analyzeData(processedData)
      setLoading(false)

      // 분석 결과 섹션으로 자동 스크롤
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 500)
    }

    reader.readAsText(file, "utf-8")
  }

  // --- 데이터 분석 로직 (지역별/연령별 그룹화) ---
  const analyzeData = (rawData: any[]) => {
    const groupedData: any   = {}

    rawData.forEach((row) => {
      const region = row["지역_도시"]?.toString().trim()
      const ageGroup = row["연령대"]?.toString().trim()

      if (!region || !ageGroup) return

      const key = `${region}-${ageGroup}`
      
      // 그룹 초기화
      if (!groupedData[key]) {
        groupedData[key] = {
          region: region,
          ageGroup: ageGroup,
          totalUsage: 0,
          avgUsageSum: 0,
          totalPayment: 0,
          revisitSum: 0,
          count: 0,
        }
      }

      // 데이터 집계
      const usage = Number(row["총_이용시간(분)"]) || 0
      const avgUsage = Number(row["평균_이용시간(분)"]) || 0
      const payment = Number(row["5월_총결제금액"]) || 0
      const revisit = Number(row["90일_재방문여부"]) || 0

      groupedData[key].totalUsage += usage
      groupedData[key].avgUsageSum += avgUsage
      groupedData[key].totalPayment += payment
      groupedData[key].revisitSum += revisit
      groupedData[key].count++
    })

    // 그룹화된 데이터를 배열로 변환 및 통계 계산
    const regionAgeData = Object.values(groupedData)
      .filter((group: any) => group.count > (fileUploaded ? 5 : 0)) // 표본이 너무 적은 그룹 제외
      .map((group: any) => {
        const avgPaymentPerUser = Math.round(group.totalPayment / group.count)
        // 예상 매출 계산 로직 (단순 예시)
        const estimatedMonthlyRevenue = Math.round(avgPaymentPerUser * Math.max(group.count, 50) * 30)

        return {
          region: group.region,
          ageGroup: group.ageGroup,
          totalUsage: Math.round(group.totalUsage / group.count),
          avgUsage: Math.round(group.avgUsageSum / group.count),
          avgPaymentPerUser: avgPaymentPerUser,
          totalPayment: estimatedMonthlyRevenue, // 예상 월 매출
          revisitRate: Math.round((group.revisitSum / group.count) * 100),
          sampleCount: group.count,
        }
      })
      .sort((a: any, b: any) => b.totalPayment - a.totalPayment)

    const bestPerformers = regionAgeData.slice(0, 3)
    const recommendations = generateRecommendations(bestPerformers)

    setAnalysis({
      regionAge: regionAgeData as any,
      bestPerformers: bestPerformers as any,
      recommendations,
    })
  }

  // --- 추천 시스템 로직 (지역 추천) ---
  const generateRecommendations = (topPerformers: any[]) => {
    const locationMap: any = {
      "서울-20대": ["홍익대학교", "성수역", "강남역"],
      "서울-30대": ["여의도역", "판교역", "강남역"],
      "부산-20대": ["서면역", "해운대역", "부산대학교"],
      "대구-20대": ["동성로", "경북대학교", "대구역"],
      "경기-20대": ["수원역", "분당 정자역", "일산 라페스타"],
      "강원-20대": ["강원대학교", "춘천역", "춘천명동"],
      "춘천-20대": ["강원대학교", "춘천역", "춘천명동"],
      "구리-20대": ["구리역", "갈매역", "구리시청"],
      "인천-20대": ["인천역", "부평역", "인하대학교"],
      "대전-20대": ["대전역", "유성구청", "충남대학교"],
      "광주-20대": ["광주역", "전남대학교", "충장로"],
      "울산-20대": ["울산대학교", "울산역", "삼산동"],
    }

    return topPerformers.map((rec: any, i: number) => {
      const key = `${rec.region}-${rec.ageGroup}`
      const fallbackLocations = [`${rec.region}역`, `${rec.region}시청`, `${rec.region} PC방`]
      const locations = locationMap[key] || fallbackLocations

      return {
        targetGroup: `${rec.region} ${rec.ageGroup}`,
        locations,
        expectedRevenue: rec.totalPayment,
        supportPackage: generateSupportPackage(rec),
      }
    })
  }

  // --- 마케팅 지원 패키지 생성 ---
  const generateSupportPackage = (performer: any) => {
    const packages = []
    if (performer.ageGroup === "20대") {
      packages.push("SNS (인스타/틱톡) 마케팅 50% 지원")
      packages.push("오픈 이벤트 할인 30% 본사 지원")
      packages.push("최고급 게이밍 기어 패키지 제공")
    } else if (performer.ageGroup === "30대") {
      packages.push("네이버 로컬 마케팅 지원")
      packages.push("프리미엄 F&B 메뉴 컨설팅")
      packages.push("직장인 타겟 점심 프로모션 지원")
    } else {
      packages.push("온라인 종합 마케팅 지원")
      packages.push("오픈 이벤트 할인 지원")
      packages.push("휴게 공간 인테리어 업그레이드")
    }
    return packages
  }

  // --- 렌더링 (UI) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 text-slate-900 selection:bg-blue-600 selection:text-white overflow-x-hidden font-sans">
      
      {/* 1. Header (Navigation) */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-xl shadow-xl border-b border-blue-100/50 py-4" : "bg-transparent py-6"}`}
      >
        <div className="container px-4 flex justify-between items-center">
          <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <Zap size={20} fill="currentColor" />
            </div>
            선문<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">PC방</span>
          </div>
          <Link href="/consultation">
            <Button variant={isScrolled ? "default" : "secondary"} className="rounded-full px-6">
              상담 문의
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-purple-500/10 to-transparent"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,black,rgba(255,255,255,0))] opacity-5"></div>

          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
            transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute top-1/3 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, -3, 0] }}
            transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"
          />
        </div>

        <div className="container relative z-10 px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge
              variant="secondary"
              className="mb-8 px-8 py-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 bg-white/80 backdrop-blur-md border-2 border-blue-200/50 hover:border-purple-200/50 transition-all text-base rounded-full shadow-lg shadow-blue-200/50 font-bold"
            >
              ✨ 2026년 1분기 가맹점 특별 모집 중
            </Badge>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter text-slate-900 leading-[1.1]">
              데이터 기반 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x">
                PC방 창업의 정석
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              빅데이터로 입증된{" "}
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 relative inline-block">
                절대 실패하지 않는 입지
                <span className="absolute bottom-1 left-0 w-full h-3 bg-gradient-to-r from-blue-200/50 to-purple-200/50 -z-10 blur-sm"></span>
              </span>
              를 제안합니다.
              <br />
              선문PC방과 함께라면 성공은 선택이 아닌 필수입니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-8 text-xl rounded-full shadow-2xl shadow-blue-500/50 transition-all hover:scale-110 hover:-translate-y-2 hover:shadow-3xl hover:shadow-purple-500/50 font-bold border-2 border-white/20"
                onClick={() => document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                무료 상권 분석 시작하기
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
              <Link href="/franchise-process">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-12 py-8 text-xl rounded-full border-2 border-blue-300/50 hover:border-purple-300/50 hover:bg-white/80 text-slate-700 bg-white/60 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all hover:scale-105 font-bold"
                >
                  가맹 절차 안내
                </Button>
              </Link>
            </div>

            <div className="mt-16 flex justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="font-bold text-xl text-slate-400">KAKAO DATA</div>
              <div className="font-bold text-xl text-slate-400">NICE BIZMAP</div>
              <div className="font-bold text-xl text-slate-400">KT BIGDATA</div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-slate-400">
          <ChevronDown size={32} />
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="py-24 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-b border-blue-100/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

        <div className="container px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: PieChart, title: "정밀 상권 분석", desc: "반경 500m 내 유동인구 및 소비 패턴 완벽 분석", gradient: "from-blue-500 to-cyan-500" },
              { icon: MapPin, title: "타겟 고객 매칭", desc: "연령별, 성별 선호도에 따른 맞춤형 마케팅 전략", gradient: "from-purple-500 to-pink-500" },
              { icon: Trophy, title: "매출 보장제", desc: "데이터 예측 매출 미달성 시 차액 보상 프로그램", gradient: "from-orange-500 to-red-500" },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center p-10 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 hover:bg-white/90 hover:border-blue-200/50 transition-all hover:scale-105 hover:shadow-2xl shadow-xl group"
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all`}>
                    <Icon size={36} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-base font-medium">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4. Analysis Dashboard Section (데이터 분석) */}
      <section id="analysis-section" className="py-32 relative bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/40 overflow-hidden" ref={resultsRef}>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="container px-4 relative z-10">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5 px-4 py-1">
              Big Data Analytics
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-900 tracking-tight">
              실시간 데이터{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                분석 대시보드
              </span>
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              보유하신 CSV 데이터를 업로드하거나, 제공되는 샘플 데이터를 통해
              <br />
              가장 확실한 성공 입지를 확인해보세요. 모든 분석은 <span className="font-bold text-slate-800">0.5초</span>{" "}
              내에 완료됩니다.
            </p>
          </div>

          {/* 분석 컴포넌트: 파일 업로드 및 차트 표시 */}
          <AnalysisDashboard analysis={analysis} rawData={data} onFileUpload={handleFileUpload} />
        </div>
      </section>

      {/* 5. Map Recommendation Section (지도 추천) */}
      <section className="py-32 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-br from-blue-100/30 to-purple-100/30 skew-x-12 transform translate-x-20"></div>

        <div className="container px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-10">
              <div className="space-y-6">
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 border-none px-6 py-2 text-sm font-black shadow-lg">
                  🎯 AI LOCATION TARGETING
                </Badge>
                <h2 className="text-5xl font-black text-slate-900 leading-[1.15]">
                  지도 위에서 확인하는 <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                    최적의 입지 포인트
                  </span>
                </h2>
                <p className="text-slate-600 text-xl leading-relaxed">
                  분석된 데이터를 바탕으로 카카오맵 API와 연동하여 가장 높은 예상 매출을 기록할 수 있는 구체적인 위치를
                  핀포인트로 추천해 드립니다.
                </p>
              </div>

              <div className="space-y-4">
                {analysis?.recommendations.slice(0, 3).map((rec: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border-2 border-white/50 shadow-2xl hover:shadow-3xl hover:border-blue-200/50 hover:bg-white/90 transition-all cursor-pointer group hover:scale-105"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-5">
                        <div
                          className={`flex items-center justify-center w-14 h-14 rounded-2xl text-white font-black text-xl shadow-xl ${i === 0 ? "bg-gradient-to-br from-blue-600 to-purple-600 shadow-blue-500/50" : "bg-gradient-to-br from-slate-400 to-slate-500"} group-hover:scale-110 transition-all`}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-xl group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                            {rec.targetGroup} 타겟 추천
                          </h4>
                          <p className="text-base text-slate-600 mt-2 font-semibold">{rec.locations.join(", ")}</p>
                        </div>
                      </div>
                      <div className="text-right pl-6 border-l-2 border-blue-100">
                        <span className="text-xs text-slate-500 font-black uppercase tracking-wider">
                          예상 월 매출
                        </span>
                        <p className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-1">
                          {Math.round(rec.expectedRevenue / 10000).toLocaleString()}만원+
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <KakaoMap locations={analysis ? analysis.recommendations.flatMap((r: any) => r.locations) : []} />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action (하단 배너) */}
      <section className="py-32 relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl"
        />

        <div className="container px-4 relative z-10 text-center">
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 mb-10 px-8 py-3 text-base font-black backdrop-blur-md shadow-xl">
            🔥 Limited Time Offer
          </Badge>
          <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tight leading-tight">
            성공까지 남은 거리 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 inline-block transform hover:scale-110 transition-transform duration-300">
              단 한 번의 클릭
            </span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/consultation">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 text-xl px-14 py-8 rounded-full shadow-2xl shadow-blue-500/40 font-black border-2 border-white/20 hover:scale-110 hover:-translate-y-2 transition-all"
              >
                지금 바로 가맹 상담 신청
              </Button>
            </Link>
            <Link href="/franchise-process">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 text-xl px-14 py-8 rounded-full font-black backdrop-blur-md hover:scale-105 transition-all shadow-xl"
              >
                가맹 절차 보기
              </Button>
            </Link>
          </div>
          <p className="mt-10 text-blue-200 text-base font-semibold bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 inline-block">
            ✨ 상담 신청 시 1:1 맞춤형 상권 분석 리포트를 무료로 제공해 드립니다.
          </p>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 text-slate-300 py-16 border-t border-blue-900/30 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

        <div className="container px-4 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-black tracking-tighter mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                <Zap size={20} fill="currentColor" />
              </div>
              선문<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">PC방</span>
            </div>
            <p className="max-w-xs text-sm text-slate-400 leading-relaxed">
              대한민국 No.1 데이터 기반 PC방 프랜차이즈. <br />
              성공의 기준을 바꾸고 있습니다.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-lg">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="hover:text-blue-400 transition-colors cursor-pointer">1544-0000</li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">contact@sunmunpc.com</li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">서울시 강남구 테헤란로 123</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-lg">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="hover:text-blue-400 transition-colors cursor-pointer">개인정보처리방침</li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">이용약관</li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">가맹점 안내</li>
            </ul>
          </div>
        </div>

        <div className="container px-4 mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500 relative z-10">
          © 2025 선문PC방. All rights reserved.
        </div>
      </footer>
    </div>
  )
}