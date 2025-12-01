import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: '선문PC방 가맹점 모집',
  description: '데이터 기반 PC방 창업, 선문PC방과 함께하세요',
  generator: 'v0.app',
}

function generateKakaoMapScript(apiKey: string | undefined) {
  return `
    (function() {
      var apiKey = '${apiKey}';
      console.log('[Layout] API 키:', apiKey ? apiKey.slice(0, 10) + '...' : 'undefined');

      var script = document.createElement('script');
      var scriptUrl = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=' + apiKey + '&libraries=services&autoload=false';
      console.log('[Layout] 스크립트 URL:', scriptUrl);

      script.src = scriptUrl;
      script.async = false;
      script.onload = function() {
        console.log('[Layout] 카카오맵 스크립트 로드됨');
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(function() {
            console.log('[Layout] 카카오맵 초기화 완료');
          });
        }
      };
      script.onerror = function(e) {
        console.error('[Layout] 카카오맵 스크립트 로드 실패');
        console.error('[Layout] 에러 상세:', e);
      };
      document.head.appendChild(script);
    })();
  `;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const kakaoMapScript = generateKakaoMapScript(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY);

  return (
    <html lang="ko">
      <head>
        <script dangerouslySetInnerHTML={{ __html: kakaoMapScript }} />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}