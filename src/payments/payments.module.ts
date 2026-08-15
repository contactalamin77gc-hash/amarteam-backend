import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Transaction } from './entities/transaction.entity';
import { Setting } from '../settings/entities/setting.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { TeamRequest } from '../team-requests/entities/team-request.entity';
import { CameramanBooking } from '../cameramen/entities/cameraman-booking.entity';
import { VehicleBooking } from '../vehicles/entities/vehicle-booking.entity';
import { PlayersModule } from '../players/players.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction, Setting, Booking,
      TeamRequest, CameramanBooking, VehicleBooking,
    ]),
    PlayersModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}