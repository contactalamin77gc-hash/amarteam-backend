import { IsOptional, IsEnum, IsNumber, IsString, Min, MaxLength } from 'class-validator';
import { ServiceBookingStatus } from '../../common/enums';

export class UpdateServiceBookingDto {
  @IsOptional() @IsEnum(ServiceBookingStatus)
  status?: ServiceBookingStatus;

  @IsOptional() @IsNumber() @Min(0)
  finalAmount?: number;

  @IsOptional() @IsNumber() @Min(0)
  advanceAmount?: number;

  @IsOptional() @IsString() @MaxLength(1000)
  adminNote?: string;
}