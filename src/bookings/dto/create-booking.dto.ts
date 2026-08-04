import { IsString, IsUUID, IsDateString, IsOptional, MaxLength, IsEnum } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  playerId!: string;

  @IsDateString()
  matchDate!: string;

  @IsString()
  @MaxLength(150)
  tournament!: string;

  @IsEnum(['friendly', 'groupRound', 'final'])
  matchType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}