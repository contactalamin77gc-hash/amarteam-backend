import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';

export class CreatePlayerRequestDto {
  @IsString()
  @MaxLength(150)
  requesterName!: string;

  @IsString()
  @Matches(/^01\d{9}$/, { message: 'Enter a valid BD phone number (01XXXXXXXXX)' })
  phone!: string;

  @IsString()
  @MaxLength(150)
  playerName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  club?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  tournament?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}