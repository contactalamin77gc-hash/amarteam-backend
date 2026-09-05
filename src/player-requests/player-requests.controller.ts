import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseUUIDPipe, Req,
} from '@nestjs/common';
import { PlayerRequestsService } from './player-requests.service';
import { CreatePlayerRequestDto } from './dto/create-player-request.dto';
import { UpdatePlayerRequestDto } from './dto/update-player-request.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import { Public } from '../common/decorators/public.decorator';

@Controller('player-requests')
export class PlayerRequestsController {
  constructor(private svc: PlayerRequestsService) {}

  // Anyone can submit — no login required
  @Post()
  @Public()
  create(@Body() dto: CreatePlayerRequestDto, @Req() req: any) {
    return this.svc.create(dto, req.user?.id);
  }

  // Logged-in user sees their own requests
  @Get('my')
  findMy(@CurrentUser() user: any) {
    return this.svc.findMy(user.id);
  }

  // Admin sees all
  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.svc.findAll();
  }

  // Admin gets one
  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id);
  }

  // Admin updates status
  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePlayerRequestDto) {
    return this.svc.update(id, dto);
  }

  // Admin deletes
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.remove(id);
  }
}