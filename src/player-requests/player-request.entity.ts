import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';


export enum PlayerRequestStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  FOUND = 'found',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

@Entity('player_requests')
export class PlayerRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  requesterName!: string;

  @Column()
  phone!: string;

  @Column()
  playerName!: string;

  @Column({ nullable: true })
  club?: string;

  @Column({ nullable: true })
  tournament?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ default: PlayerRequestStatus.PENDING })
  status!: string;

  @Column({ type: 'text', nullable: true })
  adminNote?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user?: User;

  @Column({ nullable: true })
  userId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}