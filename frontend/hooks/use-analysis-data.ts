"use client"

import { useMemo } from "react"
import { translateRegion } from "@/lib/utils"

export interface AnalysisRow {
  uid: number
  regionCity: string
  ageGroup: string
  age: number
  visitDays: number
  totalDurationMin: number
  avgDurationMin: number
  totalPaymentMay: number
  retainedJune: number
  retainedJuly: number
  retainedAugust: number
  retained90: number
}

export interface RegionAgeStat {
  region: string
  ageGroup: string
  totalPayment: number
  totalUsage: number
  revisitRate: number
  sampleCount: number
}

export interface AnalysisResult {
  globalAvgUsage?: number
  bestPerformers: Array<{
    region: string
    totalPayment: number
    avgUsage: number
  }>
  regionAge: RegionAgeStat[]
}

export interface ChartData {
  expectedMonthlyRevenue: number
  regionData: Array<{ name: string; revenue: number; revisitRate: number; usage: number }>
  ageData: Array<{ name: string; revenue: number; avgUsage: number; revisitRate: number; customers: number }>
  scatterData: Array<{ x: number; y: number; z: number; region: string; age: string }>
  trendLineData: Array<{ x: number; y: number }>
  radarData: Array<{ subject: string; 객단가: number; "평균 이용시간": number; 재방문율: number }>
  monthlyTrend: Array<{ month: string; revenue: number; revisitRate: number; customers: number }>
  cohortData: Array<{ period: string; rate: number; count: number }>
}

const aliasMap: Record<keyof AnalysisRow, string[]> = {
  uid: ["uid", "user_id", "id"],
  regionCity: ["region_city", "regioncity", "regionCity", "region_city_group", "region_city_group_no", "region"],
  ageGroup: ["age_group", "agegroup", "ageGroup"],
  age: ["age"],
  visitDays: ["visit_days", "visitdays", "visitDays"],
  totalDurationMin: ["total_duration_min", "totaldurationmin", "totalDurationMin"],
  avgDurationMin: ["avg_duration_min", "avgdurationmin", "avgDurationMin"],
  totalPaymentMay: ["total_payment_may", "totalpaymentmay", "totalPaymentMay"],
  retainedJune: ["retained_june", "retainedjune", "retainedJune"],
  retainedJuly: ["retained_july", "retainedjuly", "retainedJuly"],
  retainedAugust: ["retained_august", "retainedaugust", "retainedAugust"],
  retained90: ["retained_90", "retained90", "retained_90d", "retained90d"],
}

function normalizeKey(key: string) {
  return key.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/\s+/g, "_")
}

function getValue(row: Record<string, any>, aliases: string[]) {
  for (const key of aliases) {
    if (row[key] !== undefined && row[key] !== null) return row[key]
  }
  return undefined
}

function normalizeRow(row: Record<string, any>): AnalysisRow | null {
  const normalizedRow: Record<string, any> = {}
  Object.keys(row).forEach((k) => {
    normalizedRow[normalizeKey(k)] = row[k]
  })

  const uid = getValue(normalizedRow, aliasMap.uid.map(normalizeKey))
  if (uid === undefined || uid === null) return null

  return {
    uid: Number(uid) || 0,
    regionCity: String(getValue(normalizedRow, aliasMap.regionCity.map(normalizeKey)) || "Unknown"),
    ageGroup: String(getValue(normalizedRow, aliasMap.ageGroup.map(normalizeKey)) || "Unknown"),
    age: Number(getValue(normalizedRow, aliasMap.age.map(normalizeKey)) || 0),
    visitDays: Number(getValue(normalizedRow, aliasMap.visitDays.map(normalizeKey)) || 0),
    totalDurationMin: Number(getValue(normalizedRow, aliasMap.totalDurationMin.map(normalizeKey)) || 0),
    avgDurationMin: Number(getValue(normalizedRow, aliasMap.avgDurationMin.map(normalizeKey)) || 0),
    totalPaymentMay: Number(getValue(normalizedRow, aliasMap.totalPaymentMay.map(normalizeKey)) || 0),
    retainedJune: Number(getValue(normalizedRow, aliasMap.retainedJune.map(normalizeKey)) || 0),
    retainedJuly: Number(getValue(normalizedRow, aliasMap.retainedJuly.map(normalizeKey)) || 0),
    retainedAugust: Number(getValue(normalizedRow, aliasMap.retainedAugust.map(normalizeKey)) || 0),
    retained90: Number(getValue(normalizedRow, aliasMap.retained90.map(normalizeKey)) || 0),
  }
}

