import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^01\d{9}$/, { message: 'Invalid BD phone number' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}