import * as crypto from 'crypto';

// 서버가 켜질 때마다 새로운 32바이트 랜덤 키 생성 (무조건 문자열임이 보장됨)
export const DYNAMIC_SECRET_KEY = crypto.randomBytes(32).toString('hex');

console.log('🔒 [System] 새로운 보안 키가 생성되었습니다:', DYNAMIC_SECRET_KEY);