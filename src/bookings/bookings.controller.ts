import {
  Controller, Get, Post, Patch, Body,
  Param, ParseUUIDPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role, BookingStatus } from '../common/enums';
import { User } from '../users/entities/user.entity';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // Hirer: create booking
  @Post()
  @Roles(Role.HIRER)
  create(@CurrentUser() user: User, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.id, dto);
  }

  // Hirer: get own bookings
  @Get('my')
  @Roles(Role.HIRER)
  getMyBookings(@CurrentUser() user: User) {
    return this.bookingsService.findByHirer(user.id);
  }

  // Player: get bookings for self
  @Get('player/my')
  @Roles(Role.PLAYER)
  getPlayerBookings(@CurrentUser() user: User) {
    return this.bookingsService.findByPlayer(user.id);
  }

  // Admin: get all bookings
  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.bookingsService.findAll();
  }

  // Admin: single booking with full relations
  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.findOne(id);
  }

  // Admin: full update — status, amounts, notes
  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, dto);
  }

  // Admin: confirm booking
  @Patch(':id/confirm')
  @Roles(Role.ADMIN)
  confirm(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.updateStatus(id, BookingStatus.CONFIRMED);
  }

  // Admin: cancel booking
  @Patch(':id/cancel')
  @Roles(Role.ADMIN)
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.updateStatus(id, BookingStatus.CANCELLED);
  }

  // Admin: complete booking
  @Patch(':id/complete')
  @Roles(Role.ADMIN)
  complete(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.updateStatus(id, BookingStatus.COMPLETED);
  }
}