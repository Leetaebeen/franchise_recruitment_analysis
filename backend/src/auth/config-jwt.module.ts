import { Module } from '@nestjs/common';
// 👇 [수정] jwtConstants 대신 secrets.ts에 있는 DYNAMIC_SECRET_KEY를 가져옵니다.
import { DYNAMIC_SECRET_KEY } from './secrets';

// 의존성 주입에 사용할 프로바이더 토큰
export const JWT_SECRET_PROVIDER = 'JWT_SECRET_PROVIDER';

const jwtSecretProvider = {
  provide: JWT_SECRET_PROVIDER,
  useFactory: () => {
    // 👇 [수정] DYNAMIC_SECRET_KEY를 그대로 사용합니다.
    console.log('🔥 [System] JWT 시크릿 키 제공됨');
    return DYNAMIC_SECRET_KEY;
  },
};

@Module({
  providers: [jwtSecretProvider],
  exports: [jwtSecretProvider],
})
export class ConfigJwtModule {}