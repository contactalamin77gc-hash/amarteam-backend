import {
  IsEnum, IsUUID, IsInt, IsOptional, IsString, Min, MaxLength,
} from 'class-validator';
import { TxRefType, TxMethod } from '../../common/enums';

export class RecordPaymentDto {
  @IsEnum(TxRefType)
  refType!: TxRefType;

  @IsUUID()
  refId!: string;

  /** Money actually received, in taka. */
  @IsInt() @Min(1)
  amount!: number;

  @IsEnum(TxMethod)
  method!: TxMethod;

  /** bKash/Nagad TrxID, or gateway reference. */
  @IsOptional() @IsString() @MaxLength(120)
  externalRef?: string;

  @IsOptional() @IsString() @MaxLength(500)
  note?: string;
}

export class RecordPayoutDto {
  @IsEnum(TxRefType)
  refType!: TxRefType;

  @IsUUID()
  refId!: string;

  /** Which talent was paid. Omit for vehicle bookings. */
  @IsOptional() @IsUUID()
  playerId?: string;

  @IsInt() @Min(1)
  amount!: number;

  @IsEnum(TxMethod)
  method!: TxMethod;

  @IsOptional() @IsString() @MaxLength(120)
  externalRef?: string;

  @IsOptional() @IsString() @MaxLength(500)
  note?: string;
}

/** Hirer paid the talent directly — recorded for the books, never held by us. */
export class RecordDirectDto {
  @IsEnum(TxRefType)
  refType!: TxRefType;

  @IsUUID()
  refId!: string;

  @IsOptional() @IsUUID()
  playerId?: string;

  @IsInt() @Min(1)
  amount!: number;

  @IsOptional() @IsString() @MaxLength(500)
  note?: string;
}