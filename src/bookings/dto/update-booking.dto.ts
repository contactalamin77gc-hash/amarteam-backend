import { IsOptional, IsEnum, IsNumber, IsString, Min, MaxLength } from 'class-validator';
import { BookingStatus } from '../../common/enums';

export class UpdateBookingDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional() @IsNumber() @Min(0)
  finalAmount?: number;

  @IsOptional() @IsNumber() @Min(0)
  advanceAmount?: number;

  @IsOptional() @IsString() @MaxLength(2000)
  adminNote?: string;
}