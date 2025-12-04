import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// 👇 [수정] StrategyOptions 타입 추가
import { Strategy, Profile, VerifyCallback, StrategyOptions } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    } as StrategyOptions); // 👈 [핵심] 여기에 'as StrategyOptions' 붙여서 강제 형변환!
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails } = profile;

    // 안전 장치
    if (!emails || emails.length === 0 || !name) {
        // 👇 undefined로 변경
        return done(new Error('Google profile missing data'), undefined);
    }

    const user = await this.authService.validateOrCreateGoogleUser({
      googleId: id,
      email: emails[0].value,
      firstName: name.givenName ?? '',
      lastName: name.familyName ?? '',
    });

    done(null, user);
  }
}