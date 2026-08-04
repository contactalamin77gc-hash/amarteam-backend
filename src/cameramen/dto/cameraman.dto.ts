import {
  IsString, IsUUID, IsDateString, IsNumber,
  IsOptional, Min, Max, MaxLength, IsEnum,
} from 'class-validator';
import { ServiceBookingStatus } from '../../common/enums';

export class CreateCameramanBookingDto {
  @IsUUID()
    cameramanId!: string;

  @IsDateString()
    matchDate!: string;

  @IsOptional() @IsString() @MaxLength(150)
  tournament?: string;

  @IsString() @MaxLength(100)
    district!: string;

  @IsOptional() @IsString() @MaxLength(100)
  upazila?: string;

  @IsOptional() @IsString() @MaxLength(250)
  venue?: string;

  @IsOptional() @IsString() @MaxLength(20)
  startTime?: string;

  @IsOptional() @IsNumber() @Min(1) @Max(24)
  durationHours?: number;

  @IsOptional() @IsString() @MaxLength(500)
  message?: string;
}

export class UpdateCameramanBookingDto {
  @IsOptional() @IsEnum(ServiceBookingStatus) status?: ServiceBookingStatus;
  @IsOptional() @IsNumber() @Min(0) finalAmount?: number;
  @IsOptional() @IsNumber() @Min(0) advanceAmount?: number;
  @IsOptional() @IsString() @MaxLength(1000) adminNote?: string;
}