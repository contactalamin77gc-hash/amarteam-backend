import {
  IsString, IsNumber, IsBoolean, IsOptional, IsArray,
  IsEnum, IsUUID, Min, MaxLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../common/enums';

class PhotoDto {
  @IsString()
    url!: string;
  @IsString()
    publicId!: string;
}

// ─── CATEGORY ───

export class CreateCategoryDto {
  @IsString() @MaxLength(100)
    name!: string;
  @IsOptional() @IsString() @MaxLength(100) nameBn?: string;
  @IsOptional() @IsString() @MaxLength(10) icon?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() imagePublicId?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsNumber() sortOrder?: number;
}

export class UpdateCategoryDto {
  @IsOptional() @IsString() @MaxLength(100) name?: string;
  @IsOptional() @IsString() @MaxLength(100) nameBn?: string;
  @IsOptional() @IsString() @MaxLength(10) icon?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() imagePublicId?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsNumber() sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

// ─── PRODUCT ───

class VariantDto {
  @IsString()
    name!: string;
  @IsArray()
    options!: string[];
}

export class CreateProductDto {
  @IsString() @MaxLength(200)
    name!: string;
  @IsOptional() @IsString() @MaxLength(200) nameBn?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsUUID() categoryId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoDto)
  photos?: PhotoDto[];

  @IsNumber() @Min(1)
    price!: number;
  @IsOptional() @IsNumber() @Min(0) oldPrice?: number;
  @IsOptional() @IsNumber() @Min(0) stock?: number;
  @IsOptional() @IsString() @MaxLength(100) brand?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];

  @IsOptional() @IsNumber() @Min(0) dhakaDeliveryCharge?: number;
  @IsOptional() @IsNumber() @Min(0) outsideDeliveryCharge?: number;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
}

export class UpdateProductDto {
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsString() @MaxLength(200) nameBn?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsArray() photos?: any[];
  @IsOptional() @IsNumber() @Min(1) price?: number;
  @IsOptional() @IsNumber() @Min(0) oldPrice?: number;
  @IsOptional() @IsNumber() @Min(0) stock?: number;
  @IsOptional() @IsString() @MaxLength(100) brand?: string;
  @IsOptional() @IsArray() variants?: any[];
  @IsOptional() @IsNumber() @Min(0) dhakaDeliveryCharge?: number;
  @IsOptional() @IsNumber() @Min(0) outsideDeliveryCharge?: number;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

// ─── ORDER ───

class OrderItemDto {
  @IsUUID()
    productId!: string;
  @IsNumber() @Min(1)
    quantity!: number;
  @IsOptional() @IsString() variant?: string;
}

export class CreateOrderDto {
  @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items!: OrderItemDto[];

  @IsString() @MaxLength(100)
    recipientName!: string;
  @IsString() @MaxLength(20)
    phone!: string;
  @IsString() @MaxLength(100)
    district!: string;
  @IsOptional() @IsString() @MaxLength(100) upazila?: string;
  @IsString() @MaxLength(500)
    address!: string;
  @IsOptional() @IsString() @MaxLength(500) note?: string;
  @IsOptional() @IsString() @MaxLength(50) paymentMethod?: string;
}

export class UpdateOrderDto {
  @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @IsOptional() @IsBoolean() isPaid?: boolean;
  @IsOptional() @IsString() @MaxLength(100) transactionId?: string;
  @IsOptional() @IsString() @MaxLength(1000) adminNote?: string;
}