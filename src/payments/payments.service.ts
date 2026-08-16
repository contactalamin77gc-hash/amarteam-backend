import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Setting } from '../settings/entities/setting.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { TeamRequest } from '../team-requests/entities/team-request.entity';
import { CameramanBooking } from '../cameramen/entities/cameraman-booking.entity';
import { VehicleBooking } from '../vehicles/entities/vehicle-booking.entity';
import {
  TxKind, TxRefType, TxMethod, TxStatus, PaymentStatus,
} from '../common/enums';
import { RecordPaymentDto, RecordPayoutDto, RecordDirectDto } from './dto/payment.dto';

/** Which commission + advance setting keys apply to each booking type. */
const RULES: Record<TxRefType, { commissionKey: string; advanceKey: string }> = {
  [TxRefType.BOOKING]:            { commissionKey: 'commission.talent',    advanceKey: 'advance.talent' },
  [TxRefType.TEAM_REQUEST]:       { commissionKey: 'commission.talent',    advanceKey: 'advance.talent' },
  [TxRefType.CAMERAMAN_BOOKING]:  { commissionKey: 'commission.cameraman', advanceKey: 'advance.cameraman' },
  [TxRefType.VEHICLE_BOOKING]:    { commissionKey: 'commission.vehicle',   advanceKey: 'advance.vehicle' },
  [TxRefType.ORDER]:              { commissionKey: 'commission.order',     advanceKey: 'advance.order' },
};

