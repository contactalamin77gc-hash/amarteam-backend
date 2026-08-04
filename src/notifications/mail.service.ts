import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter!: nodemailer.Transporter;
  private enabled = false;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const host = this.config.get('SMTP_HOST');
    const user = this.config.get('SMTP_USER');
    const pass = this.config.get('SMTP_PASS');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured — emails will be logged to console only');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(this.config.get('SMTP_PORT') || 587),
      secure: Number(this.config.get('SMTP_PORT')) === 465,
      auth: { user, pass },
    });

    this.enabled = true;
    this.logger.log('Mail service ready');
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.enabled) {
      this.logger.debug(`[DEV EMAIL] to=${to} subject="${subject}"`);
      this.logger.debug(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300));
      return;
    }

    const fromName = this.config.get('MAIL_FROM_NAME') || 'Amar Team';
    const fromEmail = this.config.get('MAIL_FROM_EMAIL') || this.config.get('SMTP_USER');

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to, subject, html,
      });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err);
      throw new Error('Could not send email. Please try again.');
    }
  }

  // ─── Templates ───

  private wrap(title: string, body: string): string {
    return `
<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0a0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1a;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#111827;border-radius:16px;overflow:hidden;border:1px solid #1f2937;">
        <tr><td style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:28px 32px;">
          <p style="margin:0;color:#fff;font-size:20px;font-weight:700;">আমার টিম</p>
          <p style="margin:4px 0 0;color:rgba(255,255,255,.8);font-size:12px;">Amar Team — Bangladesh Football Platform</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;color:#fff;font-size:22px;font-weight:700;">${title}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #1f2937;">
          <p style="margin:0;color:#4b5563;font-size:11px;">
            This is an automated message from Amar Team. If you didn't request this, you can safely ignore it.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  }

  private codeBlock(code: string): string {
    return `
<div style="background:#0a0f1a;border:2px dashed #16a34a;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
  <p style="margin:0 0 8px;color:#6b7280;font-size:12px;letter-spacing:1px;">YOUR CODE</p>
  <p style="margin:0;color:#22c55e;font-size:36px;font-weight:700;letter-spacing:10px;font-family:monospace;">${code}</p>
</div>
<p style="margin:0;color:#6b7280;font-size:13px;text-align:center;">This code expires in 10 minutes.</p>`;
  }

  async sendVerificationCode(to: string, name: string, code: string) {
    await this.send(to, `${code} is your Amar Team verification code`, this.wrap(
      'Verify your email',
      `<p style="margin:0 0 8px;color:#9ca3af;font-size:14px;line-height:1.6;">
         Hi ${name}, welcome to Amar Team. Enter this code to verify your email address.
       </p>
       ${this.codeBlock(code)}`,
    ));
  }

  async sendPasswordResetCode(to: string, name: string, code: string) {
    await this.send(to, `${code} is your Amar Team password reset code`, this.wrap(
      'Reset your password',
      `<p style="margin:0 0 8px;color:#9ca3af;font-size:14px;line-height:1.6;">
         Hi ${name}, use this code to reset your password. If you didn't request this, ignore this email — your password stays unchanged.
       </p>
       ${this.codeBlock(code)}`,
    ));
  }

  async sendLoginCode(to: string, name: string, code: string) {
    await this.send(to, `${code} is your Amar Team login code`, this.wrap(
      'Login code',
      `<p style="margin:0 0 8px;color:#9ca3af;font-size:14px;line-height:1.6;">
         Hi ${name}, here's your one-time login code.
       </p>
       ${this.codeBlock(code)}`,
    ));
  }

  async sendWelcome(to: string, name: string, role: string) {
    await this.send(to, 'Welcome to Amar Team', this.wrap(
      `Welcome, ${name}`,
      `<p style="margin:0 0 20px;color:#9ca3af;font-size:14px;line-height:1.7;">
         Your ${role} account is ready. ${role === 'hirer'
           ? 'Start browsing players, book vehicles, and shop for gear.'
           : 'Complete your profile and our team will review it shortly.'}
       </p>
       <a href="${this.config.get('FRONTEND_URL')}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
         Go to Amar Team
       </a>`,
    ));
  }

  async sendApprovalNotice(to: string, name: string) {
    await this.send(to, 'Your profile is approved', this.wrap(
      'Profile approved',
      `<p style="margin:0 0 20px;color:#9ca3af;font-size:14px;line-height:1.7;">
         Great news ${name} — your profile has been approved and is now live. Clubs can find and book you.
       </p>
       <a href="${this.config.get('FRONTEND_URL')}/player-panel" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
         View My Profile
       </a>`,
    ));
  }
}