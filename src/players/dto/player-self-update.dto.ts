import {
  IsString, IsOptional, IsArray, IsObject, IsBoolean,
  IsNumber, IsEnum, Min, Max, MaxLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Position } from '../../common/enums';

class ClubEntryDto {
  @IsString() @MaxLength(100)
  name!: string;
  @IsNumber()
  joinYear!: number;
  @IsOptional() @IsNumber() leftYear?: number | null;
  @IsOptional() @IsBoolean() isCurrent?: boolean;
}

class NationalTeamEntryDto {
  @IsString()
  level!: string;
  @IsNumber()
  year!: number;
  @IsOptional() @IsBoolean() isCurrent?: boolean;
}

class ChargesDto {
  @IsNumber() @Min(500)
  friendly!: number;
  @IsNumber() @Min(500)
  groupRound!: number;
  @IsNumber() @Min(500)
  final!: number;
  @IsOptional() @IsNumber() @Min(0) friendlyDiscount?: number | null;
  @IsOptional() @IsNumber() @Min(0) groupRoundDiscount?: number | null;
  @IsOptional() @IsNumber() @Min(0) finalDiscount?: number | null;
}

class VideoEntryDto {
  @IsString()
  url!: string;
  @IsString()
  publicId!: string;
  @IsOptional() @IsString() thumbnailUrl?: string;
  @IsOptional() @IsString() @MaxLength(200) title?: string;
  @IsOptional() @IsNumber() duration?: number;
}

class PhotoEntryDto {
  @IsString()
  url!: string;
  @IsString()
  publicId!: string;
}

class MatchHistoryEntryDto {
  @IsString()
  date!: string;
  @IsOptional() @IsString() @MaxLength(150) tournament?: string;
  @IsString() @MaxLength(150)
  opponent!: string;
  @IsString() @MaxLength(50)
  result!: string;
  @IsOptional() @IsString() @MaxLength(200) performance?: string;
}

export class PlayerSelfUpdateDto {
  // ─── Common (all types) ───
  @IsOptional() @IsString() @MaxLength(1000) bio?: string;
  @IsOptional() @IsString() photo?: string;
  @IsOptional() @IsString() photoPublicId?: string;
  @IsOptional() @IsString() @MaxLength(100) location?: string;
  @IsOptional() @IsNumber() @Min(0) @Max(60) experience?: number;
  @IsOptional() @IsNumber() @Min(15) @Max(70) age?: number;

  // ─── Location (required for cameramen) ───
  @IsOptional() @IsString() @MaxLength(100) district?: string;
  @IsOptional() @IsString() @MaxLength(100) upazila?: string;

  // ─── Player only ───
  @IsOptional() @IsEnum(Position) position?: Position;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ChargesDto)
  charges?: ChargesDto;

  // ─── Coach only ───
  @IsOptional() @IsString() @MaxLength(100) coachingLicense?: string;
  @IsOptional() @IsString() @MaxLength(100) specialization?: string;
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoEntryDto)
  portfolioPhotos?: PhotoEntryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VideoEntryDto)
  portfolioVideos?: VideoEntryDto[];

  // ─── Shared arrays ───
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VideoEntryDto)
  videos?: VideoEntryDto[];

  @IsOptional() @IsArray() availableDates?: string[];
  @IsOptional() @IsArray() unavailableDates?: string[];
  @IsOptional() @IsArray() tournaments?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchHistoryEntryDto)
  matchHistory?: MatchHistoryEntryDto[];
}