export function useAnalysisData(analysis: AnalysisResult | null, rawData: Record<string, any>[]): ChartData | null {
  return useMemo(() => {
    if (!analysis || !rawData || rawData.length === 0) return null

    const processedRawData = rawData
      .map((row) => normalizeRow(row))
      .filter((row): row is AnalysisRow => !!row && row.uid > 0)

    if (processedRawData.length === 0) return null

    const totalPaymentSum = processedRawData.reduce((acc, row) => acc + row.totalPaymentMay, 0)
    const avgPaymentPerUser = totalPaymentSum / processedRawData.length
    const ESTIMATED_VISITORS = 1500
    const expectedMonthlyRevenue = Math.round(avgPaymentPerUser * ESTIMATED_VISITORS)

    const monthlyTrend = []
    const monthNames = ["5월", "6월", "7월", "8월"]
    const revisitKeys: Array<keyof AnalysisRow> = ["totalPaymentMay", "retainedJune", "retainedJuly", "retainedAugust"]

    for (let i = 0; i < 4; i++) {
      let totalRevenue = 0
      let revisitCount = 0
      let totalCount = 0

      processedRawData.forEach((row) => {
        if (i === 0) {
          totalRevenue += row.totalPaymentMay
          revisitCount += 0
        } else {
          const revisit = Number(row[revisitKeys[i]]) || 0
          revisitCount += revisit
          totalRevenue += revisit > 0 ? row.totalPaymentMay : 0
        }
        totalCount++
      })

      monthlyTrend.push({
        month: monthNames[i],
        revenue: Math.round(totalRevenue / 1000),
        revisitRate: i > 0 ? Math.round((revisitCount / totalCount) * 100) : 0,
        customers: i === 0 ? totalCount : revisitCount,
      })
    }

    const cohortPeriods = [
      { label: "6월", key: "retainedJune" as const },
      { label: "7월", key: "retainedJuly" as const },
      { label: "8월", key: "retainedAugust" as const },
      { label: "90일", key: "retained90" as const },
    ]

    const cohortData = cohortPeriods.map((period) => {
      let revisitSum = 0
      let totalCount = 0
      processedRawData.forEach((row) => {
        revisitSum += row[period.key]
        totalCount++
      })
      return {
        period: period.label,
        rate: Math.round((revisitSum / totalCount) * 100),
        count: revisitSum,
      }
    })

    const aggregatedRegionData = analysis.regionAge.reduce((acc: any[], curr) => {
      const existing = acc.find((item) => item.name === curr.region)
      if (existing) {
        existing.revenue += curr.totalPayment
        existing.revisitSum += curr.revisitRate
        existing.usage += curr.totalUsage
        existing.count++
      } else {
        acc.push({
          name: curr.region,
          revenue: curr.totalPayment,
          revisitSum: curr.revisitRate,
          usage: curr.totalUsage,
          count: 1,
        })
      }
      return acc
    }, [])

    const regionData = aggregatedRegionData
      .map((item: any) => ({
        name: translateRegion(item.name),
        revenue: Math.round(item.revenue / 10000),
        revisitRate: Math.round(item.revisitSum / item.count),
        usage: Math.round(item.usage / item.count),
      }))
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10)

    const ageData = analysis.regionAge
      .reduce((acc: any[], curr) => {
        let ageGroup = curr.ageGroup
        if (ageGroup === "Teens") ageGroup = "10대"
        else if (ageGroup === "Twenties") ageGroup = "20대"
        else if (ageGroup === "Thirties") ageGroup = "30대"
        else if (["Forties", "Fifties", "Sixties", "Seventies", "Forties+"].includes(ageGroup)) ageGroup = "40대+"
        else if (["40대", "50대", "60대", "70대"].includes(ageGroup)) ageGroup = "40대+"

        const existing = acc.find((item) => item.name === ageGroup)
        if (existing) {
          existing.revenue += curr.totalPayment
          existing.customers += curr.sampleCount
          existing.usage += curr.totalUsage * curr.sampleCount
          existing.revisitSum += curr.revisitRate * curr.sampleCount
        } else {
          acc.push({
            name: ageGroup,
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
        revenue: Math.round(item.revenue / 10000),
        avgUsage: Math.round(item.usage / item.customers),
        revisitRate: Math.round(item.revisitSum / item.customers),
        customers: item.customers,
      }))
      .sort((a: any, b: any) => {
        const order: any = { "10대": 1, "20대": 2, "30대": 3, "40대+": 4 }
        return (order[a.name] || 99) - (order[b.name] || 99)
      })

    const radarData = aggregatedRegionData
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((item: any) => ({
        subject: translateRegion(item.name),
        객단가: Math.round(item.revenue / item.count / 100),
        "평균 이용시간": Math.round(item.usage / item.count),
        재방문율: Math.round(item.revisitSum / item.count),
      }))

    const scatterData = processedRawData.slice(0, 150).map((row) => ({
      x: row.totalDurationMin,
      y: row.totalPaymentMay,
      z: row.visitDays || 1,
      region: row.regionCity,
      age: row.ageGroup,
    }))

    let trendLineData: { x: number; y: number }[] = []
    if (scatterData.length > 1) {
      const n = scatterData.length
      let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumXX = 0
      let minX = Infinity,
        maxX = -Infinity

      scatterData.forEach((p) => {
        sumX += p.x
        sumY += p.y
        sumXY += p.x * p.y
        sumXX += p.x * p.x
        if (p.x < minX) minX = p.x
        if (p.x > maxX) maxX = p.x
      })

      const denom = n * sumXX - sumX * sumX
      if (denom !== 0) {
        const slope = (n * sumXY - sumX * sumY) / denom
        const intercept = (sumY - slope * sumX) / n
        trendLineData = [
          { x: minX, y: slope * minX + intercept },
          { x: maxX, y: slope * maxX + intercept },
        ]
      }
    }

    return {
      expectedMonthlyRevenue,
      regionData,
      ageData,
      scatterData,
      trendLineData,
      radarData,
      monthlyTrend,
      cohortData,
    }
  }, [analysis, rawData])
}
