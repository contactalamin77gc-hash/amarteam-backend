import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CreateVehicleBookingDto } from './dto/create-vehicle-booking.dto';
import { UpdateServiceBookingDto } from './dto/update-booking.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import { User } from '../users/entities/user.entity';

@Controller('vehicles')
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  // ─── PUBLIC ───

  @Get()
  @Public()
  findAll(
    @Query('vehicleType') vehicleType?: string,
    @Query('seats') seats?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.vehiclesService.findAllPublic({ vehicleType, seats, search, sort });
  }

  // ─── BOOKINGS (specific routes before :id) ───

  @Post('bookings')
  @Roles(Role.HIRER)
  createBooking(@CurrentUser() user: User, @Body() dto: CreateVehicleBookingDto) {
    return this.vehiclesService.createBooking(user.id, dto);
  }

  @Get('bookings/my')
  @Roles(Role.HIRER)
  getMyBookings(@CurrentUser() user: User) {
    return this.vehiclesService.findMyBookings(user.id);
  }

  @Get('bookings/all')
  @Roles(Role.ADMIN)
  getAllBookings(@Query('status') status?: string) {
    return this.vehiclesService.findAllBookings(status);
  }

  @Get('bookings/:id')
async getBooking(
  @Param('id', ParseUUIDPipe) id: string,
  @CurrentUser() user: User,
) {
  const b = await this.vehiclesService.findOneBooking(id);
  if (user.role !== Role.ADMIN && b.customerId !== user.id) {
    throw new ForbiddenException('You do not have access to this booking');
  }
  return b;
}

  @Patch('bookings/:id')
  @Roles(Role.ADMIN)
  updateBooking(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateServiceBookingDto) {
    return this.vehiclesService.updateBooking(id, dto);
  }

  @Delete('bookings/:id')
  @Roles(Role.ADMIN)
  removeBooking(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.removeBooking(id);
  }

  // ─── ADMIN VEHICLE MANAGEMENT ───

  @Get('admin/all')
  @Roles(Role.ADMIN)
  findAllAdmin(
    @Query('vehicleType') vehicleType?: string,
    @Query('available') available?: string,
  ) {
    return this.vehiclesService.findAll({ vehicleType, available });
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Patch(':id/toggle-availability')
  @Roles(Role.ADMIN)
  toggle(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.toggleAvailability(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.remove(id);
  }

  // ─── PUBLIC single (must be LAST) ───

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.findOne(id);
  }
}