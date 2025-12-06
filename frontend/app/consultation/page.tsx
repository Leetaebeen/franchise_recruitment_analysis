"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, BarChart3, Map, Phone, User, Wallet, Building2 } from "lucide-react"

interface FormState {
  name: string
  phone: string
  area: string
  budget: string
  inquiry: string
}

export default function ConsultationPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    area: "",
    budget: "",
    inquiry: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("상담 신청이 접수되었습니다. 곧 연락드리겠습니다.")
    setForm({ name: "", phone: "", area: "", budget: "", inquiry: "" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="border-b border-white/10 sticky top-0 backdrop-blur-md bg-slate-950/80 z-20">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-black flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <Link href="/">선문PC</Link>
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-slate-200">
            <Link href="/franchise-process" className="hover:text-primary">
              가맹 절차
            </Link>
            <Link href="/dashboard" className="hover:text-primary">
              분석 대시보드
            </Link>
            <Link href="/consultation" className="hover:text-primary font-semibold text-primary">
              상담 신청
            </Link>
          </nav>
          <Link href="/" className="text-sm text-slate-300 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> 메인으로
          </Link>
        </div>
      </header>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: Form */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur">
            <p className="text-sm text-primary font-semibold mb-2">무료 상담 신청</p>
            <h1 className="text-3xl font-bold mb-2">입지/매출/운영 컨설팅을 받아보세요</h1>
            <p className="text-slate-300 text-sm mb-6">
              업로드하신 데이터와 상권 정보를 바탕으로 맞춤 리포트를 제공합니다. 연락처를 남겨주시면 24시간 이내에 연락드립니다.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm text-slate-200 flex items-center gap-2">
                    <User className="w-4 h-4" /> 이름
                  </span>
                  <Input name="name" value={form.name} onChange={handleChange} placeholder="홍길동" required />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-200 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> 연락처
                  </span>
                  <Input name="phone" value={form.phone} onChange={handleChange} placeholder="010-1234-5678" required />
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-sm text-slate-200 flex items-center gap-2">
                    <Map className="w-4 h-4" /> 희망 지역
                  </span>
                  <Input name="area" value={form.area} onChange={handleChange} placeholder="예: 서울 강남구" required />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-slate-200 flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> 예산
                  </span>
                  <Input name="budget" value={form.budget} onChange={handleChange} placeholder="예: 2억 ~ 3억" />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm text-slate-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> 문의 내용
                </span>
                <Textarea
                  name="inquiry"
                  value={form.inquiry}
                  onChange={handleChange}
                  placeholder="현재 상황과 궁금하신 점을 자유롭게 적어주세요."
                  rows={4}
                />
              </label>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>모든 정보는 상담 외 목적으로 사용되지 않습니다.</span>
                <Link href="/franchise-process" className="text-primary hover:underline flex items-center gap-1">
                  가맹 절차 보기 <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <Button type="submit" size="lg" className="w-full h-12 text-lg font-semibold mt-2">
                상담 신청하기
              </Button>
            </form>
          </div>

          {/* Right: Highlights */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-purple-500/20 border border-white/10 rounded-2xl p-8 shadow-2xl">
              <p className="text-sm text-primary font-semibold mb-2">왜 선문PC인가</p>
              <h2 className="text-2xl font-bold text-white mb-4">데이터 기반 맞춤 컨설팅</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "입지 후보 제안", desc: "매출·재방문·이용시간을 반영한 상위 입지 제안" },
                  { title: "예상 매출 리포트", desc: "업로드 데이터 기반 월 매출/손익 시뮬레이션" },
                  { title: "타깃 고객 전략", desc: "연령대별 강세 지역과 프로모션 가이드" },
                  { title: "운영 최적화", desc: "재방문율 향상을 위한 운영 시간/요금제 추천" },
                ].map((item, idx) => (
                  <div key={idx} className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <div className="text-xs text-slate-200 mt-1 leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-slate-200">
                * 현재 상담은 무료입니다. 업로드된 데이터 기준으로 맞춤 리포트를 제공합니다.
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "누적 상담", value: "2,300+", sub: "건" },
                { label: "평균 매출 상승", value: "32%", sub: "달성" },
                { label: "리포트 제공", value: "24H", sub: "이내" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-lg">
                  <div className="text-2xl font-bold text-white">
                    {stat.value} <span className="text-sm text-slate-300">{stat.sub}</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
