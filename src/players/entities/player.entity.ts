import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Tier, Position, PlayerType } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (user) => user.player, { eager: true })
  @JoinColumn()
  user!: User;

  @Column()
  userId!: string;

  // Type: player, coach, or referee
  @Column({ type: 'enum', enum: PlayerType, default: PlayerType.PLAYER })
  playerType!: PlayerType;

  // Admin approval — only approved profiles show publicly
  @Column({ default: false })
  isApproved!: boolean;

  @Column({ length: 500, nullable: true })
  photo!: string;

  @Column({ length: 255, nullable: true })
  photoPublicId!: string;

  @Column({ type: 'enum', enum: Position, nullable: true })
  position!: Position;

  @Column({ type: 'enum', enum: Tier, default: Tier.A })
  tier!: Tier;

  @Column({ type: 'jsonb', default: [] })
  clubs!: {
    name: string;
    joinYear: number;
    leftYear: number | null;
    isCurrent: boolean;
  }[];

  @Column({ type: 'jsonb', default: [] })
  nationalTeams!: {
    level: string;
    year: number;
    isCurrent: boolean;
  }[];

  @Column()
  age!: number;

  @Column({ default: 1 })
  experience!: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating!: number;

  @Column({ type: 'jsonb', default: { friendly: 5000, groupRound: 8000, final: 12000, friendlyDiscount: null, groupRoundDiscount: null, finalDiscount: null } })
  charges!: {
    friendly: number;
    groupRound: number;
    final: number;
    friendlyDiscount: number | null;
    groupRoundDiscount: number | null;
    finalDiscount: number | null;
  };

  @Column({ default: true })
  isAvailable!: boolean;

  @Column({ length: 100, nullable: true })
  location!: string;

  @Column({ type: 'text', nullable: true })
  bio!: string;

  @Column({
    type: 'jsonb',
    default: { goals: 0, assists: 0, matches: 0, cleanSheets: 0, yellowCards: 0, redCards: 0 },
  })
  stats!: {
    goals: number;
    assists: number;
    matches: number;
    cleanSheets: number;
    yellowCards: number;
    redCards: number;
  };

  @Column({ type: 'jsonb', default: [] })
  availableDates!: string[];

  @Column({ type: 'jsonb', default: [] })
  unavailableDates!: string[];

  @Column({ type: 'jsonb', default: [] })
  videos!: {
    url: string;
    publicId: string;
    thumbnailUrl?: string;
    title?: string;
    duration?: number;
  }[];

  @Column({ type: 'jsonb', default: [] })
  tournaments!: string[];

  @Column({ type: 'jsonb', default: [] })
  matchHistory!: {
    date: string;
    tournament: string;
    opponent: string;
    result: string;
    performance: string;
  }[];

  // Coach-specific fields
  @Column({ length: 100, nullable: true })
  coachingLicense!: string;

  @Column({ length: 100, nullable: true })
  specialization!: string; // youth, senior, goalkeeping, fitness, tactical

  @Column({ length: 200, nullable: true })
  tacticsStyle!: string;

  // Referee-specific fields
  @Column({ length: 100, nullable: true })
  refereeLicense!: string;

  @Column({ default: false })
  fifaBadge!: boolean;

  @Column({ type: 'int', default: 0 })
  matchesOfficiated!: number;

  // ─── Location (required for cameramen) ───
  @Column({ length: 100, nullable: true })
  district!: string;

  @Column({ length: 100, nullable: true })
  upazila!: string;

  // ─── Cameraman-specific ───
  @Column({ type: 'int', nullable: true })
  perMatchRate!: number;

  @Column({ length: 200, nullable: true })
  equipment!: string;

  @Column({ type: 'jsonb', default: [] })
  portfolioPhotos!: { url: string; publicId: string; }[];

  @Column({ type: 'jsonb', default: [] })
  portfolioVideos!: { url: string; publicId: string; thumbnailUrl?: string; title?: string; duration?: number; }[];

  @Column({ default: false })
  hasDrone!: boolean;

  @Column({ default: false })
  doesEditing!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Booking, (booking) => booking.player)
  bookings!: Booking[];

  @OneToMany(() => Review, (review) => review.player)
  reviews!: Review[];

  // Foreign player :
  @Column({ default: false })
  isForeign!: boolean;

  @Column({ nullable: true })
  nationality!: string;

  @Column({ nullable: true })
  currentCountry!: string;

  @Column({ type: 'date', nullable: true })
  availableFrom!: string | null;

  @Column({ type: 'date', nullable: true })
  availableTo!: string | null;
}