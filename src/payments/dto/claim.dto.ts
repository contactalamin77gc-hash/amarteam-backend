import {
  IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID,
  Min, MaxLength, ValidateNested, ArrayMinSize, ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TxRefType, TxMethod } from '../../common/enums';

export class ClaimRefDto {
  @IsEnum(TxRefType) refType!: TxRefType;
  @IsUUID() refId!: string;
  @IsInt() @Min(1) amount!: number;
  @IsOptional() @IsString() @MaxLength(200) label?: string;
}

export class SubmitClaimDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ClaimRefDto)
  refs!: ClaimRefDto[];

  @IsEnum(TxMethod)
  method!: TxMethod;

  @IsString() @MaxLength(120)
  externalRef!: string;

  @IsOptional() @IsString() @MaxLength(20)
  senderNumber?: string;

  @IsOptional() @IsString() @MaxLength(500)
  note?: string;
}

export class ReviewClaimDto {
  @IsOptional() @IsString() @MaxLength(500)
  adminNote?: string;
}