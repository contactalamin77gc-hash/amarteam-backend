import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamRequest } from './entities/team-request.entity';
import { CreateTeamRequestDto } from './dto/create-team-request.dto';
import { UpdateTeamRequestDto } from './dto/update-team-request.dto';
import { TeamRequestStatus } from '../common/enums';

@Injectable()
export class TeamRequestsService {
  constructor(
    @InjectRepository(TeamRequest)
    private trRepo: Repository<TeamRequest>,
  ) {}

  async create(hirerId: string, dto: CreateTeamRequestDto): Promise<TeamRequest> {
    const tr = this.trRepo.create({
      hirerId,
      matchDate: dto.matchDate,
      tournament: dto.tournament,
      location: dto.location,
      budget: dto.budget || 0,
      playersNeeded: dto.playersNeeded,
      message: dto.message,
      squad: (dto.squad as any) || [],
      status: TeamRequestStatus.CALLING_SOON,
    } as any);
    return this.trRepo.save(tr) as any;
  }

  async findAll(status?: string): Promise<TeamRequest[]> {
    const qb = this.trRepo.createQueryBuilder('tr')
      .leftJoinAndSelect('tr.hirer', 'hirer')
      .orderBy('tr.createdAt', 'DESC');

    if (status) qb.andWhere('tr.status = :status', { status });
    return qb.getMany();
  }

  async findOne(id: string): Promise<TeamRequest> {
    const tr = await this.trRepo.findOne({ where: { id }, relations: ['hirer'] });
    if (!tr) throw new NotFoundException('Team request not found');
    return tr;
  }

  async findByHirer(hirerId: string): Promise<TeamRequest[]> {
    return this.trRepo.find({
      where: { hirerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByPlayer(playerId: string): Promise<TeamRequest[]> {
    const all = await this.trRepo.find({
      relations: ['hirer'],
      order: { createdAt: 'DESC' },
    });
    return all.filter(tr =>
      tr.squad?.some(s => s.playerId === playerId) ||
      tr.suggestedPlayerIds?.includes(playerId)
    );
  }

  async update(id: string, dto: UpdateTeamRequestDto): Promise<TeamRequest> {
    const tr = await this.findOne(id);
    if (dto.status !== undefined) tr.status = dto.status;
    if (dto.adminNote !== undefined) tr.adminNote = dto.adminNote;
    if (dto.finalAmount !== undefined) tr.finalAmount = dto.finalAmount;
    if (dto.advanceAmount !== undefined) tr.advanceAmount = dto.advanceAmount;
    return this.trRepo.save(tr);
  }

  async suggestPlayers(id: string, playerIds: string[]): Promise<TeamRequest> {
    const tr = await this.findOne(id);
    tr.suggestedPlayerIds = playerIds;
    return this.trRepo.save(tr);
  }

  async remove(id: string): Promise<void> {
    const tr = await this.findOne(id);
    await this.trRepo.remove(tr);
  }
}