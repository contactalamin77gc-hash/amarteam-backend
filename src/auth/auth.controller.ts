import {
  Controller, Post, Get, Body, Req, Res,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import {
  RegisterDto, LoginDto, SendOtpDto, VerifyOtpDto,
  ResetPasswordDto, ChangePasswordDto, OtpLoginDto,
} from './dto/auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  // ══════════ LOCAL ══════════

  @Public()
  @Post('register')
  @Throttle({ default: { ttl: 3600000, limit: 5 } })   // 5 per hour per IP
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ══════════ OTP ══════════

  @Public()
  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @Post('otp/login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  otpLogin(@Body() dto: OtpLoginDto) {
    return this.authService.otpLogin(dto);
  }

  // ══════════ PASSWORD ══════════

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 300000, limit: 5 } })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('password/change')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 300000, limit: 5 } })
  changePassword(@CurrentUser() user: User, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto);
  }

  // ══════════ GOOGLE ══════════

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Passport redirects — nothing to do here
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    return this.finishOAuth(req, res);
  }

  // ══════════ APPLE ══════════

  // @Public()
  // @Get('apple')
  // @UseGuards(AuthGuard('apple'))
  // appleAuth() {}

  // @Public()
  // @Post('apple/callback')
  // @UseGuards(AuthGuard('apple'))
  // async appleCallback(@Req() req: any, @Res() res: Response) {
  //   return this.finishOAuth(req, res);
  // }

  // ══════════ SHARED OAUTH REDIRECT ══════════

  private async finishOAuth(req: any, res: Response) {
    const frontend = this.config.get('FRONTEND_URL') || 'http://localhost:3000';

    try {
      const result = await this.authService.oauthLogin(req.user);
      const params = new URLSearchParams({
        token: result.token,
        needsPhone: String(result.needsPhone),
      });
      return res.redirect(`${frontend}/auth/callback?${params}`);
    } catch (err: any) {
      const params = new URLSearchParams({ error: err?.message || 'Sign-in failed' });
      return res.redirect(`${frontend}/auth/login?${params}`);
    }
  }

  // ══════════ ME ══════════

  @Get('me')
  me(@CurrentUser() user: User) {
    return user;
  }
}