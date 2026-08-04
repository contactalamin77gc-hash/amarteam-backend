import {
  IsString, IsEnum, IsNumber, IsBoolean, IsOptional,
  Min, Max, MaxLength, IsArray, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VehicleType } from '../../common/enums';

class PhotoDto {
  @IsString()
    url!: string;
  @IsString()
    publicId!: string;
}

class DistrictChargeDto {
  @IsString() @MaxLength(100)
    district!: string;
  @IsNumber() @Min(0)
    extraCharge!: number;
}

export class CreateVehicleDto {
  @IsString() @MaxLength(150)
    model!: string;

  @IsEnum(VehicleType)
    vehicleType!: VehicleType;

  @IsNumber() @Min(1) @Max(60)
    seats!: number;

  @IsOptional() @IsBoolean()
  hasAc?: boolean;

  @IsOptional() @IsString() @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoDto)
  photos?: PhotoDto[];

  @IsNumber() @Min(100)
    basePerDay!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DistrictChargeDto)
  districtCharges?: DistrictChargeDto[];

  @IsOptional() @IsNumber() @Min(1)
  minDays?: number;

  @IsOptional() @IsNumber() @Min(1)
  maxDays?: number;

  @IsOptional() @IsString() @MaxLength(100)
  baseDistrict?: string;

  @IsOptional() @IsString() @MaxLength(20)
  registrationNo?: string;
}