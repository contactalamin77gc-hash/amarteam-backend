import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleBooking } from './entities/vehicle-booking.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CreateVehicleBookingDto } from './dto/create-vehicle-booking.dto';
import { UpdateServiceBookingDto } from './dto/update-booking.dto';
import { UploadService } from '../upload/upload.service';
import { ServiceBookingStatus } from '../common/enums';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(VehicleBooking)
    private bookingRepo: Repository<VehicleBooking>,
    private uploadService: UploadService,
  ) {}

  // ─── Vehicle CRUD ───

  async create(dto: CreateVehicleDto): Promise<Vehicle> {
    const v = this.vehicleRepo.create({
      ...dto,
      photos: (dto.photos as any) || [],
      districtCharges: (dto.districtCharges as any) || [],
    } as any);
    return this.vehicleRepo.save(v) as any;
  }

  async findAll(query?: {
    vehicleType?: string;
    seats?: string;
    district?: string;
    available?: string;
    search?: string;
    sort?: string;
  }): Promise<Vehicle[]> {
    const qb = this.vehicleRepo.createQueryBuilder('v');

    if (query?.vehicleType) qb.andWhere('v.vehicleType = :vt', { vt: query.vehicleType });
    if (query?.seats) qb.andWhere('v.seats >= :s', { s: Number(query.seats) });
    if (query?.available === 'true') qb.andWhere('v.isAvailable = true');
    if (query?.available === 'false') qb.andWhere('v.isAvailable = false');
    if (query?.search) {
      qb.andWhere('(v.model ILIKE :q OR v.description ILIKE :q)', { q: `%${query.search}%` });
    }

    switch (query?.sort) {
      case 'price-low': qb.orderBy('v.basePerDay', 'ASC'); break;
      case 'price-high': qb.orderBy('v.basePerDay', 'DESC'); break;
      case 'seats': qb.orderBy('v.seats', 'DESC'); break;
      default: qb.orderBy('v.createdAt', 'DESC');
    }

    return qb.getMany();
  }

  async findAllPublic(query?: any): Promise<Vehicle[]> {
    return this.findAll({ ...query, available: 'true' });
  }

  async findOne(id: string): Promise<Vehicle> {
    const v = await this.vehicleRepo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Vehicle not found');
    return v;
  }

  async update(id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
    const v = await this.findOne(id);
    Object.assign(v, dto);
    return this.vehicleRepo.save(v);
  }

  async toggleAvailability(id: string): Promise<Vehicle> {
    const v = await this.findOne(id);
    v.isAvailable = !v.isAvailable;
    return this.vehicleRepo.save(v);
  }

  async remove(id: string): Promise<void> {
    const v = await this.vehicleRepo.findOne({ where: { id }, relations: ['bookings'] });
    if (!v) throw new NotFoundException('Vehicle not found');

    // Delete photos from Cloudinary
    for (const photo of v.photos || []) {
      await this.uploadService.delete(photo.publicId, 'image');
    }

    if (v.bookings?.length > 0) {
      await this.bookingRepo.remove(v.bookings);
    }

    await this.vehicleRepo.remove(v);
  }

  // ─── Price calculator ───

  calculatePrice(vehicle: Vehicle, district: string, days: number): number {
    const base = vehicle.basePerDay * days;
    const surcharge = vehicle.districtCharges?.find(
      dc => dc.district.toLowerCase() === district.toLowerCase()
    )?.extraCharge || 0;
    return base + surcharge;
  }

  // ─── Bookings ───

  async createBooking(customerId: string, dto: CreateVehicleBookingDto): Promise<VehicleBooking> {
    const vehicle = await this.findOne(dto.vehicleId);

    if (!vehicle.isAvailable) {
      throw new BadRequestException('This vehicle is not available');
    }

    if (dto.days < vehicle.minDays) {
      throw new BadRequestException(`Minimum booking is ${vehicle.minDays} day(s)`);
    }
    if (vehicle.maxDays && dto.days > vehicle.maxDays) {
      throw new BadRequestException(`Maximum booking is ${vehicle.maxDays} day(s)`);
    }

    // Check date conflicts
    const requested: string[] = [];
    const start = new Date(dto.startDate);
    for (let i = 0; i < dto.days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      requested.push(d.toISOString().slice(0, 10));
    }

    const blocked = requested.filter(d => vehicle.unavailableDates?.includes(d));
    if (blocked.length > 0) {
      throw new BadRequestException(`Vehicle unavailable on: ${blocked.join(', ')}`);
    }

    const estimatedAmount = this.calculatePrice(vehicle, dto.district, dto.days);

    const booking = this.bookingRepo.create({
      customerId,
      vehicleId: dto.vehicleId,
      startDate: dto.startDate,
      days: dto.days,
      district: dto.district,
      upazila: dto.upazila,
      pickupAddress: dto.pickupAddress,
      message: dto.message,
      estimatedAmount,
      status: ServiceBookingStatus.ADVANCE_PENDING,
    } as any);

    return this.bookingRepo.save(booking) as any;
  }

  async findAllBookings(status?: string): Promise<VehicleBooking[]> {
    const qb = this.bookingRepo.createQueryBuilder('b')
      .leftJoinAndSelect('b.customer', 'customer')
      .leftJoinAndSelect('b.vehicle', 'vehicle')
      .orderBy('b.createdAt', 'DESC');

    if (status) qb.andWhere('b.status = :status', { status });
    return qb.getMany();
  }

  async findMyBookings(customerId: string): Promise<VehicleBooking[]> {
    return this.bookingRepo.find({
      where: { customerId },
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneBooking(id: string): Promise<VehicleBooking> {
    const b = await this.bookingRepo.findOne({
      where: { id },
      relations: ['customer', 'vehicle'],
    });
    if (!b) throw new NotFoundException('Booking not found');
    return b;
  }

  async updateBooking(id: string, dto: UpdateServiceBookingDto): Promise<VehicleBooking> {
    const b = await this.findOneBooking(id);
    if (dto.status !== undefined) b.status = dto.status;
    if (dto.finalAmount !== undefined) b.finalAmount = dto.finalAmount;
    if (dto.advanceAmount !== undefined) b.advanceAmount = dto.advanceAmount;
    if (dto.adminNote !== undefined) b.adminNote = dto.adminNote;

    // Auto-block dates when confirmed
    if (dto.status === ServiceBookingStatus.CONFIRMED) {
      const vehicle = await this.findOne(b.vehicleId);
      const dates: string[] = [...(vehicle.unavailableDates || [])];
      const start = new Date(b.startDate);
      for (let i = 0; i < b.days; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const ds = d.toISOString().slice(0, 10);
        if (!dates.includes(ds)) dates.push(ds);
      }
      vehicle.unavailableDates = dates.sort();
      await this.vehicleRepo.save(vehicle);
    }

    return this.bookingRepo.save(b);
  }

  async removeBooking(id: string): Promise<void> {
    const b = await this.findOneBooking(id);
    await this.bookingRepo.remove(b);
  }
}