const DEFAULTS: Record<string, number> = {
  'commission.talent': 10,
  'commission.cameraman': 20,
  'commission.vehicle': 0,
  'commission.order': 0,
  'advance.talent': 30,
  'advance.cameraman': 100,
  'advance.vehicle': 30,
  'advance.order': 100,
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
    @InjectRepository(Setting) private settingsRepo: Repository<Setting>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(TeamRequest) private teamRepo: Repository<TeamRequest>,
    @InjectRepository(CameramanBooking) private camRepo: Repository<CameramanBooking>,
    @InjectRepository(VehicleBooking) private vehRepo: Repository<VehicleBooking>,
    private dataSource: DataSource,
  ) {}

  // ══════════ SETTINGS ══════════

  private async readRate(key: string): Promise<number> {
    const row = await this.settingsRepo.findOne({ where: { key } as any });
    const parsed = Number(row?.value);
    return Number.isFinite(parsed) ? parsed : DEFAULTS[key] ?? 0;
  }

  async getRates() {
    const keys = Object.keys(DEFAULTS);
    const out: Record<string, number> = {};
    for (const k of keys) out[k] = await this.readRate(k);
    return out;
  }

  /**
   * Commission can only come out of money that reached us, so the advance
   * must cover it. Rejecting this at write time beats a negative payout later.
   */
  async validateRates(rates: Record<string, number>) {
    const pairs: [string, string][] = [
      ['commission.talent', 'advance.talent'],
      ['commission.cameraman', 'advance.cameraman'],
      ['commission.vehicle', 'advance.vehicle'],
    ];
    for (const [c, a] of pairs) {
      const com = rates[c] ?? await this.readRate(c);
      const adv = rates[a] ?? await this.readRate(a);
      if (com < 0 || com > 100) throw new BadRequestException(`${c} must be between 0 and 100`);
      if (adv < 0 || adv > 100) throw new BadRequestException(`${a} must be between 0 and 100`);
      if (com > adv) {
        throw new BadRequestException(
          `${c} (${com}%) cannot exceed ${a} (${adv}%) — commission is taken from the advance.`,
        );
      }
    }
  }

  // ══════════ ENTITY ACCESS ══════════

  private repoFor(refType: TxRefType): Repository<any> {
    switch (refType) {
      case TxRefType.BOOKING: return this.bookingRepo;
      case TxRefType.TEAM_REQUEST: return this.teamRepo;
      case TxRefType.CAMERAMAN_BOOKING: return this.camRepo;
      case TxRefType.VEHICLE_BOOKING: return this.vehRepo;
      default:
        throw new BadRequestException(`Payments are not wired up for ${refType} yet`);
    }
  }

  private async loadRef(refType: TxRefType, refId: string, mgr?: EntityManager) {
    const repo = this.repoFor(refType);
    const target = repo.target;
    const found = mgr
      ? await mgr.findOne(target as any, { where: { id: refId } })
      : await repo.findOne({ where: { id: refId } });
    if (!found) throw new NotFoundException('Booking not found');
    return found as any;
  }

  /** The agreed total. Falls back through the type-specific fields. */
  private totalOf(refType: TxRefType, ref: any): number {
    const candidates = refType === TxRefType.BOOKING
      ? [ref.finalAmount, ref.amount]
      : refType === TxRefType.VEHICLE_BOOKING
        ? [ref.finalAmount, ref.estimatedAmount]
        : refType === TxRefType.CAMERAMAN_BOOKING
          ? [ref.finalAmount, ref.quotedRate]
          : [ref.finalAmount, ref.budget];
    const total = candidates.find(v => typeof v === 'number' && v > 0);
    if (!total) {
      throw new BadRequestException(
        'Set the final amount on this booking before recording a payment',
      );
    }
    return total;
  }

  // ══════════ QUOTE ══════════

  /** What the hirer owes to confirm, and what the talent ends up with. */
  async quote(refType: TxRefType, refId: string) {
    const ref = await this.loadRef(refType, refId);
    const total = this.totalOf(refType, ref);
    const rule = RULES[refType];

    const commissionRate = ref.commissionRate ?? await this.readRate(rule.commissionKey);
    const advanceRate = await this.readRate(rule.advanceKey);

    const commissionAmount = ref.commissionAmount ?? Math.round((total * commissionRate) / 100);
    const advanceDue = Math.round((total * advanceRate) / 100);

    return {
      total,
      commissionRate,
      commissionAmount,
      advanceRate,
      advanceDue,
      amountPaid: ref.amountPaid ?? 0,
      remainingToUs: Math.max(0, advanceDue - (ref.amountPaid ?? 0)),
      talentReceives: total - commissionAmount,
      payoutPaid: ref.payoutPaid ?? 0,
      payoutDue: Math.max(0, (ref.amountPaid ?? 0) - commissionAmount - (ref.payoutPaid ?? 0)),
      paymentStatus: ref.paymentStatus ?? PaymentStatus.UNPAID,
    };
  }

  // ══════════ MONEY IN ══════════

  async recordPayment(dto: RecordPaymentDto, adminId: string) {
    return this.dataSource.transaction(async (mgr) => {
      const repo = this.repoFor(dto.refType);
      const ref = await this.loadRef(dto.refType, dto.refId, mgr);
      const total = this.totalOf(dto.refType, ref);
      const rule = RULES[dto.refType];

      // Snapshot the rate the first time money arrives — never recalculated after.
      if (ref.commissionRate === null || ref.commissionRate === undefined) {
        ref.commissionRate = await this.readRate(rule.commissionKey);
        ref.commissionAmount = Math.round((total * ref.commissionRate) / 100);
      }

      if (dto.externalRef) {
        const dup = await mgr.count(Transaction, {
          where: { externalRef: dto.externalRef, refType: dto.refType },
        });
        if (dup > 0) {
          throw new BadRequestException(
            `Payment with TrxID "${dto.externalRef}" has already been recorded.`,
          );
        }
      }

      const alreadyPaid = ref.amountPaid ?? 0;
      if (alreadyPaid + dto.amount > total) {
        throw new BadRequestException(
          `Payment exceeds the booking total. Already paid ৳${alreadyPaid} of ৳${total}.`,
        );
      }

      ref.amountPaid = alreadyPaid + dto.amount;

      const advanceRate = await this.readRate(rule.advanceKey);
      const advanceDue = Math.round((total * advanceRate) / 100);

      ref.paymentStatus =
        ref.amountPaid >= total ? PaymentStatus.FULLY_PAID
        : ref.amountPaid >= advanceDue ? PaymentStatus.ADVANCE_PAID
        : PaymentStatus.UNPAID;

      await mgr.save(repo.target as any, ref);

      const isFull = ref.amountPaid >= total;
      const inTx = mgr.create(Transaction, {
        kind: isFull ? TxKind.FULL_IN : TxKind.ADVANCE_IN,
        refType: dto.refType,
        refId: dto.refId,
        amount: String(dto.amount),
        method: dto.method,
        externalRef: dto.externalRef ?? null,
        status: TxStatus.CONFIRMED,
        note: dto.note ?? null,
        createdById: adminId,
      });
      await mgr.save(inTx);

      // Commission is booked once, on the first confirmed payment.
      const existingCommission = await mgr.count(Transaction, {
        where: { refType: dto.refType, refId: dto.refId, kind: TxKind.COMMISSION },
      });
      if (existingCommission === 0 && ref.commissionAmount > 0) {
        await mgr.save(mgr.create(Transaction, {
          kind: TxKind.COMMISSION,
          refType: dto.refType,
          refId: dto.refId,
          amount: String(ref.commissionAmount),
          method: TxMethod.MANUAL,
          status: TxStatus.CONFIRMED,
          note: `${ref.commissionRate}% of ৳${total}`,
          createdById: adminId,
        }));
      }

      this.logger.log(`Payment ৳${dto.amount} on ${dto.refType}/${dto.refId}`);
      return this.quote(dto.refType, dto.refId);
    });
  }

  // ══════════ MONEY OUT ══════════

  async recordPayout(dto: RecordPayoutDto, adminId: string) {
    return this.dataSource.transaction(async (mgr) => {
      const repo = this.repoFor(dto.refType);
      const ref = await this.loadRef(dto.refType, dto.refId, mgr);

      const held = (ref.amountPaid ?? 0) - (ref.commissionAmount ?? 0);
      const available = held - (ref.payoutPaid ?? 0);

      if (dto.amount > available) {
        throw new BadRequestException(
          `Only ৳${available} is available to pay out. Commission of ৳${ref.commissionAmount ?? 0} is already retained.`,
        );
      }

      ref.payoutPaid = (ref.payoutPaid ?? 0) + dto.amount;
      await mgr.save(repo.target as any, ref);

      await mgr.save(mgr.create(Transaction, {
        kind: TxKind.PAYOUT,
        refType: dto.refType,
        refId: dto.refId,
        playerId: dto.playerId ?? null,
        amount: String(dto.amount),
        method: dto.method,
        externalRef: dto.externalRef ?? null,
        status: TxStatus.CONFIRMED,
        note: dto.note ?? null,
        createdById: adminId,
      }));

      this.logger.log(`Payout ৳${dto.amount} on ${dto.refType}/${dto.refId}`);
      return this.quote(dto.refType, dto.refId);
    });
  }

  /** Hirer paid the talent directly. Recorded only — no balance moves. */
  async recordDirect(dto: RecordDirectDto, adminId: string) {
    await this.loadRef(dto.refType, dto.refId);
    await this.txRepo.save(this.txRepo.create({
      kind: TxKind.DIRECT_TO_PLAYER,
      refType: dto.refType,
      refId: dto.refId,
      playerId: dto.playerId ?? null,
      amount: String(dto.amount),
      method: TxMethod.CASH,
      status: TxStatus.CONFIRMED,
      note: dto.note ?? null,
      createdById: adminId,
    }));
    return this.quote(dto.refType, dto.refId);
  }

  // ══════════ READ ══════════

  async ledger(refType: TxRefType, refId: string) {
    return this.txRepo.find({
      where: { refType, refId },
      order: { createdAt: 'ASC' },
    });
  }

  /** Totals for the admin dashboard. */
  async totals() {
    const rows = await this.txRepo
      .createQueryBuilder('t')
      .select('t.kind', 'kind')
      .addSelect('SUM(t.amount)', 'sum')
      .where('t.status = :s', { s: TxStatus.CONFIRMED })
      .groupBy('t.kind')
      .getRawMany();

    const by = (k: TxKind) => Number(rows.find(r => r.kind === k)?.sum ?? 0);

    return {
      received: by(TxKind.ADVANCE_IN) + by(TxKind.FULL_IN),
      commission: by(TxKind.COMMISSION),
      paidOut: by(TxKind.PAYOUT),
      refunded: by(TxKind.REFUND),
      holding: by(TxKind.ADVANCE_IN) + by(TxKind.FULL_IN)
             - by(TxKind.COMMISSION) - by(TxKind.PAYOUT) - by(TxKind.REFUND),
    };
  }

  // ══════════ TALENT-FACING ══════════

  /**
   * What one player can see about their own money.
   * Only exposes a booking once the hirer's advance has actually landed —
   * before that the numbers aren't final and shouldn't be shown.
   */
  async myEarnings(playerId: string) {
    const out: any[] = [];

    // ─── Individual bookings ───
    const bookings = await this.bookingRepo.find({
      where: { playerId },
      order: { matchDate: 'DESC' },
    });

    for (const b of bookings as any[]) {
      if (b.paymentStatus === PaymentStatus.UNPAID) continue;

      const fee = b.finalAmount ?? b.amount ?? 0;
      const commission = b.commissionAmount ?? 0;
      const paid = await this.paidToPlayer(TxRefType.BOOKING, b.id, playerId);

      // Others hired by the same hirer for the same match
      const others = await this.bookingRepo.find({
        where: { hirerId: b.hirerId, matchDate: b.matchDate },
      });

      out.push({
        refType: TxRefType.BOOKING,
        refId: b.id,
        matchDate: b.matchDate,
        tournament: b.tournament,
        hirerName: b.hirer?.name ?? null,
        hirerPhone: b.hirer?.phone ?? null,
        status: b.status,
        fee,
        commissionRate: b.commissionRate ?? 0,
        commission,
        youReceive: fee - commission,
        paidToYou: paid,
        collectFromHirer: Math.max(0, fee - commission - paid),
        teammates: (others as any[])
          .filter(o => o.playerId !== playerId)
          .map(o => ({
            name: o.player?.user?.name ?? 'Player',
            position: o.player?.position ?? null,
            photo: o.player?.photo ?? null,
          })),
      });
    }

    // ─── Team requests where this player is in the squad ───
    const teamReqs = await this.teamRepo
      .createQueryBuilder('tr')
      .where(`tr.squad @> :entry`, { entry: JSON.stringify([{ playerId }]) })
      .orderBy('tr.matchDate', 'DESC')
      .getMany();

    for (const tr of teamReqs as any[]) {
      if (tr.paymentStatus === PaymentStatus.UNPAID) continue;

      const mine = (tr.squad || []).find((s: any) => s.playerId === playerId);
      const fee = mine?.amount ?? 0;

      // Commission is on the total, so each player carries their share pro-rata.
      const squadTotal = (tr.squad || [])
        .reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
      const commission = squadTotal > 0
        ? Math.round(((tr.commissionAmount ?? 0) * fee) / squadTotal)
        : 0;

      const paid = await this.paidToPlayer(TxRefType.TEAM_REQUEST, tr.id, playerId);

      out.push({
        refType: TxRefType.TEAM_REQUEST,
        refId: tr.id,
        matchDate: tr.matchDate,
        tournament: tr.tournament,
        location: tr.location,
        hirerName: tr.hirer?.name ?? null,
        hirerPhone: tr.hirer?.phone ?? null,
        status: tr.status,
        fee,
        commissionRate: tr.commissionRate ?? 0,
        commission,
        youReceive: fee - commission,
        paidToYou: paid,
        collectFromHirer: Math.max(0, fee - commission - paid),
        feeAssigned: fee > 0,
        teammates: (tr.squad || [])
          .filter((s: any) => s.playerId !== playerId)
          .map((s: any) => ({
            name: s.playerName,
            position: s.playerPosition,
            photo: null,
          })),
      });
    }

    out.sort((a, b) => String(b.matchDate).localeCompare(String(a.matchDate)));

    return {
      matches: out,
      totals: {
        earned: out.reduce((s, m) => s + m.youReceive, 0),
        received: out.reduce((s, m) => s + m.paidToYou, 0),
        toCollect: out.reduce((s, m) => s + m.collectFromHirer, 0),
      },
    };
  }

  /** Sum of confirmed payouts to one player on one booking. */
  private async paidToPlayer(refType: TxRefType, refId: string, playerId: string) {
    const row = await this.txRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'sum')
      .where('t.refType = :refType', { refType })
      .andWhere('t.refId = :refId', { refId })
      .andWhere('t.playerId = :playerId', { playerId })
      .andWhere('t.kind IN (:...kinds)', { kinds: [TxKind.PAYOUT, TxKind.DIRECT_TO_PLAYER] })
      .andWhere('t.status = :s', { s: TxStatus.CONFIRMED })
      .getRawOne();
    return Number(row?.sum ?? 0);
  }
}