import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CameramanBooking } from './entities/cameraman-booking.entity';
import { CreateCameramanBookingDto, UpdateCameramanBookingDto } from './dto/cameraman.dto';
import { PlayersService } from '../players/players.service';
import { ServiceBookingStatus, PlayerType } from '../common/enums';

@Injectable()
export class CameramenService {
  constructor(
    @InjectRepository(CameramanBooking)
    private bookingRepo: Repository<CameramanBooking>,
    private playersService: PlayersService,
  ) {}

  async createBooking(customerId: string, dto: CreateCameramanBookingDto): Promise<CameramanBooking> {
    const cm = await this.playersService.findOne(dto.cameramanId);

    if (cm.playerType !== PlayerType.CAMERAMAN) {
      throw new BadRequestException('This profile is not a cameraman');
    }
    if (!cm.isApproved) {
      throw new BadRequestException('This cameraman is not approved yet');
    }
    if (!cm.isAvailable) {
      throw new BadRequestException('This cameraman is not available');
    }
    if (cm.unavailableDates?.includes(dto.matchDate)) {
      throw new BadRequestException('Cameraman is unavailable on this date');
    }

    const booking = this.bookingRepo.create({
      customerId,
      cameramanId: dto.cameramanId,
      matchDate: dto.matchDate,
      tournament: dto.tournament,
      district: dto.district,
      upazila: dto.upazila,
      venue: dto.venue,
      startTime: dto.startTime,
      durationHours: dto.durationHours || 2,
      message: dto.message,
      quotedRate: cm.perMatchRate || 0,
      status: ServiceBookingStatus.ADVANCE_PENDING,
    } as any);

    return this.bookingRepo.save(booking) as any;
  }

  async findAllBookings(status?: string): Promise<CameramanBooking[]> {
    const qb = this.bookingRepo.createQueryBuilder('b')
      .leftJoinAndSelect('b.customer', 'customer')
      .leftJoinAndSelect('b.cameraman', 'cameraman')
      .leftJoinAndSelect('cameraman.user', 'cmUser')
      .orderBy('b.createdAt', 'DESC');
    if (status) qb.andWhere('b.status = :status', { status });
    return qb.getMany();
  }

  async findMyBookings(customerId: string): Promise<CameramanBooking[]> {
    return this.bookingRepo.find({
      where: { customerId },
      relations: ['cameraman', 'cameraman.user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Bookings received by a cameraman
  async findCameramanBookings(userId: string): Promise<CameramanBooking[]> {
    const cm = await this.playersService.findByUserId(userId);
    return this.bookingRepo.find({
      where: { cameramanId: cm.id },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneBooking(id: string): Promise<CameramanBooking> {
    const b = await this.bookingRepo.findOne({
      where: { id },
      relations: ['customer', 'cameraman', 'cameraman.user'],
    });
    if (!b) throw new NotFoundException('Booking not found');
    return b;
  }

  async updateBooking(id: string, dto: UpdateCameramanBookingDto): Promise<CameramanBooking> {
    const b = await this.findOneBooking(id);
    if (dto.status !== undefined) b.status = dto.status;
    if (dto.finalAmount !== undefined) b.finalAmount = dto.finalAmount;
    if (dto.advanceAmount !== undefined) b.advanceAmount = dto.advanceAmount;
    if (dto.adminNote !== undefined) b.adminNote = dto.adminNote;

    // Block the date on the cameraman when confirmed
    if (dto.status === ServiceBookingStatus.CONFIRMED) {
      const cm = await this.playersService.findOne(b.cameramanId);
      const dates = [...(cm.unavailableDates || [])];
      if (!dates.includes(b.matchDate)) {
        dates.push(b.matchDate);
        await this.playersService.adminUpdate(cm.id, { unavailableDates: dates.sort() } as any);
      }
    }

    return this.bookingRepo.save(b);
  }

  async removeBooking(id: string): Promise<void> {
    const b = await this.findOneBooking(id);
    await this.bookingRepo.remove(b);
  }
}