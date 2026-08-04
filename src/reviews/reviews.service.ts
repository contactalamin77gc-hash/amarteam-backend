import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { PlayersService } from '../players/players.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepo: Repository<Review>,
    private playersService: PlayersService,
  ) {}

  async create(authorId: string, dto: CreateReviewDto): Promise<Review> {
    // Verify player exists
    await this.playersService.findOne(dto.playerId);

    // Prevent duplicate reviews by same user on same player
    const existing = await this.reviewsRepo.findOne({
      where: { authorId, playerId: dto.playerId },
    });
    if (existing) {
      throw new BadRequestException('You have already reviewed this player');
    }

    const review = this.reviewsRepo.create({
      authorId,
      playerId: dto.playerId,
      rating: dto.rating,
      text: dto.text,
    });

    const saved = await this.reviewsRepo.save(review);

    // Recalculate player average rating
    await this.playersService.recalculateRating(dto.playerId);

    return saved;
  }

  async findByPlayer(playerId: string): Promise<Review[]> {
    return this.reviewsRepo.find({
      where: { playerId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Review[]> {
    return this.reviewsRepo.find({
      relations: ['author', 'player', 'player.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    const review = await this.reviewsRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    const playerId = review.playerId;
    await this.reviewsRepo.remove(review);

    // Recalculate after deletion
    await this.playersService.recalculateRating(playerId);
  }
}