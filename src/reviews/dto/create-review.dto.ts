import { IsUUID, IsString, IsNumber, Min, Max, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
    playerId!: string;

  @IsNumber()
    @Min(1)
    @Max(5)
    rating!: number;

  @IsString()
    @MaxLength(1000)
    text!: string;
}