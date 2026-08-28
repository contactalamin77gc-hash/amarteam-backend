import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamRequest } from './entities/team-request.entity';
import { Player } from '../players/entities/player.entity';
import { CreateTeamRequestDto } from './dto/create-team-request.dto';
import { UpdateTeamRequestDto } from './dto/update-team-request.dto';
import { TeamRequestStatus } from '../common/enums';
import { BookingMailService } from '../notifications/booking-mail.service';
import { SmsService } from '../notifications/sms.service';


@Injectable()
export class TeamRequestsService {
  private readonly logger = new Logger(TeamRequestsService.name);

  constructor(
    @InjectRepository(TeamRequest)
    private trRepo: Repository<TeamRequest>,
    @InjectRepository(Player)
    private playersRepo: Repository<Player>,
    private bookingMail: BookingMailService,
        private sms: SmsService,

  ) {}

  async create(hirerId: string, dto: CreateTeamRequestDto): Promise<TeamRequest> {
    const tr = this.trRepo.create({
      hirerId,
      matchDate: dto.matchDate,
      tournament: dto.tournament,
      location: dto.location,
      budget: dto.budget || 0,
      playersNeeded: dto.playersNeeded,
      message: dto.message,
      squad: (dto.squad as any) || [],
      status: TeamRequestStatus.CALLING_SOON,
    } as any);
    return this.trRepo.save(tr) as any;
  }

  async findAll(status?: string): Promise<TeamRequest[]> {
    const qb = this.trRepo.createQueryBuilder('tr')
      .leftJoinAndSelect('tr.hirer', 'hirer')
      .orderBy('tr.createdAt', 'DESC');

    if (status) qb.andWhere('tr.status = :status', { status });
    return qb.getMany();
  }

  async findOne(id: string): Promise<TeamRequest> {
    const tr = await this.trRepo.findOne({ where: { id }, relations: ['hirer'] });
    if (!tr) throw new NotFoundException('Team request not found');
    return tr;
  }

  async findByHirer(hirerId: string): Promise<TeamRequest[]> {
    return this.trRepo.find({
      where: { hirerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByPlayer(playerId: string): Promise<TeamRequest[]> {
    const all = await this.trRepo.find({
      relations: ['hirer'],
      order: { createdAt: 'DESC' },
    });
    return all.filter(tr =>
      tr.squad?.some(s => s.playerId === playerId) ||
      tr.suggestedPlayerIds?.includes(playerId)
    );
  }

  async update(id: string, dto: UpdateTeamRequestDto): Promise<TeamRequest> {
    const tr = await this.findOne(id);
    const previousStatus = tr.status;

    if (dto.status !== undefined) tr.status = dto.status;
    if (dto.adminNote !== undefined) tr.adminNote = dto.adminNote;
    if (dto.finalAmount !== undefined) tr.finalAmount = dto.finalAmount;
    if (dto.advanceAmount !== undefined) tr.advanceAmount = dto.advanceAmount;
    // Carries the per-player fees admin assigns after the confirmation call.
    if (dto.squad !== undefined) tr.squad = dto.squad as any;

    const saved = await this.trRepo.save(tr);

    // Fire-and-forget: a mail failure must never roll back a status change.
    if (dto.status !== undefined && dto.status !== previousStatus) {
      this.notifyStatus(saved, dto.status).catch(err =>
        this.logger.warn(`Status mail failed for ${id}: ${err.message}`),
      );
    }

    return saved;
  }

  async suggestPlayers(id: string, playerIds: string[]): Promise<TeamRequest> {
    const tr = await this.findOne(id);
    tr.suggestedPlayerIds = playerIds;
    return this.trRepo.save(tr);
  }

  async remove(id: string): Promise<void> {
    const tr = await this.findOne(id);
    await this.trRepo.remove(tr);
  }

  // ══════════ NOTIFICATIONS ══════════

   private async notifyStatus(tr: any, status: string) {
    const email = tr.hirer?.email;
    const name = tr.hirer?.name || 'there';
    const phone = tr.hirer?.phone || null;

    if (status === TeamRequestStatus.CONFIRMED) {
      await this.bookingMail.teamConfirmed(email, name, tr);
      await this.sms.hirerConfirmed(phone, {
        matchDate: tr.matchDate,
        players: (tr.squad || []).length,
        total: tr.finalAmount || 0,
        paid: tr.amountPaid || 0,
      });

      // Each player gets their own fee and the list of who else is going.
      for (const s of tr.squad || []) {
        const player = await this.playersRepo.findOne({
          where: { id: s.playerId },
          relations: ['user'],
        });
        if (!player?.user) continue;

        const mates = (tr.squad || [])
          .filter((o: any) => o.playerId !== s.playerId)
          .map((o: any) => `${o.playerName} — ${o.playerPosition}`);

        await this.bookingMail.talentConfirmed(
          player.user.email, player.user.name, tr, s.amount || 0, mates,
        );
        await this.sms.talentConfirmed(player.user.phone || null, {
          matchDate: tr.matchDate,
          venue: tr.location,
          fee: s.amount || 0,
        });
      }
      return;
    }

    if (status === TeamRequestStatus.PLAYER_ON_THE_WAY) {
      await this.bookingMail.playersOnTheWay(email, name, tr);
      await this.sms.hirerOnTheWay(phone, tr.matchDate);
      return;
    }

    if (status === TeamRequestStatus.COMPLETED) {
      await this.bookingMail.teamCompleted(email, name, tr);
      return;
    }

    if (status === TeamRequestStatus.CANCELLED) {
      await this.bookingMail.teamCancelled(email, name, tr, tr.adminNote);
      await this.sms.hirerCancelled(phone, tr.matchDate);
    }
  }
}