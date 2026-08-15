import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

const tk = (n?: number | null) => `৳${Number(n || 0).toLocaleString()}`;

const shell = (title: string, body: string) => `
<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f4f6f8;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e6e9ec">
    <div style="background:#052e16;padding:20px 24px">
      <span style="color:#fff;font-size:18px;font-weight:700">আমার টিম</span>
      <span style="color:rgba(255,255,255,.45);font-size:12px;margin-left:8px">Amar Team</span>
    </div>
    <div style="padding:24px">
      <h1 style="margin:0 0 14px;font-size:19px;color:#0f172a">${title}</h1>
      ${body}
    </div>
    <div style="padding:14px 24px;background:#f8fafc;border-top:1px solid #e6e9ec">
      <p style="margin:0;font-size:11px;color:#94a3b8">
        Questions? Reply to this email and we'll get back to you.
      </p>
    </div>
  </div>
</div>`;

const rows = (pairs: [string, string | undefined | null][]) => `
<table style="width:100%;border-collapse:collapse;margin:14px 0">
  ${pairs.filter(([, v]) => v).map(([k, v]) => `
    <tr>
      <td style="padding:7px 0;font-size:13px;color:#64748b">${k}</td>
      <td style="padding:7px 0;font-size:13px;color:#0f172a;font-weight:600;text-align:right">${v}</td>
    </tr>`).join('')}
</table>`;

