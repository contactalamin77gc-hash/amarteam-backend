import { IsArray, IsUUID } from 'class-validator';

export class SuggestPlayersDto {
  @IsArray()
  @IsUUID('4', { each: true })
  playerIds!: string[];
}