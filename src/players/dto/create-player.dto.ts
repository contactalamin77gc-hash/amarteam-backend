import {
  IsString, IsEnum, IsBoolean, IsNumber, IsOptional,
  Min, Max, MaxLength, IsArray, IsObject, ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Position, Tier, PlayerType } from '../../common/enums';

class ClubEntryDto {
  @IsString() @MaxLength(100)
  name!: string;
  @IsNumber()
  joinYear!: number;
  @IsOptional() @IsNumber() leftYear?: number | null;
  @IsBoolean()
  isCurrent!: boolean;
}

class NationalTeamEntryDto {
  @IsString()
  level!: string;
  @IsNumber()
  year!: number;
  @IsBoolean()
  isCurrent!: boolean;
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

export class CreatePlayerDto {
  @IsString() @MaxLength(100)
  name!: string;
  @IsString()
  email!: string;
  @IsString()
  password!: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() photo?: string;

  @IsOptional()
@IsEnum(PlayerType)
playerType?: PlayerType;

  @IsEnum(Position)
  position!: Position;
  @IsOptional() @IsEnum(Tier) tier?: Tier;

  // Club history
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClubEntryDto)
  clubs!: ClubEntryDto[];

  // National team history
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NationalTeamEntryDto)
  nationalTeams?: NationalTeamEntryDto[];

  // Charges
  @IsObject()
  @ValidateNested()
  @Type(() => ChargesDto)
  charges!: ChargesDto;

  @IsNumber() @Min(15) @Max(50)
  age!: number;
  @IsOptional() @IsNumber() @Min(0) experience?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(5) rating?: number;
  @IsOptional() @IsString() @MaxLength(100) location?: string;
  @IsOptional() @IsString() @MaxLength(1000) bio?: string;

  @IsOptional()
  @IsObject()
  stats?: {
    goals: number; assists: number; matches: number;
    cleanSheets: number; yellowCards: number; redCards: number;
  };

  // Coach fields
  @IsOptional() @IsString() @MaxLength(100)
  coachingLicense?: string;

  @IsOptional() @IsString() @MaxLength(100)
  specialization?: string;

  @IsOptional() @IsString() @MaxLength(200)
  tacticsStyle?: string;

  // Referee fields
  @IsOptional() @IsString() @MaxLength(100)
  refereeLicense?: string;

  @IsOptional() @IsBoolean()
  fifaBadge?: boolean;

  @IsOptional() @IsNumber() @Min(0)
  matchesOfficiated?: number;

  //Foreign player :

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