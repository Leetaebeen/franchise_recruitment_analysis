"use client"

import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle2, FileText, MapPin, Users, Wrench, Rocket, Gift, Clock, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function FranchiseProcessPage() {
  const steps = [
    {
      number: 1,
      title: "상담 신청 및 접수",
      description: "온라인 또는 전화로 상담을 신청하시면 24시간 내 전담 컨설턴트가 배정됩니다.",
      duration: "1일",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      details: [
        "온라인/전화/방문 상담 가능",
        "창업 계획 및 예산 상담",
        "지역별 시장 현황 안내",
        "가맹 조건 및 혜택 설명"
      ]
    },
    {
      number: 2,
      title: "상권 분석 및 입지 선정",
      description: "AI 빅데이터 기반으로 최적의 입지를 분석하고 3곳 이상의 후보지를 제안합니다.",
      duration: "3-5일",
      icon: MapPin,
      color: "from-purple-500 to-pink-500",
      details: [
        "빅데이터 상권 분석 리포트 제공",
        "유동인구 및 경쟁업체 조사",
        "3개 이상 후보지 비교 분석",
        "임대료 협상 지원"
      ]
    },
    {
      number: 3,
      title: "가맹 계약 체결",
      description: "본사와 가맹 계약을 체결하고 인테리어 설계를 시작합니다.",
      duration: "2-3일",
      icon: Users,
      color: "from-orange-500 to-red-500",
      details: [
        "가맹 계약서 작성 및 검토",
        "초기 투자 비용 안내",
        "인테리어 설계 미팅",
        "오픈 일정 수립"
      ]
    },
    {
      number: 4,
      title: "인테리어 및 시공",
      description: "전문 시공팀이 최신 트렌드를 반영한 인테리어를 진행합니다.",
      duration: "15-20일",
      icon: Wrench,
      color: "from-green-500 to-emerald-500",
      details: [
        "설계 도면 확정 및 승인",
        "전문 시공팀 배정",
        "고급 게이밍 장비 설치",
        "네트워크 및 시스템 구축"
      ]
    },
    {
      number: 5,
      title: "교육 및 운영 준비",
      description: "본사에서 점주 교육과 오픈 준비를 전방위로 지원합니다.",
      duration: "3-5일",
      icon: Gift,
      color: "from-indigo-500 to-purple-500",
      details: [
        "점주 및 직원 운영 교육",
        "POS 시스템 사용법 교육",
        "고객 응대 및 CS 교육",
        "오픈 마케팅 전략 수립"
      ]
    },
    {
      number: 6,
      title: "그랜드 오픈",
      description: "드디어 오픈! 본사의 전폭적인 마케팅 지원으로 성공적인 출발을 보장합니다.",
      duration: "D-Day",
      icon: Rocket,
      color: "from-pink-500 to-rose-500",
      details: [
        "오픈 이벤트 기획 및 진행",
        "온/오프라인 마케팅 지원",
        "본사 슈퍼바이저 현장 지원",
        "초기 운영 컨설팅 (3개월)"
      ]
    }
  ]

  const benefits = [
    {
      icon: DollarSign,
      title: "투자 비용",
      value: "1억 5천만원~",
      description: "지역과 규모에 따라 상이",
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: Clock,
      title: "총 소요 기간",
      value: "약 30-40일",
      description: "상담부터 오픈까지",
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: TrendingUp,
      title: "예상 손익분기점",
      value: "6-12개월",
      description: "입지에 따라 상이",
      color: "from-orange-600 to-red-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute top-1/3 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-blue-100/50 shadow-lg">
        <div className="container px-4 py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <Button variant="ghost" size="sm" className="rounded-full">
              <ArrowLeft className="w-5 h-5 mr-2" />
              홈으로
            </Button>
          </Link>
          <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
            선문<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">PC방</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container px-4 py-16 relative z-10">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-6 px-6 py-2 text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none shadow-lg">
            Franchise Process
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              가맹 절차 안내
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            상담부터 오픈까지, 선문PC방의 체계적인 창업 프로세스를 확인하세요.
            <br />
            전담 컨설턴트가 모든 단계를 함께합니다.
          </p>
        </motion.div>

        {/* Key Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-5xl mx-auto"
        >
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-center"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                <benefit.icon size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">{benefit.title}</h3>
              <p className={`text-3xl font-black bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent mb-1`}>
                {benefit.value}
              </p>
              <p className="text-sm text-slate-500">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Timeline */}
        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="relative mb-12 last:mb-0"
            >
              {/* Timeline line */}
              {index !== steps.length - 1 && (
                <div className="absolute left-8 md:left-12 top-24 bottom-0 w-1 bg-gradient-to-b from-blue-200 to-purple-200 -z-10" />
              )}

              <div className="flex gap-6 md:gap-8">
                {/* Step Number Circle */}
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-white shadow-2xl relative`}>
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75"></div>
                    <step.icon size={32} className="md:w-12 md:h-12" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 pb-8">
                  <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className={`mb-3 bg-gradient-to-r ${step.color} text-white border-none`}>
                          STEP {step.number}
                        </Badge>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                          {step.title}
                        </h3>
                      </div>
                      <Badge variant="outline" className="border-2 border-blue-200 text-blue-700 bg-blue-50 font-bold px-4 py-1 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {step.duration}
                      </Badge>
                    </div>

                    <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {step.details.map((detail, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                          <span className="text-slate-700 text-sm font-medium">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
              transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-3xl"
            />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                성공 창업의 여정,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  지금 시작하세요
                </span>
              </h2>
              <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
                전담 컨설턴트가 A부터 Z까지 함께합니다.
                <br />
                부담없이 상담 신청하세요.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/consultation">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-8 text-xl rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 font-black border-2 border-white/20"
                  >
                    무료 상담 신청하기
                  </Button>
                </Link>
                <Link href="/">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 px-12 py-8 text-xl rounded-full font-black backdrop-blur-md hover:scale-105 transition-all"
                  >
                    데이터 분석 보기
                  </Button>
                </Link>
              </div>

              <p className="mt-8 text-blue-200 text-sm">
                ✨ 상담 신청 시 30만원 상당의 상권 분석 리포트를 무료로 제공합니다
              </p>
            </div>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {[
            { title: "보증금 및 가맹비", desc: "지역별 상이, 상담 시 안내" },
            { title: "로열티", desc: "월 매출의 3% (VAT 별도)" },
            { title: "계약 기간", desc: "최초 3년 (재계약 가능)" }
          ].map((info, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/70 backdrop-blur-md border border-blue-100 text-center">
              <h4 className="font-bold text-slate-900 mb-2 text-lg">{info.title}</h4>
              <p className="text-slate-600 text-sm">{info.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
