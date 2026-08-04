import {
  IsEmail, IsString, MinLength, MaxLength,
  IsOptional, Matches, IsEnum, Length,
} from 'class-validator';
import { OtpChannel, OtpPurpose } from '../../common/enums';

export class RegisterDto {
  @IsString() @MinLength(2) @MaxLength(100)
    name!: string;

  @IsEmail({}, { message: 'Enter a valid email address' })
    email!: string;

  @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @MaxLength(72)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain an uppercase letter, a lowercase letter and a number',
    })
    password!: string;

  @IsString()
    @Matches(/^01\d{9}$/, { message: 'Enter a valid Bangladeshi phone number (01XXXXXXXXX)' })
    phone!: string;

  @IsOptional() @IsString() @MaxLength(100)
  location?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Enter a valid email address' })
    email!: string;

  @IsString() @MinLength(1, { message: 'Password is required' })
    password!: string;
}

export class SendOtpDto {
  @IsString() @MaxLength(150)
    identifier!: string; // email or phone

  @IsEnum(OtpChannel)
    channel!: OtpChannel;

  @IsEnum(OtpPurpose)
    purpose!: OtpPurpose;
}

export class VerifyOtpDto {
  @IsString() @MaxLength(150)
    identifier!: string;

  @IsString() @Length(6, 6, { message: 'Code must be 6 digits' })
    code!: string;

  @IsEnum(OtpPurpose)
    purpose!: OtpPurpose;
}

export class ResetPasswordDto {
  @IsString() @MaxLength(150)
    identifier!: string;

  @IsString() @Length(6, 6)
    code!: string;

  @IsString()
    @MinLength(8)
    @MaxLength(72)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain an uppercase letter, a lowercase letter and a number',
    })
    newPassword!: string;
}

export class ChangePasswordDto {
  @IsString()
    currentPassword!: string;

  @IsString()
    @MinLength(8)
    @MaxLength(72)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain an uppercase letter, a lowercase letter and a number',
    })
    newPassword!: string;
}

export class OtpLoginDto {
  @IsString() @MaxLength(150)
    identifier!: string;

  @IsString() @Length(6, 6)
    code!: string;
}