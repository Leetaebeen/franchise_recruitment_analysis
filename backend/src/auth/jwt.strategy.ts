import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
// 👇 새로 만든 secrets 파일에서 키를 가져옵니다.
import { DYNAMIC_SECRET_KEY } from './secrets'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 👇 이제 'string' 타입이 확실하므로 에러가 나지 않습니다.
      secretOrKey: DYNAMIC_SECRET_KEY, 
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: number; username: string }) {
    return { userId: payload.sub, username: payload.username };
  }
}