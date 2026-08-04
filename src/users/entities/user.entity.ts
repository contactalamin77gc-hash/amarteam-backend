import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, OneToOne, Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role, AuthProvider } from '../../common/enums';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';
import { TeamRequest } from '../../team-requests/entities/team-request.entity';
import { Player } from '../../players/entities/player.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 150 })
  email!: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password!: string;

  @Index()
  @Column({ length: 20, nullable: true })
  phone!: string;

  @Column({ length: 100, nullable: true })
  location!: string;

  @Column({ type: 'enum', enum: Role, default: Role.HIRER })
  role!: Role;

  @Column({ default: true })
  isActive!: boolean;

  // ─── Verification ───
  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ default: false })
  phoneVerified!: boolean;

  // ─── OAuth ───
  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  authProvider!: AuthProvider;

  @Index()
  @Column({ length: 255, nullable: true })
  googleId!: string;

  @Index()
  @Column({ length: 255, nullable: true })
  appleId!: string;

  @Column({ length: 500, nullable: true })
  avatar!: string;

  // ─── Security ───
  @Column({ type: 'int', default: 0 })
  @Exclude({ toPlainOnly: true })
  failedLoginAttempts!: number;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude({ toPlainOnly: true })
  lockedUntil!: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // ─── Relations ───
  @OneToOne(() => Player, (player) => player.user, { nullable: true })
  player!: Player;

  @OneToMany(() => Booking, (booking) => booking.hirer)
  bookings!: Booking[];

  @OneToMany(() => Review, (review) => review.author)
  reviews!: Review[];

  @OneToMany(() => TeamRequest, (tr) => tr.hirer)
  teamRequests!: TeamRequest[];
}