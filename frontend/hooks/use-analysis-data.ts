// hooks/use-analysis-data.ts

"use client"

import { useMemo } from "react"

export function useAnalysisData(analysis: any, rawData: any[]) {
  return useMemo(() => {
    if (!analysis || !rawData) return null

    // 1. 영어 데이터를 한글 키로 변환 (통역기)
    const processedRawData = rawData.map((row) => ({
      ...row,
      "사용자_ID": row["uid"] || row["사용자_ID"],
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
    }))

    // ✅ [핵심 수정] 예상 월 매출 재계산 로직
    // 기존 오류 수정: (평균 객단가) * (표준 매장 월 방문자 수 1,500명)
    const totalPaymentSum = processedRawData.reduce((acc, row) => acc + (Number(row["5월_총결제금액"]) || 0), 0)
    const avgPaymentPerUser = totalPaymentSum / (processedRawData.length || 1)
    const ESTIMATED_VISITORS = 1500 // 표준 PC방 월간 활성 사용자 수 가정
    const expectedMonthlyRevenue = Math.round(avgPaymentPerUser * ESTIMATED_VISITORS)

    // 월별 추이 데이터 (5-8월 재방문 데이터 기반)
    const monthlyTrend = []
    const monthNames = ["5월", "6월", "7월", "8월"]
    const revisitKeys = ["5월_총결제금액", "6월_재방문여부", "7월_재방문여부", "8월_재방문여부"]

    for (let i = 0; i < 4; i++) {
      let totalRevenue = 0
      let revisitCount = 0
      let totalCount = 0

      processedRawData.forEach((row) => {
        if (i === 0) {
          totalRevenue += Number(row["5월_총결제금액"]) || 0
        } else {
          const revisit = Number(row[revisitKeys[i]]) || 0
          revisitCount += revisit
          const estimatedRevenue = revisit > 0 ? (Number(row["5월_총결제금액"]) || 0) : 0
          totalRevenue += estimatedRevenue
        }
        totalCount++
      })

      monthlyTrend.push({
        month: monthNames[i],
        revenue: Math.round(totalRevenue / 1000), // 천원 단위
        revisitRate: i > 0 ? Math.round((revisitCount / totalCount) * 100) : 0,
        customers: i === 0 ? totalCount : revisitCount,
      })
    }

    // 재방문 코호트 분석
    const cohortData = ["6월", "7월", "8월", "90일"].map((period) => {
      let revisitSum = 0
      let totalCount = 0
      processedRawData.forEach((row) => {
        const key = period === "90일" ? "90일_재방문여부" : `${period}_재방문여부`
        revisitSum += Number(row[key]) || 0
        totalCount++
      })
      return {
        period: period,
        rate: Math.round((revisitSum / totalCount) * 100),
        count: revisitSum,
      }
    })

    // 지역별 상세 분석
    const regionData = analysis.regionAge
      .reduce((acc: any[], curr: any) => {
        const existing = acc.find((item) => item.name === curr.region)
        if (existing) {
          existing.revenue += curr.totalPayment
          existing.revisitRate = (existing.revisitRate + curr.revisitRate) / 2
          existing.usage += curr.totalUsage
          existing.count++
        } else {
          acc.push({
            name: curr.region,
            revenue: curr.totalPayment,
            revisitRate: curr.revisitRate,
            usage: curr.totalUsage,
            count: 1,
          })
        }
        return acc
      }, [])
      .map((item: any) => ({
        name: item.name,
        revenue: Math.round(item.revenue / 10000), // 만원 단위
        revisitRate: Math.round(item.revisitRate),
        usage: Math.round(item.usage / item.count),
      }))
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10)

    // 연령대별 상세 분석
    const ageData = analysis.regionAge.reduce((acc: any[], curr: any) => {
      const existing = acc.find((item) => item.name === curr.ageGroup)
      if (existing) {
        existing.revenue += curr.totalPayment
        existing.customers += curr.sampleCount
        existing.usage += curr.totalUsage * curr.sampleCount
        existing.revisitSum += curr.revisitRate * curr.sampleCount
      } else {
        acc.push({
          name: curr.ageGroup,
          revenue: curr.totalPayment,
          customers: curr.sampleCount,
          usage: curr.totalUsage * curr.sampleCount,
          revisitSum: curr.revisitRate * curr.sampleCount,
        })
      }
      return acc
    }, [])
    .map((item: any) => ({
      name: item.name,
      revenue: Math.round(item.revenue / 10000), // 만원 단위
      avgUsage: Math.round(item.usage / item.customers),
      revisitRate: Math.round(item.revisitSum / item.customers),
      customers: item.customers,
    }))
    .sort((a: any, b: any) => {
      const order: any = { "20대": 1, "30대": 2, "40대": 3, "50대": 4, "60대": 5 }
      return (order[a.name] || 99) - (order[b.name] || 99)
    })

    // 레이더 차트 데이터
    const radarData = analysis.bestPerformers.slice(0, 5).map((p: any) => ({
      subject: p.region.length > 4 ? p.region.slice(0, 4) : p.region,
      매출: Math.round(p.totalPayment / 100000) / 10, // 백만원 단위
      이용시간: Math.round(p.totalUsage / 10), // 10분 단위
      재방문율: p.revisitRate,
      fullMark: 100,
    }))

    // 산점도 데이터 (Scatter Chart)
    const scatterData = processedRawData.slice(0, 150).map((row) => ({
      x: Number(row["총_이용시간(분)"]) || 0,
      y: Number(row["5월_총결제금액"]) || 0,
      z: Number(row["방문일수"]) || 1,
      region: row["지역_도시"],
      age: row["연령대"],
    }))

    return {
      expectedMonthlyRevenue,
      regionData,
      ageData,
      scatterData,
      radarData,
      monthlyTrend,
      cohortData,
    }
  }, [analysis, rawData])
}