import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PlayersService } from '../players/players.service';
import { BookingStatus } from '../common/enums';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepo: Repository<Booking>,
    private playersService: PlayersService,
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
      status: BookingStatus.PENDING,
    });

    return this.bookingsRepo.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingsRepo.find({
      relations: ['hirer', 'player', 'player.user'],
      order: { createdAt: 'DESC' },
    });
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

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const booking = await this.bookingsRepo.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    const validTransitions: Record<string, string[]> = {
      [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    };

    const allowed = validTransitions[booking.status];
    if (!allowed || !allowed.includes(status)) {
      throw new BadRequestException(`Cannot transition from ${booking.status} to ${status}`);
    }

    booking.status = status;
    return this.bookingsRepo.save(booking);
  }
}