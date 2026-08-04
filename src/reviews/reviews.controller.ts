import {
  Controller, Get, Post, Delete, Body,
  Param, ParseUUIDPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import { User } from '../users/entities/user.entity';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // Public: get reviews for a player
  @Get('player/:playerId')
  @Public()
  findByPlayer(@Param('playerId', ParseUUIDPipe) playerId: string) {
    return this.reviewsService.findByPlayer(playerId);
  }

  // Hirer: create review
  @Post()
  @Roles(Role.HIRER)
  create(@CurrentUser() user: User, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }

  // Admin: get all reviews
  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.reviewsService.findAll();
  }

  // Admin: delete a review
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.remove(id);
  }
}