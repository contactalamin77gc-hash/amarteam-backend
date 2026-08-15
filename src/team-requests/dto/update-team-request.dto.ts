import { IsOptional, IsString, IsNumber, IsEnum, Min, MaxLength, ValidateNested, IsArray } from 'class-validator';
import { TeamRequestStatus } from '../../common/enums';
import { Type } from 'class-transformer';

class SquadEntryDto {
  @IsString() positionKey!: string;
  @IsString() playerId!: string;
  @IsString() playerName!: string;
  @IsString() playerPosition!: string;

  /** Fee assigned by admin after the confirmation call. */
  @IsOptional() @IsNumber() @Min(0)
  amount?: number;
}

export class UpdateTeamRequestDto {
  @IsOptional() @IsEnum(TeamRequestStatus)
  status?: TeamRequestStatus;

  @IsOptional() @IsString() @MaxLength(1000)
  adminNote?: string;

  @IsOptional() @IsNumber() @Min(0)
  finalAmount?: number;

  @IsOptional() @IsNumber() @Min(0)
  advanceAmount?: number;
  @IsOptional() @IsNumber() @Min(0)
  amount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SquadEntryDto)
  squad?: SquadEntryDto[];
}