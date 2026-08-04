import {
  Injectable, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { randomInt } from 'crypto';
import { Otp } from './entities/otp.entity';
import { MailService } from '../notifications/mail.service';
import { SmsService } from '../notifications/sms.service';
import { OtpPurpose, OtpChannel } from '../common/enums';

const OTP_TTL_MIN = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SEC = 60;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectRepository(Otp) private repo: Repository<Otp>,
    private mail: MailService,
    private sms: SmsService,
  ) {}

  private generateCode(): string {
    return String(randomInt(100000, 1000000)); // 6 digits
  }

  /** Create + send an OTP */
  async issue(params: {
    identifier: string;
    purpose: OtpPurpose;
    channel: OtpChannel;
    userId?: string;
    name?: string;
  }): Promise<{ sent: true; expiresInMinutes: number }> {
    const { identifier, purpose, channel, userId, name } = params;
    const id = identifier.toLowerCase().trim();

    // Cooldown check
    const recent = await this.repo.findOne({
      where: { identifier: id, purpose, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (recent) {
      const secondsSince = (Date.now() - recent.createdAt.getTime()) / 1000;
      if (secondsSince < RESEND_COOLDOWN_SEC) {
        throw new BadRequestException(
          `Please wait ${Math.ceil(RESEND_COOLDOWN_SEC - secondsSince)} seconds before requesting another code`,
        );
      }
    }

    // Invalidate previous unused codes for this identifier + purpose
    await this.repo.update(
      { identifier: id, purpose, isUsed: false },
      { isUsed: true },
    );

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

    await this.repo.save(this.repo.create({
      identifier: id, code, purpose, channel, userId, expiresAt,
    }));

    // Deliver
    const who = name || 'there';
    if (channel === OtpChannel.EMAIL) {
      if (purpose === OtpPurpose.PASSWORD_RESET) await this.mail.sendPasswordResetCode(id, who, code);
      else if (purpose === OtpPurpose.LOGIN) await this.mail.sendLoginCode(id, who, code);
      else await this.mail.sendVerificationCode(id, who, code);
    } else {
      if (purpose === OtpPurpose.PASSWORD_RESET) await this.sms.sendPasswordResetCode(id, code);
      else if (purpose === OtpPurpose.LOGIN) await this.sms.sendLoginCode(id, code);
      else await this.sms.sendVerificationCode(id, code);
    }

    this.logger.log(`OTP issued: ${purpose} via ${channel} to ${this.mask(id)}`);
    return { sent: true, expiresInMinutes: OTP_TTL_MIN };
  }

  /** Verify a code. Marks it used on success. */
  async verify(identifier: string, code: string, purpose: OtpPurpose): Promise<Otp> {
    const id = identifier.toLowerCase().trim();

    const otp = await this.repo.findOne({
      where: { identifier: id, purpose, isUsed: false, expiresAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new BadRequestException('Code expired or not found. Request a new one.');
    }

    if (otp.attempts >= MAX_ATTEMPTS) {
      otp.isUsed = true;
      await this.repo.save(otp);
      throw new BadRequestException('Too many failed attempts. Request a new code.');
    }

    if (otp.code !== code.trim()) {
      otp.attempts += 1;
      await this.repo.save(otp);
      const left = MAX_ATTEMPTS - otp.attempts;
      throw new BadRequestException(`Incorrect code. ${left} attempt(s) remaining.`);
    }

    otp.isUsed = true;
    await this.repo.save(otp);
    return otp;
  }

  /** Cleanup — call from a cron if you add one */
  async purgeExpired(): Promise<number> {
    const res = await this.repo.delete({ expiresAt: LessThan(new Date()) });
    return res.affected || 0;
  }

  private mask(s: string): string {
    if (s.includes('@')) {
      const [u, d] = s.split('@');
      return `${u.slice(0, 2)}***@${d}`;
    }
    return `${s.slice(0, 3)}****${s.slice(-2)}`;
  }
}