import {
  Controller, Get, Post, Patch, Delete, Body,
  Param, Query, ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerSelfUpdateDto } from './dto/player-self-update.dto';
import { RegisterPlayerDto } from './dto/register-player.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import { User } from '../users/entities/user.entity';

@Controller('players')
export class PlayersController {
  constructor(private playersService: PlayersService) {}

  // Public: list approved players with filters
  @Get()
  @Public()
  findAll(
    @Query('tier') tier?: string,
    @Query('position') position?: string,
    @Query('available') available?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('playerType') playerType?: string,
    @Query('district') district?: string,
    @Query('isForeign') isForeign?: string,
    @Query('nationality') nationality?: string,
  ) {
    return this.playersService.findAll({
      tier, position, available, search, sort, playerType,
      district, isForeign, nationality,
    });
  }

  // Public: player self-registration
  @Post('register')
  @Public()
  register(@Body() dto: RegisterPlayerDto) {
    return this.playersService.register(dto);
  }

  // Public: get single player profile (must be approved)
  
@Get(':id')
@Public()
async findOne(
  @Param('id', ParseUUIDPipe) id: string,
  @CurrentUser() user?: User,
) {
  const player = await this.playersService.findOne(id);

  if (!player.isApproved) {
    const isAdmin = user?.role === Role.ADMIN;
    const isOwner = user?.id === player.userId;
    if (!isAdmin && !isOwner) {
      throw new NotFoundException('Player not found');
    }
  }

  return player;
}

  // Player: get own profile
  @Get('me/profile')
  getMyProfile(@CurrentUser() user: User) {
    return this.playersService.findByUserId(user.id);
  }

  // Player: update own allowed fields
  @Patch('me/profile')
  @Roles(Role.PLAYER)
  selfUpdate(@CurrentUser() user: User, @Body() dto: PlayerSelfUpdateDto) {
    return this.playersService.selfUpdate(user.id, dto);
  }

  // Admin: get all players (including unapproved)
  @Get('admin/all')
  @Roles(Role.ADMIN)
  findAllAdmin(
    @Query('playerType') playerType?: string,
    @Query('approved') approved?: string,
    @Query('isForeign') isForeign?: string,
  ) {
    return this.playersService.findAllAdmin({ playerType, approved, isForeign });
  }

  // Admin: get pending registrations
  @Get('admin/pending')
  @Roles(Role.ADMIN)
  findPending() {
    return this.playersService.findPending();
  }

  // Admin: approve registration
  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.playersService.approve(id);
  }

  // Admin: reject registration
  @Delete(':id/reject')
  @Roles(Role.ADMIN)
  reject(@Param('id', ParseUUIDPipe) id: string) {
    return this.playersService.reject(id);
  }

  // Admin: create a player (auto-approved)
  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreatePlayerDto) {
    return this.playersService.create(dto);
  }

  // Admin: full update
  @Patch(':id')
  @Roles(Role.ADMIN)
  adminUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlayerDto,
  ) {
    return this.playersService.adminUpdate(id, dto);
  }

  // Admin: change tier
  @Patch(':id/tier')
  @Roles(Role.ADMIN)
  changeTier(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('tier') tier: string,
  ) {
    return this.playersService.changeTier(id, tier);
  }

  // Admin: toggle availability
  @Patch(':id/toggle-availability')
  @Roles(Role.ADMIN)
  toggleAvailability(@Param('id', ParseUUIDPipe) id: string) {
    return this.playersService.toggleAvailability(id);
  }

  // Admin: delete player
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.playersService.remove(id);
  }
}