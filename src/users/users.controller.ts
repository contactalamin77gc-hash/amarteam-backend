import {
  Controller, Get, Patch, Delete, Param,
  Body, ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Current user profile
  @Get('me')
  getMe(@CurrentUser() user: User) {
    const { password, ...rest } = user as any;
    return rest;
  }

  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  // Admin: list all hirers
  @Get('hirers')
  @Roles(Role.ADMIN)
  getHirers() {
    return this.usersService.findHirers();
  }

  // Admin: list all users
  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  // Admin: toggle hirer active status
  @Patch(':id/toggle-active')
  @Roles(Role.ADMIN)
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.toggleActive(id);
  }

  // Admin: delete user
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}