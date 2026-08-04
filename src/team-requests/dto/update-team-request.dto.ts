import { IsOptional, IsString, IsNumber, IsEnum, Min, MaxLength } from 'class-validator';
import { TeamRequestStatus } from '../../common/enums';

export class UpdateTeamRequestDto {
  @IsOptional() @IsEnum(TeamRequestStatus)
  status?: TeamRequestStatus;

  @IsOptional() @IsString() @MaxLength(1000)
  adminNote?: string;

  @IsOptional() @IsNumber() @Min(0)
  finalAmount?: number;

  @IsOptional() @IsNumber() @Min(0)
  advanceAmount?: number;
}