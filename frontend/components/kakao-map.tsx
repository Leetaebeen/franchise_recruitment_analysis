"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { MapPin, Navigation, Search } from "lucide-react"
import { cn } from "@/lib/utils"

// 간단 좌표 매핑 (API 429 방지용 기본 좌표)
const STATIC_COORDS: Record<string, { lat: number; lng: number }> = {
  서울: { lat: 37.5665, lng: 126.978 },
  부산: { lat: 35.1796, lng: 129.0756 },
  인천: { lat: 37.4563, lng: 126.7052 },
  대구: { lat: 35.8714, lng: 128.6014 },
  대전: { lat: 36.3504, lng: 127.3845 },
  광주: { lat: 35.1595, lng: 126.8526 },
  울산: { lat: 35.5384, lng: 129.3114 },
  세종: { lat: 36.4801, lng: 127.2892 },
  수원: { lat: 37.2636, lng: 127.0286 },
  성남: { lat: 37.4201, lng: 127.1268 },
  고양: { lat: 37.6584, lng: 126.832 },
  용인: { lat: 37.2411, lng: 127.1776 },
  창원: { lat: 35.228, lng: 128.681 },
  청주: { lat: 36.6424, lng: 127.489 },
  전주: { lat: 35.8242, lng: 127.1477 },
  천안: { lat: 36.8151, lng: 127.1139 },
  춘천: { lat: 37.8813, lng: 127.7298 },
  평택: { lat: 36.994, lng: 127.0889 },
  제주: { lat: 33.4996, lng: 126.5312 },
  포항: { lat: 36.019, lng: 129.3435 },
  안산: { lat: 37.3219, lng: 126.8309 },
  안양: { lat: 37.3943, lng: 126.9568 },
  부천: { lat: 37.5034, lng: 126.766 },
  김포: { lat: 37.6153, lng: 126.7155 },
  파주: { lat: 37.7603, lng: 126.7798 },
  의정부: { lat: 37.7381, lng: 127.0337 },
  강릉: { lat: 37.7519, lng: 128.8761 },
  광명: { lat: 37.478, lng: 126.8643 },
  전주시: { lat: 35.8242, lng: 127.1477 },
}

const searchCache = new Map<string, { lat: number; lng: number; address: string }>()
const CACHE_KEY = "kakao_coord_cache_v1"

const formatMinutes = (mins?: number | string) => {
  const total = Number(mins) || 0
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h <= 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}

interface MapPlace {
  name: string
  revenue?: number
  revisitRate?: number
  usage?: number
}

interface Props {
  locations?: string[]
  placesData?: MapPlace[]
  title?: string
  subtitle?: string
}

interface Place {
  id: number
  name: string
  address: string
  lat: number
  lng: number
}

