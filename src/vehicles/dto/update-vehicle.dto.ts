import {
  IsString, IsEnum, IsNumber, IsBoolean, IsOptional,
  Min, Max, MaxLength, IsArray,
} from 'class-validator';
import { VehicleType } from '../../common/enums';

export class UpdateVehicleDto {
  @IsOptional() @IsString() @MaxLength(150) model?: string;
  @IsOptional() @IsEnum(VehicleType) vehicleType?: VehicleType;
  @IsOptional() @IsNumber() @Min(1) @Max(60) seats?: number;
  @IsOptional() @IsBoolean() hasAc?: boolean;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @IsOptional() @IsArray() photos?: any[];
  @IsOptional() @IsNumber() @Min(100) basePerDay?: number;
  @IsOptional() @IsArray() districtCharges?: any[];
  @IsOptional() @IsNumber() @Min(1) minDays?: number;
  @IsOptional() @IsNumber() @Min(1) maxDays?: number;
  @IsOptional() @IsBoolean() isAvailable?: boolean;
  @IsOptional() @IsArray() unavailableDates?: string[];
  @IsOptional() @IsString() @MaxLength(100) baseDistrict?: string;
  @IsOptional() @IsString() @MaxLength(20) registrationNo?: string;
}