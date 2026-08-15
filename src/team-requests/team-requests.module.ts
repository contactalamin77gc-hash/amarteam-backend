import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamRequest } from './entities/team-request.entity';
import { TeamRequestsService } from './team-requests.service';
import { TeamRequestsController } from './team-requests.controller';
import { PlayersModule } from '../players/players.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([TeamRequest]), PlayersModule, NotificationsModule],
  providers: [TeamRequestsService],
  controllers: [TeamRequestsController],
})
export class TeamRequestsModule {}