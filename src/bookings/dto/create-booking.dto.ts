import { IsString, IsUUID, IsDateString, IsOptional, MaxLength, IsEnum, Matches } from 'class-validator';

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

  @IsString()
  @Matches(/^01\d{9}$/, { message: 'Enter a valid BD phone number (01XXXXXXXXX)' })
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}