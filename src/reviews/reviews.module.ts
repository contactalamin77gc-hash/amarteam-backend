import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { PlayersModule } from '../players/players.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review]), PlayersModule],
  providers: [ReviewsService],
  controllers: [ReviewsController],
})
export class ReviewsModule {}