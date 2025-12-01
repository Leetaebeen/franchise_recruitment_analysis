import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Map, TrendingUp } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-black text-primary">선문PC방</div>
          <nav className="hidden md:flex gap-6">
            <Link href="#" className="text-sm font-medium hover:text-primary">서비스 소개</Link>
            <Link href="/franchise-process" className="text-sm font-medium hover:text-primary">가맹 절차</Link>
            <Link href="/consultation" className="text-sm font-medium hover:text-primary">상담 신청</Link>
          </nav>
        </div>
      </header>

      <section className="py-20 lg:py-32 overflow-hidden relative">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
            데이터로 증명하는 <br />
            <span className="text-primary bg-primary/10 px-2 rounded-lg mt-2 inline-block">성공 창업의 기준</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            감으로 하는 창업은 끝났습니다. 2만 건의 빅데이터 분석을 통해
            사장님의 PC방 창업 성공 확률을 예측해 드립니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* 여기가 핵심: 버튼을 누르면 /dashboard 로 이동 */}
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                무료 상권 분석 시작하기 <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/consultation">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                전문가 상담 신청
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
            {[
                { icon: BarChart3, title: "매출 예측", desc: "실제 데이터를 기반으로 예상 월 매출을 산출합니다." },
                { icon: Map, title: "입지 분석", desc: "카카오맵 기반으로 최적의 입지를 시각화합니다." },
                { icon: TrendingUp, title: "성장성 평가", desc: "재방문율 데이터를 통해 지속 가능성을 진단합니다." },
            ].map((item, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                        <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-slate-600">{item.desc}</p>
                </div>
            ))}
        </div>
      </section>
    </div>
  )
}