import {
  Controller, Get, Post, Patch, Delete, Body,
  Param, Query, ParseUUIDPipe,
} from '@nestjs/common';
import { TeamRequestsService } from './team-requests.service';
import { PlayersService } from '../players/players.service';
import { CreateTeamRequestDto } from './dto/create-team-request.dto';
import { UpdateTeamRequestDto } from './dto/update-team-request.dto';
import { SuggestPlayersDto } from './dto/suggest-players.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import { User } from '../users/entities/user.entity';

@Controller('team-requests')
export class TeamRequestsController {
  constructor(
    private trService: TeamRequestsService,
    private playersService: PlayersService,
  ) {}

  @Post()
  @Roles(Role.HIRER)
  create(@CurrentUser() user: User, @Body() dto: CreateTeamRequestDto) {
    return this.trService.create(user.id, dto);
  }

  @Get('my')
  @Roles(Role.HIRER)
  getMyRequests(@CurrentUser() user: User) {
    return this.trService.findByHirer(user.id);
  }

  @Get('player/my')
  @Roles(Role.PLAYER)
  async getPlayerRequests(@CurrentUser() user: User) {
    const player = await this.playersService.findByUserId(user.id);
    return this.trService.findByPlayer(player.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query('status') status?: string) {
    return this.trService.findAll(status);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.trService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTeamRequestDto) {
    return this.trService.update(id, dto);
  }

  @Patch(':id/suggest')
  @Roles(Role.ADMIN)
  suggest(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SuggestPlayersDto) {
    return this.trService.suggestPlayers(id, dto.playerIds);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.trService.remove(id);
  }
}