import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

/**
 * 인증 토큰을 포함하여 API 요청을 보내는 fetch 래퍼 함수.
 * 401 Unauthorized 응답을 받으면 자동으로 로그아웃 처리합니다.
 * @param url 요청할 URL
 * @param options 네이티브 fetch에 전달할 옵션
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = Cookies.get("accessToken");

  // 헤더 설정 (기존 헤더가 있으면 유지)
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  // 요청 보내기
  const response = await fetch(url, { 
    cache: 'no-store', // 👈 캐시 비활성화
    ...options, 
    headers 
  });

  // 401 에러 처리
  if (response.status === 401) {
    console.log("API 요청 실패: 인증 세션이 만료되었습니다. 로그아웃합니다.");
    alert("장시간 활동이 없어 안전을 위해 로그아웃되었습니다. 다시 로그인해주세요.");
    
    Cookies.remove("accessToken");
    Cookies.remove("username");
    
    // 페이지 리디렉션.
    // 주의: 이 함수는 React 컴포넌트나 Hook 내부에서만 호출되어야 합니다.
    // 여기서는 window.location을 사용하여 즉시 리디렉션합니다.
    window.location.href = '/login';

    // 에러를 발생시켜 이후 .then() 체인이 실행되지 않도록 함
    throw new Error("Session expired");
  }

  return response;
}
