import {
  Injectable, UnauthorizedException, ConflictException,
  ForbiddenException, BadRequestException, Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { OtpService } from '../otp/otp.service';
import { MailService } from '../notifications/mail.service';
import {
  RegisterDto, LoginDto, SendOtpDto, VerifyOtpDto,
  ResetPasswordDto, ChangePasswordDto, OtpLoginDto,
} from './dto/auth.dto';
import { Role, AuthProvider, OtpPurpose, OtpChannel } from '../common/enums';
import { User } from '../users/entities/user.entity';

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;
const DUMMY_HASH = '$2b$12$K8yQwZ3rXqL1mN4pO7sT.uVbWxYzA1B2C3D4E5F6G7H8I9J0K1L2M';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private mailService: MailService,
    private config: ConfigService,
  ) {}

  // ══════════ REGISTER ══════════

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();

    if (await this.usersService.findByEmail(email)) {
      throw new ConflictException('This email is already registered');
    }
    if (await this.usersService.findByPhone(dto.phone)) {
      throw new ConflictException('This phone number is already registered');
    }

    const hashed = await bcrypt.hash(dto.password, 12);

    const user = await this.usersService.create({
      name: dto.name.trim(),
      email,
      password: hashed,
      phone: dto.phone,
      location: dto.location,
      role: Role.HIRER,          // public registration is always hirer
      authProvider: AuthProvider.LOCAL,
      emailVerified: false,
      phoneVerified: false,
    });

    // Fire the email verification code
    await this.otpService.issue({
      identifier: email,
      purpose: OtpPurpose.EMAIL_VERIFY,
      channel: OtpChannel.EMAIL,
      userId: user.id,
      name: user.name,
    }).catch(err => this.logger.warn(`Could not send verification email: ${err.message}`));

    // No token issued here — verifying the email is what produces one.
    return {
      user: this.clean(user),
      requiresVerification: true,
      message: 'Account created. Check your email for the verification code.',
    };
  }

  // ══════════ LOGIN (password) ══════════

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailForAuth(dto.email);

    // Uniform timing to avoid user enumeration
    if (!user) {
      await bcrypt.compare(dto.password, DUMMY_HASH);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const mins = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
      throw new ForbiddenException(`Account temporarily locked. Try again in ${mins} minute(s).`);
    }

    if (!user.isActive) {
      throw new ForbiddenException('This account has been deactivated. Contact support.');
    }

    // OAuth-only account with no password set
    if (!user.password) {
      throw new BadRequestException(
        `This account uses ${user.authProvider} sign-in. Use the "${user.authProvider === 'google' ? 'Continue with Google' : 'Continue with Apple'}" button.`,
      );
    }

    const ok = await bcrypt.compare(dto.password, user.password);

    if (!ok) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      if (attempts >= MAX_FAILED) {
        await this.usersService.update(user.id, {
          failedLoginAttempts: 0,
          lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000),
        } as any);
        throw new ForbiddenException(`Too many failed attempts. Account locked for ${LOCK_MINUTES} minutes.`);
      }
      await this.usersService.update(user.id, { failedLoginAttempts: attempts } as any);
      throw new UnauthorizedException(`Invalid email or password. ${MAX_FAILED - attempts} attempt(s) left.`);
    }

    await this.usersService.update(user.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    } as any);

    // Password is correct — but local accounts must prove they own the address.
    // Checked after the password so this can't be used to enumerate accounts.
    if (
      user.authProvider === AuthProvider.LOCAL &&
      !user.emailVerified &&
      !user.phoneVerified
    ) {
      await this.otpService.issue({
        identifier: user.email,
        purpose: OtpPurpose.EMAIL_VERIFY,
        channel: OtpChannel.EMAIL,
        userId: user.id,
        name: user.name,
      }).catch(err => this.logger.warn(`Verification resend failed: ${err.message}`));

      throw new ForbiddenException({
        message: 'Please verify your email before logging in. We have sent a new code.',
        code: 'EMAIL_NOT_VERIFIED',
        identifier: user.email,
      });
    }

    return {
      user: this.clean(user),
      token: this.sign(user),
    };
  }

  // ══════════ OAUTH ══════════

  async oauthLogin(profile: {
    provider: 'google' | 'apple';
    providerId: string;
    email?: string;
    emailVerified?: boolean;
    name: string;
    avatar?: string | null;
  }) {
    const idField = profile.provider === 'google' ? 'googleId' : 'appleId';

    // 1. Already linked?
    let user = profile.provider === 'google'
      ? await this.usersService.findByGoogleId(profile.providerId)
      : await this.usersService.findByAppleId(profile.providerId);

    // 2. Existing account with same email → link it
    if (!user && profile.email) {
      const existing = await this.usersService.findByEmail(profile.email);
      if (existing) {
        user = await this.usersService.update(existing.id, {
          [idField]: profile.providerId,
          emailVerified: existing.emailVerified || !!profile.emailVerified,
          avatar: existing.avatar || profile.avatar || undefined,
        } as any);
      }
    }

    // 3. Brand new user
    if (!user) {
      if (!profile.email) {
        throw new BadRequestException('No email returned by the provider. Please register manually.');
      }
      user = await this.usersService.create({
        name: profile.name,
        email: profile.email.toLowerCase(),
        password: null as any,
        role: Role.HIRER,
        authProvider: profile.provider === 'google' ? AuthProvider.GOOGLE : AuthProvider.APPLE,
        [idField]: profile.providerId,
        emailVerified: !!profile.emailVerified,
        phoneVerified: false,
        avatar: profile.avatar || undefined,
        isActive: true,
      } as any);

      await this.mailService.sendWelcome(user.email, user.name, 'hirer').catch(() => {});
    }

    if (!user.isActive) {
      throw new ForbiddenException('This account has been deactivated');
    }

    await this.usersService.update(user.id, { lastLoginAt: new Date() } as any);

    return {
      user: this.clean(user),
      token: this.sign(user),
      needsPhone: !user.phone,
    };
  }

  // ══════════ OTP ══════════

  async sendOtp(dto: SendOtpDto) {
    const id = dto.identifier.toLowerCase().trim();

    const user = dto.channel === OtpChannel.EMAIL
      ? await this.usersService.findByEmail(id)
      : await this.usersService.findByPhone(id);

    // For password reset / login, the account must exist —
    // but respond identically either way to avoid enumeration
    if ([OtpPurpose.PASSWORD_RESET, OtpPurpose.LOGIN].includes(dto.purpose) && !user) {
      this.logger.warn(`OTP requested for unknown identifier: ${id}`);
      return { sent: true, expiresInMinutes: 10 };
    }

    return this.otpService.issue({
      identifier: id,
      purpose: dto.purpose,
      channel: dto.channel,
      userId: user?.id,
      name: user?.name,
    });
  }

  async verifyOtp(dto: VerifyOtpDto) {
    await this.otpService.verify(dto.identifier, dto.code, dto.purpose);
    const id = dto.identifier.toLowerCase().trim();

    if (dto.purpose === OtpPurpose.EMAIL_VERIFY) {
      const user = await this.usersService.findByEmail(id);
      if (user) {
        const updated = await this.usersService.update(user.id, { emailVerified: true } as any);
        await this.mailService.sendWelcome(updated.email, updated.name, updated.role).catch(() => {});
        return { verified: true, user: this.clean(updated), token: this.sign(updated) };
      }
    }

    if (dto.purpose === OtpPurpose.PHONE_VERIFY) {
      const user = await this.usersService.findByPhone(id);
      if (user) {
        const updated = await this.usersService.update(user.id, { phoneVerified: true } as any);
        return { verified: true, user: this.clean(updated), token: this.sign(updated) };
      }
    }

    return { verified: true };
  }

  /** Passwordless login using an OTP */
  async otpLogin(dto: OtpLoginDto) {
    await this.otpService.verify(dto.identifier, dto.code, OtpPurpose.LOGIN);
    const id = dto.identifier.toLowerCase().trim();

    const user = id.includes('@')
      ? await this.usersService.findByEmail(id)
      : await this.usersService.findByPhone(id);

    if (!user) throw new UnauthorizedException('Account not found');
    if (!user.isActive) throw new ForbiddenException('This account has been deactivated');

    await this.usersService.update(user.id, {
      lastLoginAt: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
      ...(id.includes('@') ? { emailVerified: true } : { phoneVerified: true }),
    } as any);

    return { user: this.clean(user), token: this.sign(user) };
  }

  // ══════════ PASSWORD ══════════

  async resetPassword(dto: ResetPasswordDto) {
    await this.otpService.verify(dto.identifier, dto.code, OtpPurpose.PASSWORD_RESET);
    const id = dto.identifier.toLowerCase().trim();

    const user = id.includes('@')
      ? await this.usersService.findByEmail(id)
      : await this.usersService.findByPhone(id);

    if (!user) throw new BadRequestException('Account not found');

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.usersService.updatePassword(user.id, hashed);

    this.logger.log(`Password reset for user ${user.id}`);
    return { success: true, message: 'Password updated. You can now log in.' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    const full = await this.usersService.findByEmailForAuth(user.email);
    if (!full?.password) {
      throw new BadRequestException('This account has no password set. Use "Forgot password" to create one.');
    }

    const ok = await bcrypt.compare(dto.currentPassword, full.password);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different from the current one');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.usersService.updatePassword(userId, hashed);

    return { success: true, message: 'Password changed successfully' };
  }

  // ══════════ HELPERS ══════════

  async validateUser(id: string) {
    const user = await this.usersService.findById(id);
    return user && user.isActive ? user : null;
  }

  private sign(user: Partial<User>) {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { issuer: 'amarteam', audience: 'amarteam-client' },
    );
  }

  private clean(user: any) {
    const {
      password, failedLoginAttempts, lockedUntil,
      googleId, appleId, ...safe
    } = user;
    return safe;
  }
}