import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerRequest } from './player-request.entity';
import { PlayerRequestsService } from './player-requests.service';
import { PlayerRequestsController } from './player-requests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerRequest])],
  controllers: [PlayerRequestsController],
  providers: [PlayerRequestsService],
})
export class PlayerRequestsModule {}