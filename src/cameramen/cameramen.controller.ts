import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { CameramenService } from './cameramen.service';
import { CreateCameramanBookingDto, UpdateCameramanBookingDto } from './dto/cameraman.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import { User } from '../users/entities/user.entity';

@Controller('cameramen')
export class CameramenController {
  constructor(private cmService: CameramenService) {}

  @Post('bookings')
  createBooking(@CurrentUser() user: User, @Body() dto: CreateCameramanBookingDto) {
    return this.cmService.createBooking(user.id, dto);
  }

  @Get('bookings/my')
  getMyBookings(@CurrentUser() user: User) {
    return this.cmService.findMyBookings(user.id);
  }

  @Get('bookings/received')
  @Roles(Role.PLAYER)
  getReceivedBookings(@CurrentUser() user: User) {
    return this.cmService.findCameramanBookings(user.id);
  }

  @Get('bookings/all')
  @Roles(Role.ADMIN)
  getAllBookings(@Query('status') status?: string) {
    return this.cmService.findAllBookings(status);
  }

  // @Get('bookings/:id')
  // @Roles(Role.ADMIN)
  // getBooking(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.cmService.findOneBooking(id);
  // }

  @Get('bookings/:id')
async getBooking(
  @Param('id', ParseUUIDPipe) id: string,
  @CurrentUser() user: User,
) {
  const b = await this.cmService.findOneBooking(id);
  const isOwner = b.customerId === user.id;
  const isCameraman = b.cameraman?.userId === user.id;
  if (user.role !== Role.ADMIN && !isOwner && !isCameraman) {
    throw new ForbiddenException('You do not have access to this booking');
  }
  return b;
}

  @Patch('bookings/:id')
  @Roles(Role.ADMIN)
  updateBooking(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCameramanBookingDto) {
    return this.cmService.updateBooking(id, dto);
  }

  @Delete('bookings/:id')
  @Roles(Role.ADMIN)
  removeBooking(@Param('id', ParseUUIDPipe) id: string) {
    return this.cmService.removeBooking(id);
  }
}