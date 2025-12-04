"use client"

import { useEffect, useRef, useState } from "react"

interface Props {
  locations?: string[]
}

export default function KakaoMap({ locations = [] }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. 지도 그리기 시도
  useEffect(() => {
    console.log('[KakaoMap] 컴포넌트 마운트됨')

    // autoload=false이므로 kakao.maps.load()를 호출해야 함
    const tryLoadMap = () => {
      console.log('[KakaoMap] 카카오 스크립트 로드 확인 중...')
      console.log('[KakaoMap] window.kakao 존재:', !!(window as any).kakao)

      if ((window as any).kakao && (window as any).kakao.maps) {
        console.log('[KakaoMap] 카카오맵 SDK 로드 완료, 지도 초기화 시작')
        try {
          (window as any).kakao.maps.load(() => {
            console.log('[KakaoMap] kakao.maps.load 콜백 실행됨')
            initializeMap()
          })
          return true
        } catch (err) {
          console.error('[KakaoMap] 지도 로드 중 에러:', err)
          setError(`지도 로드 실패: ${err}`)
          return false
        }
      }
      return false
    }

    // 바로 로드 시도
    if (tryLoadMap()) return

    console.log('[KakaoMap] 즉시 로드 실패, 폴링 시작')

    // 혹시 약간 늦게 로드될 경우를 대비해 0.1초마다 체크
    let count = 0
    const interval = setInterval(() => {
      console.log(`[KakaoMap] 폴링 시도 ${count + 1}/30`)
      if (tryLoadMap() || count > 30) {
        clearInterval(interval)
        if (count > 30) {
          console.error('[KakaoMap] 카카오맵 SDK 로드 타임아웃')
          setError('카카오맵을 불러올 수 없습니다. API 키를 확인해주세요.')
        }
      }
      count++
    }, 100)

    return () => clearInterval(interval)
  }, [locations])


  // 2. 실제 지도 생성 함수
  const initializeMap = () => {
    if (!mapRef.current) {
      console.error('[KakaoMap] mapRef.current가 null입니다')
      return
    }

    const kakao = (window as any).kakao
    if (!kakao) {
      console.error('[KakaoMap] window.kakao가 존재하지 않습니다')
      setError('카카오맵 SDK를 찾을 수 없습니다')
      return
    }

    console.log('[KakaoMap] 지도 생성 시작')

    try {
      // 지도 옵션
      const options = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567),
        level: 7,
      }
      const map = new kakao.maps.Map(mapRef.current, options)
      console.log('[KakaoMap] 지도 생성 성공')
      setIsMapLoaded(true)

      // 마커 및 키워드 검색
      if (locations.length > 0) {
        console.log('[KakaoMap] 마커 생성 시작, 위치 개수:', locations.length)
        const places = new kakao.maps.services.Places()
        const bounds = new kakao.maps.LatLngBounds()

        locations.forEach((keyword) => {
          console.log('[KakaoMap] 키워드 검색:', keyword)

          // 키워드로 장소 검색
          places.keywordSearch(keyword, (result: any, status: any) => {
            if (status === kakao.maps.services.Status.OK && result[0]) {
              console.log('[KakaoMap] 키워드 검색 성공:', keyword, result[0])
              const coords = new kakao.maps.LatLng(result[0].y, result[0].x)

              // 마커
              const marker = new kakao.maps.Marker({
                map: map,
                position: coords
              })

              // 인포윈도우
              const infowindow = new kakao.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:12px;color:#000;white-space:nowrap;">${keyword}</div>`,
              })
              kakao.maps.event.addListener(marker, "click", () => infowindow.open(map, marker))

              // 범위 확장
              bounds.extend(coords)
              map.setBounds(bounds)
            } else {
              console.warn('[KakaoMap] 키워드 검색 실패:', keyword, status)
            }
          })
        })
      }
    } catch (err) {
      console.error('[KakaoMap] 지도 초기화 에러:', err)
      setError(`지도 초기화 실패: ${err}`)
    }
  }

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden relative border border-slate-200 shadow-xl bg-slate-50">
      <div ref={mapRef} className="w-full h-full" />

      {!isMapLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
          <div className="text-slate-500 font-semibold">지도 로딩 중...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
          <div className="text-center p-6">
            <div className="text-red-500 font-bold text-lg mb-2">⚠️ 지도 로딩 실패</div>
            <div className="text-slate-600 text-sm">{error}</div>
            <div className="text-slate-500 text-xs mt-3">
              브라우저 콘솔(F12)을 확인해주세요
            </div>
          </div>
        </div>
      )}
    </div>
  )
}