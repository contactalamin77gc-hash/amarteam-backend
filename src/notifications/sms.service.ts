import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private config: ConfigService) {}

  private get enabled(): boolean {
    return !!this.config.get('SMS_API_KEY');
  }

  async send(phone: string, message: string): Promise<void> {
    if (!this.enabled) {
      this.logger.debug(`[DEV SMS] to=${phone} :: ${message}`);
      return;
    }

    const provider = this.config.get('SMS_PROVIDER') || 'bulksmsbd';

    try {
      if (provider === 'bulksmsbd') await this.sendBulkSmsBd(phone, message);
      else if (provider === 'alphasms') await this.sendAlphaSms(phone, message);
      else this.logger.warn(`Unknown SMS provider: ${provider}`);
    } catch (err) {
      this.logger.error(`SMS failed to ${phone}`, err);
      throw new Error('Could not send SMS. Please try again.');
    }
  }

  /** BulkSMSBD — https://bulksmsbd.net */
  private async sendBulkSmsBd(phone: string, message: string) {
    const url = 'http://bulksmsbd.net/api/smsapi';
    const body = new URLSearchParams({
      api_key: this.config.get('SMS_API_KEY')!,
      senderid: this.config.get('SMS_SENDER_ID')!,
      number: phone.startsWith('88') ? phone : `88${phone}`,
      message,
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const text = await res.text();
    this.logger.debug(`BulkSMSBD response: ${text}`);
  }

  /** Alpha SMS — https://sms.net.bd */
  private async sendAlphaSms(phone: string, message: string) {
    const url = 'https://api.sms.net.bd/sendsms';
    const body = new URLSearchParams({
      api_key: this.config.get('SMS_API_KEY')!,
      msg: message,
      to: phone.startsWith('88') ? phone : `88${phone}`,
    });

    const res = await fetch(url, { method: 'POST', body });
    const json = await res.json();
    this.logger.debug(`AlphaSMS response: ${JSON.stringify(json)}`);
  }

  // ─── Templates ───

  async sendVerificationCode(phone: string, code: string) {
    await this.send(phone, `${code} is your Amar Team verification code. Valid for 10 minutes. Do not share this code.`);
  }

  async sendPasswordResetCode(phone: string, code: string) {
    await this.send(phone, `${code} is your Amar Team password reset code. Valid for 10 minutes. Do not share this code.`);
  }

  async sendLoginCode(phone: string, code: string) {
    await this.send(phone, `${code} is your Amar Team login code. Valid for 10 minutes.`);
  }

  async sendBookingConfirmed(phone: string, detail: string) {
    await this.send(phone, `Amar Team: Your booking is confirmed. ${detail}`);
  }

    // ─── Booking notifications ───
  // These never throw. A failed SMS must not roll back a status change.

  private async sendQuietly(phone: string | null | undefined, message: string) {
    if (!phone) return;
    try {
      await this.send(phone, message);
    } catch (err: any) {
      this.logger.warn(`Booking SMS failed to ${phone}: ${err.message}`);
    }
  }

  /** Hirer — booking confirmed, with the balance still owed. */
  async hirerConfirmed(phone: string | null, opts: {
    matchDate?: string; players: number; total: number; paid: number;
  }) {
    const due = Math.max(0, opts.total - opts.paid);
    await this.sendQuietly(phone,
      `Amar Team: Booking confirmed for ${opts.matchDate || 'your match'}. ` +
      `${opts.players} talent booked. Total Tk${opts.total}. ` +
      (due > 0 ? `Balance Tk${due} due on match day.` : `Fully paid.`),
    );
  }

  /** Hirer — advance received. */
  async hirerPaymentReceived(phone: string | null, amount: number, due: number) {
    await this.sendQuietly(phone,
      `Amar Team: We received Tk${amount}. ` +
      (due > 0 ? `Tk${due} remaining.` : `Your booking is fully paid.`),
    );
  }

  /** Hirer — talent has left for the venue. */
  async hirerOnTheWay(phone: string | null, matchDate?: string) {
    await this.sendQuietly(phone,
      `Amar Team: Your players are on the way for ${matchDate || 'the match'}. ` +
      `Please keep the balance ready.`,
    );
  }

  /** Talent — confirmed for a match. Own fee only, never the squad total. */
  async talentConfirmed(phone: string | null, opts: {
    matchDate?: string; venue?: string; fee: number;
  }) {
    await this.sendQuietly(phone,
      `Amar Team: You are confirmed for ${opts.matchDate || 'a match'}` +
      (opts.venue ? ` at ${opts.venue}` : '') + '. ' +
      (opts.fee > 0 ? `Your fee: Tk${opts.fee}. ` : '') +
      `Check your panel for details.`,
    );
  }

  /** Hirer — cancelled. */
  async hirerCancelled(phone: string | null, matchDate?: string) {
    await this.sendQuietly(phone,
      `Amar Team: Your booking for ${matchDate || 'the match'} has been cancelled. ` +
      `We will contact you shortly.`,
    );
  }
}