@Injectable()
export class BookingMailService {
  private readonly logger = new Logger(BookingMailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: Number(config.get('SMTP_PORT')) || 587,
      secure: false,
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });
  }

  /** Never throws — a mail failure must not roll back a status change. */
  private async send(to: string, subject: string, html: string) {
    if (!to) return;
    try {
      await this.transporter.sendMail({
        from: `"${this.config.get('MAIL_FROM_NAME') || 'Amar Team'}" <${this.config.get('MAIL_FROM_EMAIL')}>`,
        to, subject, html,
      });
      this.logger.log(`Sent "${subject}" to ${to}`);
    } catch (err: any) {
      this.logger.warn(`Mail failed to ${to}: ${err.message}`);
    }
  }

  // ══════════ HIRER ══════════

  async teamConfirmed(to: string, name: string, tr: any) {
    const squad = (tr.squad || []).map((s: any) =>
      `<li style="font-size:13px;color:#334155;margin-bottom:5px">
         <strong>${s.playerName}</strong>
         <span style="color:#94a3b8">— ${s.playerPosition}</span>
       </li>`).join('');

    await this.send(to, `Booking confirmed — ${tr.matchDate || 'your match'}`, shell(
      'Your team is confirmed',
      `<p style="font-size:14px;color:#475569;margin:0 0 4px">Hi ${name},</p>
       <p style="font-size:14px;color:#475569;margin:0">
         Your squad is locked in. Full details below — keep this email for match day.
       </p>
       ${rows([
         ['Match date', tr.matchDate],
         ['Tournament', tr.tournament],
         ['Venue', tr.location],
         ['Players', String((tr.squad || []).length)],
       ])}
       <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;margin:14px 0">
         ${rows([
           ['Total agreed', tk(tr.finalAmount)],
           ['Advance received', tk(tr.amountPaid)],
           ['Balance on match day', tk((tr.finalAmount || 0) - (tr.amountPaid || 0))],
         ])}
       </div>
       <p style="font-size:13px;font-weight:600;color:#0f172a;margin:18px 0 8px">Your squad</p>
       <ul style="margin:0;padding-left:18px">${squad}</ul>
       <p style="font-size:12px;color:#94a3b8;margin-top:18px">
         Pay the remaining balance directly to the players on match day.
       </p>`,
    ));
  }

  async advanceReceived(to: string, name: string, tr: any, amount: number) {
    await this.send(to, `Payment received — ${tk(amount)}`, shell(
      'We received your payment',
      `<p style="font-size:14px;color:#475569;margin:0 0 4px">Hi ${name},</p>
       <p style="font-size:14px;color:#475569;margin:0">Thank you — your advance has been confirmed.</p>
       ${rows([
         ['Amount received', tk(amount)],
         ['Match date', tr.matchDate],
         ['Total agreed', tk(tr.finalAmount)],
         ['Balance remaining', tk((tr.finalAmount || 0) - (tr.amountPaid || 0))],
       ])}`,
    ));
  }

  async playersOnTheWay(to: string, name: string, tr: any) {
    const list = (tr.squad || []).map((s: any) =>
      `<li style="font-size:13px;color:#334155;margin-bottom:4px">${s.playerName} — ${s.playerPosition}</li>`,
    ).join('');

    await this.send(to, 'Your players are on the way', shell(
      'Players are on the way',
      `<p style="font-size:14px;color:#475569;margin:0 0 4px">Hi ${name},</p>
       <p style="font-size:14px;color:#475569;margin:0">
         Your squad has left for the venue. Please have the balance ready.
       </p>
       ${rows([
         ['Match date', tr.matchDate],
         ['Venue', tr.location],
         ['Balance due', tk((tr.finalAmount || 0) - (tr.amountPaid || 0))],
       ])}
       <p style="font-size:13px;font-weight:600;color:#0f172a;margin:16px 0 8px">Arriving</p>
       <ul style="margin:0;padding-left:18px">${list}</ul>`,
    ));
  }

  async teamCompleted(to: string, name: string, tr: any) {
    await this.send(to, 'Match complete — thank you', shell(
      'Thanks for playing with us',
      `<p style="font-size:14px;color:#475569;margin:0 0 4px">Hi ${name},</p>
       <p style="font-size:14px;color:#475569;margin:0">
         Your booking is complete. We'd appreciate a review of the players you hired —
         it helps other clubs choose well.
       </p>
       ${rows([
         ['Match date', tr.matchDate],
         ['Players', String((tr.squad || []).length)],
         ['Total', tk(tr.finalAmount)],
       ])}`,
    ));
  }

  async teamCancelled(to: string, name: string, tr: any, note?: string) {
    await this.send(to, 'Booking cancelled', shell(
      'Your booking has been cancelled',
      `<p style="font-size:14px;color:#475569;margin:0 0 4px">Hi ${name},</p>
       <p style="font-size:14px;color:#475569;margin:0">
         This booking has been cancelled${note ? ` — ${note}` : '.'}
       </p>
       ${rows([
         ['Match date', tr.matchDate],
         ['Players', String((tr.squad || []).length)],
       ])}
       ${tr.amountPaid > 0 ? `
       <div style="background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:13px;margin-top:14px">
         <p style="margin:0;font-size:13px;color:#854d0e">
           You paid ${tk(tr.amountPaid)}. We'll contact you about the refund.
         </p>
       </div>` : ''}`,
    ));
  }

  // ══════════ TALENT ══════════

  async talentConfirmed(to: string, name: string, tr: any, fee: number, teammates: string[]) {
    await this.send(to, `You're confirmed — ${tr.matchDate || 'upcoming match'}`, shell(
      "You're confirmed for a match",
      `<p style="font-size:14px;color:#475569;margin:0 0 4px">Hi ${name},</p>
       <p style="font-size:14px;color:#475569;margin:0">
         You've been booked. Details below — check your player panel for the full breakdown.
       </p>
       ${rows([
         ['Match date', tr.matchDate],
         ['Tournament', tr.tournament],
         ['Venue', tr.location],
         ['Hirer', tr.hirer?.name],
       ])}
       ${fee > 0 ? `
       <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;margin:14px 0">
         <p style="margin:0;font-size:13px;color:#166534">
           Your fee for this match: <strong>${tk(fee)}</strong>
         </p>
       </div>` : ''}
       ${teammates.length ? `
       <p style="font-size:13px;font-weight:600;color:#0f172a;margin:16px 0 8px">
         Also going from Amar Team
       </p>
       <ul style="margin:0;padding-left:18px">
         ${teammates.map(n => `<li style="font-size:13px;color:#334155;margin-bottom:4px">${n}</li>`).join('')}
       </ul>` : ''}
       <p style="font-size:12px;color:#94a3b8;margin-top:18px">
         Please arrive at least 45 minutes before kickoff.
       </p>`,
    ));
  }
}