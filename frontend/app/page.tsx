"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { ArrowRight, BarChart3, Map, TrendingUp, User, LogOut, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardPreview } from "@/components/dashboard-preview"

export default function LandingPage() {
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const user = Cookies.get("username")
      const token = Cookies.get("accessToken")

      if (user && token) {
        try {
          const res = await fetch("http://localhost:8000/auth/verify", {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (res.ok) {
            setUsername(user)
          } else {
            Cookies.remove("accessToken")
            Cookies.remove("username")
            setUsername(null)
          }
        } catch (e) {
          Cookies.remove("accessToken")
          Cookies.remove("username")
          setUsername(null)
        }
      }
      setIsChecking(false)
    }

    checkAuth()
  }, [])

  const handleLogout = () => {
    Cookies.remove("accessToken")
    Cookies.remove("username")
    setUsername(null)
    alert("로그아웃 되었습니다.")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="fixed top-0 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-black text-white cursor-pointer flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <Link href="/">선문PC분석</Link>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              서비스 소개
            </Link>
            <Link href="/franchise-process" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              가맹 절차
            </Link>
            <Link href="/consultation" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              상담 신청
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {username ? (
              <div className="flex items-center gap-4">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <div className="bg-slate-800 p-1.5 rounded-full">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                  {username}님
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                  <LogOut className="w-4 h-4 mr-1" /> 로그아웃
                </Button>
                <Link href="/dashboard">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                    대시보드 이동
                  </Button>
                </Link>
              </div>
            ) : (
              !isChecking && (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10">
                      로그인
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-200">
                      회원가입
                    </Button>
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </header>

      {/* 히어로 */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI 기반 상권 분석 솔루션 2.0 출시</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
              데이터로 증명하는 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">성공적인 창업</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
              빅데이터와 AI 분석으로 최적 입지를 추천하고 예상 매출까지 제공합니다. 선문PC만의 차별화된 분석
              서비스를 경험해 보세요.
            </p>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/25">
                  무료로 분석 시작 <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/consultation">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-full">
                  바로 상담 신청
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-10 mb-20">
            <DashboardPreview />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-12">
            {[
              { label: "분석한 데이터", value: "1.2만", sub: "건" },
              { label: "가맹점 평균 매출 상승", value: "32", sub: "%" },
              { label: "AI 예측 정확도", value: "94.5", sub: "%" },
              { label: "누적 제휴 가맹점", value: "120+", sub: "지점" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                  <span className="text-lg text-slate-500 ml-1">{stat.sub}</span>
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">왜 선문PC 분석인가?</h2>
            <p className="text-slate-600">직관적인 지도로 빠르게 입지를 비교하고, AI로 예측까지 한번에.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Map className="w-8 h-8 text-blue-600" />,
                title: "초정밀 상권 분석",
                desc: "유동인구, 배후지, 경쟁업체 등 다각도로 100m 단위까지 분석합니다.",
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
                title: "AI 매출 예측",
                desc: "머신러닝 기반 모델로 요일/시간/연령별 매출을 94% 정확도로 예측합니다.",
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-emerald-600" />,
                title: "운영 리포트",
                desc: "매장 운영 현황을 실시간으로 점검하고, AI가 제안하는 운영 팁을 받아보세요.",
              },
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">지금 바로 성공적인 창업을 시작하세요</h2>
          <p className="text-slate-300 mb-10 max-w-2xl mx-auto">
            상담부터 입지 추천, 예상 매출까지 전 과정을 함께합니다. 상담 후 가맹비 면제 혜택을 확인하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation">
              <Button size="lg" className="h-14 px-8 bg-white text-slate-900 hover:bg-slate-100 text-lg font-bold">
                무료 상담 신청하기
              </Button>
            </Link>
            <Link href="/franchise-process">
              <Button size="lg" variant="outline" className="h-14 px-8 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white text-lg">
                가맹 절차 확인하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                선문PC
              </div>
              <p className="text-slate-500 text-sm">
                데이터 기반 프리미엄 PC방 창업 솔루션. 성공을 향한 확실한 길을 제시합니다.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">서비스</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#" className="hover:text-blue-400">
                    상권 분석
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-400">
                    매출 시뮬레이션
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-400">
                    가맹점 찾기
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">회사</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#" className="hover:text-blue-400">
                    회사 소개
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-400">
                    채용
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-400">
                    파트너 문의
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">고객지원</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#" className="hover:text-blue-400">
                    공지사항
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-400">
                    자주 묻는 질문
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-400">
                    1:1 문의
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-600">
            © 2024 Sunmoon PC Franchise. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
