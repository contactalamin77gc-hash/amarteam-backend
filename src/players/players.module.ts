import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Player]), UsersModule],
  providers: [PlayersService],
  controllers: [PlayersController],
  exports: [PlayersService],
})
export class PlayersModule {}