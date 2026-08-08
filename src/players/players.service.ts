import {
  Injectable, NotFoundException, ConflictException,
  BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Player } from './entities/player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerSelfUpdateDto } from './dto/player-self-update.dto';
import { RegisterPlayerDto } from './dto/register-player.dto';
import { UsersService } from '../users/users.service';
import { UploadService } from '../upload/upload.service';
import { MailService } from '../notifications/mail.service';
import { Role, PlayerType } from '../common/enums';

const MAX_PORTFOLIO_PHOTOS = 30;
const MAX_PORTFOLIO_VIDEOS = 5;
const MAX_VIDEO_SECONDS = 125; // 2 min + 5s grace

@Injectable()
export class PlayersService {
  private readonly logger = new Logger(PlayersService.name);

  constructor(
    @InjectRepository(Player)
    private playersRepo: Repository<Player>,
    private usersService: UsersService,
    private uploadService: UploadService,
    private mailService: MailService,
  ) {}

  // ══════════ CREATE (admin) ══════════

  async create(dto: CreatePlayerDto): Promise<Player> {
    const email = dto.email.toLowerCase().trim();

    if (await this.usersService.findByEmail(email)) {
      throw new ConflictException('This email is already registered');
    }
    if (dto.phone && await this.usersService.findByPhone(dto.phone)) {
      throw new ConflictException('This phone number is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.usersService.create({
      name: dto.name.trim(),
      email,
      password: hashedPassword,
      phone: dto.phone,
      location: dto.location,
      role: Role.PLAYER,
      emailVerified: true,   // admin-created accounts are trusted
      phoneVerified: !!dto.phone,
      isActive: true,
    } as any);

    const player = this.playersRepo.create({
      userId: user.id,
      playerType: dto.playerType || PlayerType.PLAYER,
      isApproved: true,      // admin-created = auto-approved
      photo: dto.photo,
      photoPublicId: (dto as any).photoPublicId,
      position: dto.position || undefined,
      tier: dto.tier,
      clubs: (dto.clubs as any) || [],
      nationalTeams: (dto.nationalTeams as any) || [],
      charges: (dto.charges as any) || {
        friendly: 5000, groupRound: 8000, final: 12000,
        friendlyDiscount: null, groupRoundDiscount: null, finalDiscount: null,
      },
      age: dto.age,
      experience: dto.experience || 1,
      rating: dto.rating || 0,
      location: dto.location,
      district: (dto as any).district,
      upazila: (dto as any).upazila,
      bio: dto.bio,
      stats: dto.stats || {
        goals: 0, assists: 0, matches: 0,
        cleanSheets: 0, yellowCards: 0, redCards: 0,
      },
      // Coach
      coachingLicense: (dto as any).coachingLicense,
      specialization: (dto as any).specialization,
      tacticsStyle: (dto as any).tacticsStyle,
      // Referee
      refereeLicense: (dto as any).refereeLicense,
      fifaBadge: (dto as any).fifaBadge || false,
      matchesOfficiated: (dto as any).matchesOfficiated || 0,
      // Cameraman
      perMatchRate: (dto as any).perMatchRate,
      equipment: (dto as any).equipment,
      hasDrone: (dto as any).hasDrone || false,
      doesEditing: (dto as any).doesEditing || false,
      portfolioPhotos: [],
      portfolioVideos: [],
    } as any);

    const saved = await this.playersRepo.save(player) as any;
    this.logger.log(`Admin created ${dto.playerType || 'player'}: ${user.email}`);
    return saved;
  }

  // ══════════ PUBLIC SELF-REGISTRATION ══════════

