import {
  IsNumber, IsOptional, IsString, Min, Max,
  MaxLength, IsArray, IsDateString, ValidateNested, Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

class SquadEntryDto {
  @IsString()
  positionKey!: string;
  @IsString()
  playerId!: string;
  @IsString()
  playerName!: string;
  @IsOptional() @IsString() playerPosition?: string;
}

export class CreateTeamRequestDto {
  @IsOptional() @IsDateString()
  matchDate?: string;

  @IsOptional() @IsString() @MaxLength(150)
  tournament?: string;

  @IsOptional() @IsString() @MaxLength(150)
  location?: string;

  @IsOptional() @IsNumber() @Min(0)
  budget?: number;

  @IsNumber() @Min(1) @Max(30)
  playersNeeded!: number;

  @IsString()
  @Matches(/^01\d{9}$/, { message: 'Enter a valid BD phone number (01XXXXXXXXX)' })
  phone!: string;

  @IsOptional() @IsString() @MaxLength(1000)
  message?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SquadEntryDto)
  squad?: SquadEntryDto[];
}