import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  // Create admin if not exists
  const existing = await usersService.findByEmail('admin@amarteam.com.bd');
  if (!existing) {
    const hash = await bcrypt.hash('Admin@12345', 12);
    await usersService.create({
      name: 'Super Admin',
      email: 'admin@amarteam.com.bd',
      password: hash,
      role: Role.ADMIN,
      phone: '01995645200',
      location: 'Dhaka',
    });
    console.log('✅ Admin account created: admin@amarteam.com.bd / Admin@12345');
  } else {
    console.log('Admin already exists');
  }

  await app.close();
}

seed();