export default function KakaoMap({ locations = [], placesData = [], title, subtitle }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isSdkLoaded, setIsSdkLoaded] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [customOverlays, setCustomOverlays] = useState<any[]>([])
  const [searchDone, setSearchDone] = useState(false)
  const [cacheReady, setCacheReady] = useState(false)

  const API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY

  // 로컬 캐시 불러오기
  useEffect(() => {
    if (cacheReady) return
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        Object.entries(parsed || {}).forEach(([k, v]: any) => {
          if (v?.lat && v?.lng) searchCache.set(k, { lat: v.lat, lng: v.lng, address: v.address || k })
        })
      }
    } catch (e) {
      console.warn("좌표 캐시 로드 실패", e)
    } finally {
      setCacheReady(true)
    }
  }, [cacheReady])

  const persistCache = () => {
    try {
      const obj: Record<string, any> = {}
      searchCache.forEach((v, k) => {
        obj[k] = v
      })
      localStorage.setItem(CACHE_KEY, JSON.stringify(obj))
    } catch (e) {
      console.warn("좌표 캐시 저장 실패", e)
    }
  }

  // 1. SDK 로드 확인
  useEffect(() => {
    const checkSdk = () => {
      const kakao = (window as any).kakao
      if (kakao && kakao.maps) {
        kakao.maps.load(() => setIsSdkLoaded(true))
        return true
      }
      return false
    }
    if (checkSdk()) return
    const interval = setInterval(() => {
      if (checkSdk()) clearInterval(interval)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // 2. 지도 초기화
  useEffect(() => {
    const keywords = placesData.length > 0 ? placesData.map((p) => p.name) : locations
    if (!isSdkLoaded || !mapRef.current || keywords.length === 0) return

    const kakao = (window as any).kakao
    
    // 지도 생성 (한 번만)
    if (!mapInstance) {
      const options = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567),
        level: 7,
      }
      const map = new kakao.maps.Map(mapRef.current, options)
      
      // 컨트롤 추가
      const zoomControl = new kakao.maps.ZoomControl()
      map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT)
      const mapTypeControl = new kakao.maps.MapTypeControl()
      map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT)
      
      setMapInstance(map)
    }
  }, [isSdkLoaded])

  // 3. 장소 검색 및 마커 표시 (지도 인스턴스가 있을 때)
  useEffect(() => {
    const keywordsRaw = placesData.length > 0 ? placesData.map((p) => p.name) : locations
    const keywords = Array.from(new Set(keywordsRaw)) // 중복 제거
    if (!mapInstance || keywords.length === 0 || searchDone || !cacheReady) return

    const kakao = (window as any).kakao
    const ps = new kakao.maps.services.Places()
    const bounds = new kakao.maps.LatLngBounds()
    
    // 기존 마커/오버레이 제거
    markers.forEach(m => m.setMap(null))
    customOverlays.forEach(o => o.setMap(null))
    setMarkers([])
    setCustomOverlays([])

    const newPlaces: Place[] = []
    const newMarkers: any[] = []
    const newOverlays: any[] = []

    let searchCount = 0

    keywords.forEach((keyword, index) => {
      const cached = searchCache.get(keyword)
      const staticCoord = STATIC_COORDS[keyword]

      const finalize = (lat: number, lng: number, address: string) => {
        const coords = new kakao.maps.LatLng(lat, lng)
        newPlaces.push({
          id: index,
          name: keyword,
          address,
          lat,
          lng
        })
        const content = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background-color: #3b82f6;
            color: white;
            border-radius: 50%;
            font-size: 14px;
            font-weight: 800;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">${index + 1}</div>
        `
        const customOverlay = new kakao.maps.CustomOverlay({
          position: coords,
          content: content,
          yAnchor: 1
        })
        customOverlay.setMap(mapInstance)
        newOverlays.push(customOverlay)
        bounds.extend(coords)
      }

      if (cached) {
        searchCount++
        finalize(cached.lat, cached.lng, cached.address)
        if (searchCount === keywords.length) {
          newPlaces.sort((a, b) => a.id - b.id)
          setPlaces(newPlaces)
          setCustomOverlays(newOverlays)
          if (newPlaces.length > 0) mapInstance.setBounds(bounds)
          persistCache()
          setSearchDone(true)
        }
        return
      }

      if (staticCoord) {
        searchCount++
        finalize(staticCoord.lat, staticCoord.lng, keyword)
        searchCache.set(keyword, { lat: staticCoord.lat, lng: staticCoord.lng, address: keyword })
        if (searchCount === keywords.length) {
          newPlaces.sort((a, b) => a.id - b.id)
          setPlaces(newPlaces)
          setCustomOverlays(newOverlays)
          if (newPlaces.length > 0) mapInstance.setBounds(bounds)
          persistCache()
          setSearchDone(true)
        }
        return
      }

      ps.keywordSearch(keyword, (result: any, status: any) => {
        searchCount++
        
        if (status === kakao.maps.services.Status.OK && result[0]) {
          const place = result[0]
          finalize(place.y, place.x, place.road_address_name || place.address_name)
          searchCache.set(keyword, { lat: place.y, lng: place.x, address: place.road_address_name || place.address_name })
        }

        if (searchCount === keywords.length) {
          newPlaces.sort((a, b) => a.id - b.id)
          setPlaces(newPlaces)
          setCustomOverlays(newOverlays)
          if (newPlaces.length > 0) {
            mapInstance.setBounds(bounds)
          }
          persistCache()
          setSearchDone(true)
        }
      })
    })
  }, [mapInstance, locations, placesData, searchDone, cacheReady])

  useEffect(() => {
    // 키워드 변경 시 재검색 가능하도록 리셋
    setSearchDone(false)
  }, [locations, placesData])

  // 장소 선택 핸들러
  const handleSelectPlace = (place: Place) => {
    if (!mapInstance) return
    const kakao = (window as any).kakao
    const moveLatLon = new kakao.maps.LatLng(place.lat, place.lng)
    
    mapInstance.panTo(moveLatLon)
    setSelectedPlaceId(place.id)

    // 인포윈도우 표시 (선택 시)
    // 기존 오버레이 스타일 변경 로직 등을 추가할 수 있음
  }

  if (!API_KEY) return <div className="p-10 text-center text-red-500">API Key Missing</div>

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${API_KEY}&libraries=services&autoload=false`}
        strategy="afterInteractive"
      />

      {/* 🟢 왼쪽 사이드바 (목록) */}
      <div className="w-full md:w-96 bg-white border-r border-slate-200 flex flex-col z-10 shadow-lg">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-500" />
            {title || "추천 입지 TOP 5"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{subtitle || "AI 분석 기반 최적의 출점 후보지입니다."}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {places.length === 0 && isSdkLoaded && (
              <div className="text-center py-10 text-slate-400 text-sm">
              장소 데이터를 불러오는 중...
            </div>
          )}
          
          {places.map((place) => (
            <button
              key={place.id}
              onClick={() => handleSelectPlace(place)}
              className={cn(
                "w-full text-left p-4 rounded-xl transition-all duration-200 border",
                selectedPlaceId === place.id
                  ? "bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-200"
                  : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5",
                  selectedPlaceId === place.id ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"
                )}>
                  {place.id + 1}
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{place.name}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {place.address}
                  </div>
                  {placesData[place.id] && (
                    <div className="text-[11px] text-slate-500 mt-1 flex gap-3">
                      {placesData[place.id].revenue !== undefined && (
                        <span>매출 {placesData[place.id].revenue?.toLocaleString()}만원</span>
                      )}
                      {placesData[place.id].revisitRate !== undefined && (
                        <span>재방문 {placesData[place.id].revisitRate}%</span>
                      )}
                      {placesData[place.id].usage !== undefined && (
                        <span>이용 {formatMinutes(placesData[place.id].usage)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 🟢 지도 영역 */}
      <div className="flex-1 relative h-[400px] md:h-auto">
        <div ref={mapRef} className="w-full h-full" />
        
        {!isSdkLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-slate-600">지도를 불러오는 중...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
