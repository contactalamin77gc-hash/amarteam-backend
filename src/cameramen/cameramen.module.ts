import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CameramanBooking } from './entities/cameraman-booking.entity';
import { CameramenService } from './cameramen.service';
import { CameramenController } from './cameramen.controller';
import { PlayersModule } from '../players/players.module';

@Module({
  imports: [TypeOrmModule.forFeature([CameramanBooking]), PlayersModule],
  providers: [CameramenService],
  controllers: [CameramenController],
})
export class CameramenModule {}