import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { BD_DISTRICTS, BD_DIVISIONS, getUpazilas } from './bd-locations';

@Controller('locations')
export class LocationsController {
  @Get('divisions')
  @Public()
  getDivisions() {
    return BD_DIVISIONS;
  }

  @Get('districts')
  @Public()
  getDistricts(@Query('division') division?: string) {
    if (division) return BD_DISTRICTS.filter(d => d.division === division);
    return BD_DISTRICTS;
  }

  @Get('districts/:name/upazilas')
  @Public()
  getUpazilasFor(@Param('name') name: string) {
    return getUpazilas(name);
  }

  @Get('all')
  @Public()
  getAll() {
    return { divisions: BD_DIVISIONS, districts: BD_DISTRICTS };
  }
}