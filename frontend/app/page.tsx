"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Map, TrendingUp, User, LogOut } from "lucide-react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)

  // 페이지 로드 시 로그인 여부 확인 (토큰 유효성 검사 포함)
  useEffect(() => {
    const checkAuth = async () => {
      const user = Cookies.get("username")
      const token = Cookies.get("accessToken")

      if (user && token) {
        try {
          // 백엔드에 토큰 유효성 검사 요청
          const res = await fetch('http://localhost:8000/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (res.ok) {
            setUsername(user)
          } else {
            // 토큰이 유효하지 않음 (서버 재시작 등) -> 조용히 로그아웃 처리
            Cookies.remove("accessToken")
            Cookies.remove("username")
            setUsername(null)
          }
        } catch (e) {
          // 서버 연결 실패 시 -> 로그아웃 처리
          Cookies.remove("accessToken")
          Cookies.remove("username")
          setUsername(null)
        }
      }
    }
    
    checkAuth();
  }, [])

  // 로그아웃 핸들러
  const handleLogout = () => {
    Cookies.remove("accessToken")
    Cookies.remove("username")
    setUsername(null)
    alert("로그아웃 되었습니다.")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 섹션 */}
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-black text-primary cursor-pointer">
            <Link href="/">선문PC방</Link>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">서비스 소개</Link>
            <Link href="/franchise-process" className="text-sm font-medium hover:text-primary transition-colors">가맹 절차</Link>
            <Link href="/consultation" className="text-sm font-medium hover:text-primary transition-colors">상담 신청</Link>
          </nav>
          
          <div className="flex items-center gap-3">
             {username ? (
               // ✅ 로그인 상태일 때 보여줄 UI
               <div className="flex items-center gap-4">
                 <span className="font-bold text-slate-700 flex items-center gap-2">
                   <div className="bg-primary/10 p-1.5 rounded-full"><User className="w-4 h-4 text-primary" /></div>
                   {username}님
                 </span>
                 <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                   <LogOut className="w-4 h-4 mr-1" /> 로그아웃
                 </Button>
                 <Link href="/dashboard">
                    <Button size="sm">대시보드 가기</Button>
                 </Link>
               </div>
             ) : (
               // ❌ 비로그인 상태일 때 보여줄 UI
               <>
                 <Link href="/login">
                    <Button variant="ghost" size="sm">로그인</Button>
                 </Link>
                 <Link href="/signup">
                    <Button size="sm">회원가입</Button>
                 </Link>
               </>
             )}
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="py-20 lg:py-32 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            AI 기반 상권 분석 엔진 v2.0 업데이트
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            데이터로 증명하는 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">성공 창업의 기준</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            감이나 촉으로 하는 창업은 이제 끝났습니다.<br/>
            <strong>2만 건의 빅데이터 분석</strong>을 통해 사장님의 성공 확률을 예측해 드립니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* 로그인 여부에 따라 버튼 동작 변경 */}
            <Link href={username ? "/dashboard" : "/login"}>
              <Button size="lg" className="h-14 px-8 text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-transform bg-gradient-to-r from-primary to-purple-600 border-none">
                {username ? "내 분석 리포트 보기" : "무료 상권 분석 시작하기"} <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/consultation">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg hover:bg-slate-50">
                전문가 1:1 상담 신청
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">왜 선문PC방인가요?</h2>
                <p className="text-slate-600">데이터가 말해주는 확실한 차이를 경험하세요.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { icon: BarChart3, title: "정밀 매출 예측", desc: "주변 상권의 실제 결제 데이터를 기반으로 오차 범위 5% 이내의 예상 월 매출을 산출합니다." },
                    { icon: Map, title: "최적 입지 추천", desc: "유동인구, 경쟁점 현황, 배후 수요를 종합 분석하여 A급 입지를 지도에 시각화합니다." },
                    { icon: TrendingUp, title: "지속 가능성 평가", desc: "재방문율(Retention) 데이터를 분석하여 반짝 유행이 아닌 롱런하는 매장을 만듭니다." },
                ].map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl flex items-center justify-center text-primary mb-6">
                            <item.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                        <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  )
}