import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

const AppleStrategyBase = require('passport-apple');

@Injectable()
export class AppleStrategy extends PassportStrategy(AppleStrategyBase, 'apple') {
  private readonly logger = new Logger(AppleStrategy.name);

  constructor(config: ConfigService) {
    const keyPath = config.get('APPLE_PRIVATE_KEY_PATH');
    let privateKey = 'not-configured';

    try {
      if (keyPath && fs.existsSync(keyPath)) {
        privateKey = fs.readFileSync(keyPath, 'utf8');
      }
    } catch {
      // Silent — Apple login just won't work until configured
    }

    super({
      clientID: config.get('APPLE_CLIENT_ID') || 'not-configured',
      teamID: config.get('APPLE_TEAM_ID') || 'not-configured',
      keyID: config.get('APPLE_KEY_ID') || 'not-configured',
      privateKeyString: privateKey,
      callbackURL: config.get('APPLE_CALLBACK_URL') || 'http://localhost:4000/api/auth/apple/callback',
      scope: ['email', 'name'],
      passReqToCallback: true,
    });
  }

  async validate(req: any, _accessToken: string, _refreshToken: string, idToken: any, profile: any, done: any) {
    // Apple only sends name on the FIRST authorization
    let name = 'Apple User';
    if (req.body?.user) {
      try {
        const u = typeof req.body.user === 'string' ? JSON.parse(req.body.user) : req.body.user;
        name = [u?.name?.firstName, u?.name?.lastName].filter(Boolean).join(' ') || name;
      } catch {}
    }

    done(null, {
      provider: 'apple',
      providerId: idToken.sub,
      email: idToken.email,
      emailVerified: idToken.email_verified === 'true' || idToken.email_verified === true,
      name,
      avatar: null,
    });
  }
}