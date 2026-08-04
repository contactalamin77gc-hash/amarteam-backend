import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '../common/enums';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @Public()
  getAll() {
    return this.settingsService.getAll();
  }

  @Post()
  @Roles(Role.ADMIN)
  set(@Body() body: { key: string; value: string; publicId?: string }) {
    return this.settingsService.set(body.key, body.value, body.publicId);
  }

  @Delete(':key')
  @Roles(Role.ADMIN)
  remove(@Param('key') key: string) {
    return this.settingsService.remove(key);
  }
}