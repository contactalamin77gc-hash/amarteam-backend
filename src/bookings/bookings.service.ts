import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PlayersService } from '../players/players.service';
import { BookingMailService } from '../notifications/booking-mail.service';
import { BookingStatus } from '../common/enums';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingsRepo: Repository<Booking>,
    private playersService: PlayersService,
    private bookingMail: BookingMailService,
  ) {}

  async create(hirerId: string, dto: CreateBookingDto): Promise<Booking> {
    const player = await this.playersService.findOne(dto.playerId);

    if (!player.isAvailable) {
      throw new BadRequestException('Player is not available');
    }

    if (player.unavailableDates.includes(dto.matchDate)) {
      throw new BadRequestException('Player is not available on this date');
    }

    const existing = await this.bookingsRepo.findOne({
      where: {
        playerId: dto.playerId,
        matchDate: dto.matchDate,
        status: BookingStatus.CONFIRMED,
      },
    });
    if (existing) {
      throw new BadRequestException('Player already booked for this date');
    }

    // Calculate amount based on match type and discount
    const charges = player.charges;
    const matchType = dto.matchType as 'friendly' | 'groupRound' | 'final';
    const discountKey = `${matchType}Discount` as keyof typeof charges;
    const regularPrice = charges[matchType] as number;
    const discountPrice = charges[discountKey] as number | null;
    const amount = (discountPrice && discountPrice > 0) ? discountPrice : regularPrice;

    const booking = this.bookingsRepo.create({
      hirerId,
      playerId: dto.playerId,
      matchDate: dto.matchDate,
      tournament: dto.tournament,
      message: dto.message,
      amount,
      status: BookingStatus.CALLING_SOON,
    });

    return this.bookingsRepo.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingsRepo.find({
      relations: ['hirer', 'player', 'player.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepo.findOne({
      where: { id },
      relations: ['hirer', 'player', 'player.user'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findByHirer(hirerId: string): Promise<Booking[]> {
    return this.bookingsRepo.find({
      where: { hirerId },
      relations: ['player', 'player.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPlayer(userId: string): Promise<Booking[]> {
    const player = await this.playersService.findByUserId(userId);
    return this.bookingsRepo.find({
      where: { playerId: player.id },
      relations: ['hirer'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Admin edit. No transition rules — bookings are coordinated by phone and
   * admin sometimes needs to move a status backwards after a call.
   */
  async update(id: string, dto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);
    const previousStatus = booking.status;

    if (dto.status !== undefined) booking.status = dto.status;
    if (dto.finalAmount !== undefined) booking.finalAmount = dto.finalAmount;
    if (dto.advanceAmount !== undefined) booking.advanceAmount = dto.advanceAmount;
    if (dto.adminNote !== undefined) booking.adminNote = dto.adminNote;

    const saved = await this.bookingsRepo.save(booking);

    // Fire-and-forget — a mail failure must not roll back the status change.
    if (dto.status !== undefined && dto.status !== previousStatus) {
      this.notifyStatus(saved, dto.status).catch(err =>
        this.logger.warn(`Status mail failed for booking ${id}: ${err.message}`),
      );
    }

    return saved;
  }

  /** Kept for the existing confirm/cancel/complete shortcut endpoints. */
  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    return this.update(id, { status });
  }

  // ══════════ NOTIFICATIONS ══════════

  private async notifyStatus(booking: any, status: string) {
    const hirerEmail = booking.hirer?.email;
    const hirerName = booking.hirer?.name || 'there';

    // Shape a single booking to look like a team request so the
    // existing mail templates can render it unchanged.
    const asRequest = {
      matchDate: booking.matchDate,
      tournament: booking.tournament,
      location: null,
      finalAmount: booking.finalAmount ?? booking.amount,
      amountPaid: booking.amountPaid ?? 0,
      adminNote: booking.adminNote,
      hirer: booking.hirer,
      squad: booking.player ? [{
        playerId: booking.playerId,
        playerName: booking.player?.user?.name || 'Player',
        playerPosition: booking.player?.position || '',
        amount: booking.finalAmount ?? booking.amount,
      }] : [],
    };

    if (status === BookingStatus.CONFIRMED) {
      await this.bookingMail.teamConfirmed(hirerEmail, hirerName, asRequest);

      const talentEmail = booking.player?.user?.email;
      if (talentEmail) {
        await this.bookingMail.talentConfirmed(
          talentEmail,
          booking.player.user.name,
          asRequest,
          booking.finalAmount ?? booking.amount ?? 0,
          [],   // solo booking, no teammates
        );
      }
      return;
    }

    if (status === BookingStatus.PLAYER_ON_THE_WAY) {
      await this.bookingMail.playersOnTheWay(hirerEmail, hirerName, asRequest);
      return;
    }

    if (status === BookingStatus.COMPLETED) {
      await this.bookingMail.teamCompleted(hirerEmail, hirerName, asRequest);
      return;
    }

    if (status === BookingStatus.CANCELLED) {
      await this.bookingMail.teamCancelled(hirerEmail, hirerName, asRequest, booking.adminNote);
    }
  }
}