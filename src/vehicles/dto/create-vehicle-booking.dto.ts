import {
  IsString, IsUUID, IsDateString, IsNumber,
  IsOptional, Min, Max, MaxLength,
} from 'class-validator';

export class CreateVehicleBookingDto {
  @IsUUID()
    vehicleId!: string;

  @IsDateString()
    startDate!: string;

  @IsNumber() @Min(1) @Max(365)
    days!: number;

  @IsString() @MaxLength(100)
    district!: string;

  @IsOptional() @IsString() @MaxLength(100)
  upazila?: string;

  @IsOptional() @IsString() @MaxLength(250)
  pickupAddress?: string;

  @IsOptional() @IsString() @MaxLength(500)
  message?: string;
}