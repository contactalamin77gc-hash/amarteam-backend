import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerRequest } from './player-request.entity';
import { CreatePlayerRequestDto } from './dto/create-player-request.dto';
import { UpdatePlayerRequestDto } from './dto/update-player-request.dto';

@Injectable()
export class PlayerRequestsService {
  constructor(
    @InjectRepository(PlayerRequest)
    private repo: Repository<PlayerRequest>,
  ) {}

  async create(dto: CreatePlayerRequestDto, userId?: string) {
    const req = this.repo.create({ ...dto, userId });
    return this.repo.save(req);
  }

  async findAll() {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async findMy(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const req = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!req) throw new NotFoundException('Request not found');
    return req;
  }

  async update(id: string, dto: UpdatePlayerRequestDto) {
    const req = await this.findOne(id);
    Object.assign(req, dto);
    return this.repo.save(req);
  }

  async remove(id: string) {
    const req = await this.findOne(id);
    return this.repo.remove(req);
  }
}