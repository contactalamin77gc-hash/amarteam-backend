import {
  IsEmail, IsString, MinLength, MaxLength,
  IsOptional, Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString()
    @MinLength(2)
    @MaxLength(100)
    name!: string;

  @IsEmail()
    email!: string;

  @IsString()
    @MinLength(8)
    @MaxLength(50)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase, one lowercase, and one number',
    })
    password!: string;

  @IsOptional()
  @IsString()
  @Matches(/^01\d{9}$/, { message: 'Phone must be a valid BD number (01XXXXXXXXX)' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}