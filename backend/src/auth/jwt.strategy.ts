import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
// 👇 AuthModule에서 만든 랜덤 키를 가져옵니다.
import { RANDOM_SECRET_KEY } from './auth.module'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 👇 가져온 랜덤 키 사용 (두 파일의 키가 일치해야 함!)
      secretOrKey: RANDOM_SECRET_KEY, 
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: number; username: string }) {
    return { userId: payload.sub, username: payload.username };
  }
}