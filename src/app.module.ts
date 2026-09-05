import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

import { CommonModule } from './common/common.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OtpModule } from './otp/otp.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlayersModule } from './players/players.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TeamRequestsModule } from './team-requests/team-requests.module';
import { UploadModule } from './upload/upload.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { ShopModule } from './shop/shop.module';
import { CameramenModule } from './cameramen/cameramen.module';
import { SettingsModule } from './settings/settings.module';
import { PaymentsModule } from './payments/payments.module';
import { PlayerRequestsModule } from './player-requests/player-requests.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';
        return {
          type: 'postgres',
          host: config.get('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: false,                    // OFF in production
          logging: !isProd,
          ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
          migrations: ['dist/migrations/*.js'],
          migrationsRun: isProd,
        };
      },
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([{
        ttl: config.get<number>('THROTTLE_TTL', 60000),
        limit: config.get<number>('THROTTLE_LIMIT', 100),
      }]),
    }),

    CommonModule,
    NotificationsModule,
    OtpModule,
    AuthModule,
    UsersModule,
    PlayersModule,
    BookingsModule,
    ReviewsModule,
    TeamRequestsModule,
    UploadModule,
    VehiclesModule,
    ShopModule,
    CameramenModule,
    SettingsModule,
    PaymentsModule,
    PlayerRequestsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}