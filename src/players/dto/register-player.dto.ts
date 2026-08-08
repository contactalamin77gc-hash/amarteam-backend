import {
  IsString, IsEmail, IsEnum, IsOptional, IsNumber, IsBoolean,
  IsArray, MaxLength, MinLength, Matches, Min, Max, ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PlayerType, Position } from '../../common/enums';

class ClubEntryDto {
  @IsString() @MaxLength(100) name!: string;
  @IsNumber() joinYear!: number;
  @IsOptional() @IsNumber() leftYear?: number | null;
  @IsOptional() @IsBoolean() isCurrent?: boolean;
}

class NationalTeamEntryDto {
  @IsString() level!: string;
  @IsNumber() year!: number;
  @IsOptional() @IsBoolean() isCurrent?: boolean;
}

export class RegisterPlayerDto {
  // ─── Account (all roles) ───
  @IsString() @MinLength(2) @MaxLength(100)
  name!: string;

  @IsEmail({}, { message: 'Please enter a valid email' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and a number',
  })
  password!: string;

  @IsString()
  @Matches(/^01\d{9}$/, { message: 'Enter a valid BD phone (01XXXXXXXXX)' })
  phone!: string;

  @IsEnum(PlayerType)
  playerType!: PlayerType;

  // ─── Common profile ───
  @IsOptional() @IsString() photo?: string;
  @IsOptional() @IsString() photoPublicId?: string;

  @IsOptional() @IsNumber() @Min(14) @Max(70)
  age?: number;

  @IsOptional() @IsNumber() @Min(0) @Max(50)
  experience?: number;

  @IsOptional() @IsString() @MaxLength(100)
  district?: string;

  @IsOptional() @IsString() @MaxLength(100)
  upazila?: string;

  @IsOptional() @IsString() @MaxLength(100)
  location?: string;

  @IsOptional() @IsString() @MaxLength(1000)
  bio?: string;

  // ─── Player only ───
  @IsOptional() @IsEnum(Position)
  position?: Position;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClubEntryDto)
  clubs?: ClubEntryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NationalTeamEntryDto)
  nationalTeams?: NationalTeamEntryDto[];

  // ─── Coach only ───
  @IsOptional() @IsString() @MaxLength(100) specialization?: string;
  @IsOptional() @IsString() @MaxLength(100) coachingLicense?: string;
  @IsOptional() @IsString() @MaxLength(200) tacticsStyle?: string;

  // ─── Referee only ───
  @IsOptional() @IsString() @MaxLength(100) refereeLicense?: string;
  @IsOptional() @IsBoolean() fifaBadge?: boolean;
  @IsOptional() @IsNumber() @Min(0) matchesOfficiated?: number;

  // ─── Cameraman only ───
  @IsOptional() @IsNumber() @Min(0) perMatchRate?: number;
  @IsOptional() @IsString() @MaxLength(200) equipment?: string;
  @IsOptional() @IsBoolean() hasDrone?: boolean;
  @IsOptional() @IsBoolean() doesEditing?: boolean;

  //foreign player 
  @IsOptional()
  @IsBoolean()
  isForeign?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  nationality?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  currentCountry?: string;

  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @IsOptional()
  @IsDateString()
  availableTo?: string;
}