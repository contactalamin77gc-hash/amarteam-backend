import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../common/enums';

// Fields safe to return publicly — password is never included
const SAFE_FIELDS: (keyof User)[] = [
  'id', 'name', 'email', 'phone', 'location', 'role', 'isActive',
  'emailVerified', 'phoneVerified', 'authProvider', 'avatar',
  'lastLoginAt', 'createdAt', 'updatedAt',
];

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id }, select: SAFE_FIELDS });
  }

  /** Public lookup — never returns password */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { email: email.toLowerCase() },
      select: SAFE_FIELDS,
    });
  }

  /** Auth-only lookup — includes password + lockout fields */
  async findByEmailForAuth(email: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { email: email.toLowerCase() },
      select: [...SAFE_FIELDS, 'password', 'failedLoginAttempts', 'lockedUntil'],
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { phone }, select: SAFE_FIELDS });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { googleId }, select: SAFE_FIELDS });
  }

  async findByAppleId(appleId: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { appleId }, select: SAFE_FIELDS });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find({ select: SAFE_FIELDS, order: { createdAt: 'DESC' } });
  }

  async findHirers(): Promise<User[]> {
    return this.usersRepo.find({
      where: { role: Role.HIRER },
      select: SAFE_FIELDS,
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    let patch = data;
    if (data.phone !== undefined) {
      const existing = await this.usersRepo.findOne({ where: { id }, select: ['id', 'phone'] as (keyof User)[] });
      if (existing && data.phone !== existing.phone) {
        patch = { ...data, phoneVerified: false };
      }
    }
    const result = await this.usersRepo.update(id, patch);
    if (result.affected === 0) throw new NotFoundException('User not found');
    return this.findById(id) as Promise<User>;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.usersRepo.update(id, {
      password: hashedPassword,
      failedLoginAttempts: 0,
      lockedUntil: null,
    } as any);
  }

  async toggleActive(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepo.update(id, { isActive: !user.isActive });
    return this.findById(id) as Promise<User>;
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('User not found');
  }
}