  async register(dto: RegisterPlayerDto): Promise<any> {
    const email = dto.email.toLowerCase().trim();

    if (await this.usersService.findByEmail(email)) {
      throw new ConflictException('This email is already registered');
    }
    if (dto.phone && await this.usersService.findByPhone(dto.phone)) {
      throw new ConflictException('This phone number is already registered');
    }

    // Role-specific required fields
    if (dto.playerType === PlayerType.PLAYER && !dto.position) {
      throw new BadRequestException('Position is required for players');
    }
    if (dto.playerType === PlayerType.COACH && !(dto as any).specialization) {
      throw new BadRequestException('Specialization is required for coaches');
    }
    if (dto.playerType === PlayerType.REFEREE && !(dto as any).refereeLicense) {
      throw new BadRequestException('License level is required for referees');
    }
    if (dto.playerType === PlayerType.CAMERAMAN) {
      if (!(dto as any).district) {
        throw new BadRequestException('District is required for cameramen');
      }
      if (!(dto as any).upazila) {
        throw new BadRequestException('Upazila is required for cameramen');
      }
      if (!(dto as any).perMatchRate) {
        throw new BadRequestException('Rate per match is required for cameramen');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.usersService.create({
      name: dto.name.trim(),
      email,
      password: hashedPassword,
      phone: dto.phone,
      location: (dto as any).district || (dto as any).location,
      role: Role.PLAYER,
      emailVerified: false,
      phoneVerified: false,
      isActive: true,
    } as any);

    const player = this.playersRepo.create({
      userId: user.id,
      playerType: dto.playerType,
      isApproved: false,     // must be approved by admin
      photo: (dto as any).photo,
      photoPublicId: (dto as any).photoPublicId,
      position: dto.position || undefined,
      age: (dto as any).age || 18,
      experience: (dto as any).experience || 0,
      district: (dto as any).district,
      upazila: (dto as any).upazila,
      location: (dto as any).location,
      bio: (dto as any).bio,
      clubs: ((dto as any).clubs as any) || [],
      nationalTeams: ((dto as any).nationalTeams as any) || [],
      charges: {
        friendly: 5000, groupRound: 8000, final: 12000,
        friendlyDiscount: null, groupRoundDiscount: null, finalDiscount: null,
      },
      stats: {
        goals: 0, assists: 0, matches: 0,
        cleanSheets: 0, yellowCards: 0, redCards: 0,
      },
      // Coach
      coachingLicense: (dto as any).coachingLicense,
      specialization: (dto as any).specialization,
      tacticsStyle: (dto as any).tacticsStyle,
      // Referee
      refereeLicense: (dto as any).refereeLicense,
      fifaBadge: (dto as any).fifaBadge || false,
      matchesOfficiated: (dto as any).matchesOfficiated || 0,
      // Cameraman
      perMatchRate: (dto as any).perMatchRate,
      equipment: (dto as any).equipment,
      hasDrone: (dto as any).hasDrone || false,
      doesEditing: (dto as any).doesEditing || false,
      // Foreign player
      isForeign: (dto as any).isForeign || false,
      nationality: (dto as any).nationality,
      currentCountry: (dto as any).currentCountry,
      availableFrom: (dto as any).availableFrom || null,
      availableTo: (dto as any).availableTo || null,
      portfolioPhotos: [],
      portfolioVideos: [],
    } as any);

    const saved = await this.playersRepo.save(player) as any;
    this.logger.log(`New ${dto.playerType} registration: ${email}`);

    return {
      id: saved.id,
      playerType: saved.playerType,
      isApproved: false,
      message: 'Registration submitted. Admin will review and approve your profile shortly.',
    };
  }

  // ══════════ READ ══════════

  /** Public listing — approved profiles only */
  async findAll(query?: {
    tier?: string;
    position?: string;
    available?: string;
    search?: string;
    sort?: string;
    playerType?: string;
    district?: string;
    nationality?: string;
    isForeign?: string;
  }): Promise<Player[]> {
    const qb = this.playersRepo.createQueryBuilder('player')
      .leftJoinAndSelect('player.user', 'user')
      .leftJoinAndSelect('player.reviews', 'reviews')
      .andWhere('player.isApproved = true')
      .andWhere('user.isActive = true');

    if (query?.playerType) qb.andWhere('player.playerType = :pt', { pt: query.playerType });
    if (query?.tier) qb.andWhere('player.tier = :tier', { tier: query.tier });
    if (query?.position) qb.andWhere('player.position = :pos', { pos: query.position });
    if (query?.district) qb.andWhere('player.district = :dist', { dist: query.district });
    if (query?.nationality) qb.andWhere('player.nationality = :nat', { nat: query.nationality });
    if (query?.available === 'true') qb.andWhere('player.isAvailable = true');
    if (query?.available === 'false') qb.andWhere('player.isAvailable = false');
    if (query?.isForeign !== undefined) qb.andWhere('player.isForeign = :isForeign', { isForeign: query.isForeign === 'true' });

    if (query?.search) {
      qb.andWhere(
        '(user.name ILIKE :q OR player.location ILIKE :q OR player.district ILIKE :q OR player.upazila ILIKE :q)',
        { q: `%${query.search}%` },
      );
    }

    switch (query?.sort) {
      case 'price-low':
        qb.orderBy("COALESCE((player.charges->>'friendly')::int, player.perMatchRate, 0)", 'ASC');
        break;
      case 'price-high':
        qb.orderBy("COALESCE((player.charges->>'friendly')::int, player.perMatchRate, 0)", 'DESC');
        break;
      case 'experience':
        qb.orderBy('player.experience', 'DESC');
        break;
      case 'newest':
        qb.orderBy('player.createdAt', 'DESC');
        break;
      default:
        qb.orderBy('player.rating', 'DESC').addOrderBy('player.experience', 'DESC');
    }

    return qb.getMany();
  }

  /** Admin listing — includes unapproved */
  async findAllAdmin(query?: {
    playerType?: string;
    approved?: string;
    search?: string;
    nationality?: string;
    isForeign?: string;
  }): Promise<Player[]> {
    const qb = this.playersRepo.createQueryBuilder('player')
      .leftJoinAndSelect('player.user', 'user')
      .leftJoinAndSelect('player.reviews', 'reviews');

    if (query?.playerType) qb.andWhere('player.playerType = :pt', { pt: query.playerType });
    if (query?.approved === 'true') qb.andWhere('player.isApproved = true');
    if (query?.approved === 'false') qb.andWhere('player.isApproved = false');
    if (query?.search) {
      qb.andWhere('(user.name ILIKE :q OR user.email ILIKE :q OR user.phone ILIKE :q)', {
        q: `%${query.search}%`,
      });
    }

    qb.orderBy('player.createdAt', 'DESC');
    return qb.getMany();
  }

  async findPending(): Promise<Player[]> {
    return this.playersRepo.find({
      where: { isApproved: false },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Player> {
    const player = await this.playersRepo.findOne({
      where: { id },
      relations: ['user', 'reviews', 'reviews.author', 'bookings'],
    });
    if (!player) throw new NotFoundException('Profile not found');
    return player;
  }

  async findByUserId(userId: string): Promise<Player> {
    const player = await this.playersRepo.findOne({
      where: { userId },
      relations: ['user', 'reviews', 'bookings'],
    });
    if (!player) throw new NotFoundException('Profile not found');
    return player;
  }

  // ══════════ APPROVAL ══════════

  async approve(id: string): Promise<Player> {
    const player = await this.findOne(id);

    if (player.isApproved) {
      throw new BadRequestException('This profile is already approved');
    }

    player.isApproved = true;
    const saved = await this.playersRepo.save(player);

    // Notify — never let a mail failure break approval
    if (player.user?.email) {
      this.mailService
        .sendApprovalNotice(player.user.email, player.user.name)
        .catch(err => this.logger.warn(`Approval email failed: ${err.message}`));
    }

    this.logger.log(`Approved ${player.playerType}: ${player.user?.email}`);
    return saved;
  }

  async reject(id: string): Promise<void> {
    const player = await this.playersRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!player) throw new NotFoundException('Profile not found');

    if (player.isApproved) {
      throw new BadRequestException('Cannot reject an already-approved profile. Delete it instead.');
    }

    await this.cleanupMedia(player);
    const userId = player.userId;
    await this.playersRepo.remove(player);
    await this.usersService.update(userId, { isActive: false } as any);

    this.logger.log(`Rejected registration: ${player.user?.email}`);
  }

  // ══════════ UPDATE ══════════

  async adminUpdate(id: string, dto: UpdatePlayerDto): Promise<Player> {
    const player = await this.findOne(id);

    // Clean up the old photo if a new one is coming in
    if (dto.photo && dto.photo !== player.photo && player.photoPublicId) {
      await this.uploadService.delete(player.photoPublicId, 'image');
    }

    Object.assign(player, dto);
    return this.playersRepo.save(player);
  }

  async selfUpdate(userId: string, dto: PlayerSelfUpdateDto): Promise<Player> {
    const player = await this.findByUserId(userId);

    // ─── Cloudinary cleanup ───

    if (dto.photo && dto.photoPublicId && player.photoPublicId
        && dto.photoPublicId !== player.photoPublicId) {
      await this.uploadService.delete(player.photoPublicId, 'image');
    }

    if (dto.videos !== undefined && player.videos?.length > 0) {
      const keep = new Set(dto.videos.map(v => v.publicId));
      const removed = player.videos.filter(v => !keep.has(v.publicId));
      await this.uploadService.deleteMany(
        removed.map(v => ({ publicId: v.publicId, type: 'video' as const })),
      );
    }

    if (dto.portfolioPhotos !== undefined && player.portfolioPhotos?.length > 0) {
      const keep = new Set(dto.portfolioPhotos.map(p => p.publicId));
      const removed = player.portfolioPhotos.filter(p => !keep.has(p.publicId));
      await this.uploadService.deleteMany(
        removed.map(p => ({ publicId: p.publicId, type: 'image' as const })),
      );
    }

    if (dto.portfolioVideos !== undefined && player.portfolioVideos?.length > 0) {
      const keep = new Set(dto.portfolioVideos.map(v => v.publicId));
      const removed = player.portfolioVideos.filter(v => !keep.has(v.publicId));
      await this.uploadService.deleteMany(
        removed.map(v => ({ publicId: v.publicId, type: 'video' as const })),
      );
    }

    // ─── Common fields ───
    if (dto.bio !== undefined) player.bio = dto.bio;
    if (dto.photo !== undefined) player.photo = dto.photo;
    if (dto.photoPublicId !== undefined) player.photoPublicId = dto.photoPublicId;
    if (dto.location !== undefined) player.location = dto.location;
    if (dto.experience !== undefined) player.experience = dto.experience;
    if (dto.age !== undefined) player.age = dto.age;

    // ─── Location ───
    if (dto.district !== undefined) player.district = dto.district;
    if (dto.upazila !== undefined) player.upazila = dto.upazila;

    // ─── Player-specific ───
    if (dto.position !== undefined) player.position = dto.position;
    if (dto.charges !== undefined) player.charges = dto.charges as any;

    // ─── Coach-specific ───
    if (dto.coachingLicense !== undefined) player.coachingLicense = dto.coachingLicense;
    if (dto.specialization !== undefined) player.specialization = dto.specialization;
    if (dto.tacticsStyle !== undefined) player.tacticsStyle = dto.tacticsStyle;

    // ─── Referee-specific ───
    if (dto.refereeLicense !== undefined) player.refereeLicense = dto.refereeLicense;
    if (dto.fifaBadge !== undefined) player.fifaBadge = dto.fifaBadge;
    if (dto.matchesOfficiated !== undefined) player.matchesOfficiated = dto.matchesOfficiated;

    // ─── Cameraman-specific ───
    if (dto.perMatchRate !== undefined) player.perMatchRate = dto.perMatchRate;
    if (dto.equipment !== undefined) player.equipment = dto.equipment;
    if (dto.hasDrone !== undefined) player.hasDrone = dto.hasDrone;
    if (dto.doesEditing !== undefined) player.doesEditing = dto.doesEditing;

    // ─── Portfolio limits (server-side enforcement) ───
    if (dto.portfolioPhotos !== undefined) {
      if (dto.portfolioPhotos.length > MAX_PORTFOLIO_PHOTOS) {
        throw new BadRequestException(`Maximum ${MAX_PORTFOLIO_PHOTOS} photos allowed`);
      }
      player.portfolioPhotos = dto.portfolioPhotos as any;
    }

    if (dto.portfolioVideos !== undefined) {
      if (dto.portfolioVideos.length > MAX_PORTFOLIO_VIDEOS) {
        throw new BadRequestException(`Maximum ${MAX_PORTFOLIO_VIDEOS} videos allowed`);
      }
      const tooLong = dto.portfolioVideos.find(
        v => v.duration && v.duration > MAX_VIDEO_SECONDS,
      );
      if (tooLong) {
        throw new BadRequestException('Each video must be 2 minutes or shorter');
      }
      player.portfolioVideos = dto.portfolioVideos as any;
    }

    // ─── Shared arrays ───
    if (dto.clubs !== undefined) player.clubs = dto.clubs as any;
    if (dto.nationalTeams !== undefined) player.nationalTeams = dto.nationalTeams as any;
    if (dto.videos !== undefined) player.videos = dto.videos as any;
    if (dto.availableDates !== undefined) player.availableDates = dto.availableDates;
    if (dto.unavailableDates !== undefined) player.unavailableDates = dto.unavailableDates;
    if (dto.tournaments !== undefined) player.tournaments = dto.tournaments;
    if (dto.matchHistory !== undefined) player.matchHistory = dto.matchHistory as any;

    // Mirror location onto the user record
    if (dto.district !== undefined || dto.location !== undefined) {
      await this.usersService.update(player.userId, {
        location: dto.district || dto.location,
      } as any);
    }

    return this.playersRepo.save(player);
  }

  async changeTier(id: string, tier: string): Promise<Player> {
    if (!['A', 'B', 'C'].includes(tier)) {
      throw new BadRequestException('Tier must be A, B or C');
    }
    const player = await this.findOne(id);
    player.tier = tier as any;
    return this.playersRepo.save(player);
  }

  async toggleAvailability(id: string): Promise<Player> {
    const player = await this.findOne(id);
    player.isAvailable = !player.isAvailable;
    return this.playersRepo.save(player);
  }

  // ══════════ DELETE ══════════

  async remove(id: string): Promise<void> {
    const player = await this.playersRepo.findOne({
      where: { id },
      relations: ['user', 'reviews', 'bookings'],
    });
    if (!player) throw new NotFoundException('Profile not found');

    await this.cleanupMedia(player);

    if (player.reviews?.length > 0) {
      await this.playersRepo.manager.remove(player.reviews);
    }
    if (player.bookings?.length > 0) {
      await this.playersRepo.manager.remove(player.bookings);
    }

    const userId = player.userId;
    const email = player.user?.email;

    await this.playersRepo.remove(player);
    await this.usersService.update(userId, { isActive: false } as any);

    this.logger.log(`Deleted profile: ${email}`);
  }

  // ══════════ RATINGS ══════════

  async recalculateRating(playerId: string): Promise<void> {
    const player = await this.playersRepo.findOne({
      where: { id: playerId },
      relations: ['reviews'],
    });

    if (!player) return;

    if (!player.reviews || player.reviews.length === 0) {
      player.rating = 0;
      await this.playersRepo.save(player);
      return;
    }

    const total = player.reviews.reduce((sum, r) => sum + Number(r.rating), 0);
    const avg = total / player.reviews.length;
    player.rating = Math.round(avg * 10) / 10;

    await this.playersRepo.save(player);
  }

  // ══════════ STATS ══════════

  async getStats() {
    const all = await this.playersRepo.find({ relations: ['user'] });

    return {
      total: all.length,
      players: all.filter(p => p.playerType === PlayerType.PLAYER).length,
      coaches: all.filter(p => p.playerType === PlayerType.COACH).length,
      referees: all.filter(p => p.playerType === PlayerType.REFEREE).length,
      cameramen: all.filter(p => p.playerType === PlayerType.CAMERAMAN).length,
      approved: all.filter(p => p.isApproved).length,
      pending: all.filter(p => !p.isApproved).length,
      available: all.filter(p => p.isApproved && p.isAvailable).length,
      tierA: all.filter(p => p.tier === 'A').length,
      districts: new Set(all.map(p => p.district).filter(Boolean)).size,
    };
  }

  // ══════════ HELPERS ══════════

  /** Remove every Cloudinary asset tied to a profile */
  private async cleanupMedia(player: Player): Promise<void> {
    const items: { publicId: string; type: 'image' | 'video' }[] = [];

    if (player.photoPublicId) {
      items.push({ publicId: player.photoPublicId, type: 'image' });
    }
    (player.videos || []).forEach(v => {
      if (v.publicId) items.push({ publicId: v.publicId, type: 'video' });
    });
    (player.portfolioPhotos || []).forEach(p => {
      if (p.publicId) items.push({ publicId: p.publicId, type: 'image' });
    });
    (player.portfolioVideos || []).forEach(v => {
      if (v.publicId) items.push({ publicId: v.publicId, type: 'video' });
    });

    if (items.length > 0) {
      await this.uploadService.deleteMany(items);
      this.logger.log(`Cleaned up ${items.length} media file(s)`);
    }
  }
}