import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PlayerRequestStatus } from '../player-request.entity';

export class UpdatePlayerRequestDto {
  @IsOptional()
  @IsEnum(PlayerRequestStatus)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNote?: string;
}