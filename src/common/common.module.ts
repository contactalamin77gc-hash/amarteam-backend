import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { HealthController } from './health.controller';

@Module({
  controllers: [LocationsController, HealthController],
})
export class CommonModule {}