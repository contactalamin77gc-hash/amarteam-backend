//src/team-requests/entities/team-request.entity.ts

import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne,
} from 'typeorm';
import { TeamRequestStatus, PaymentStatus } from '../../common/enums';import { User } from '../../users/entities/user.entity';

@Entity('team_requests')
export class TeamRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.teamRequests, { eager: true })
  hirer!: User;

  @Column()
  hirerId!: string;

  @Column({ type: 'date', nullable: true })
  matchDate!: string;

  @Column({ length: 150, nullable: true })
  tournament!: string;

  @Column({ length: 150, nullable: true })
  location!: string;

  @Column({ type: 'int', default: 0 })
  budget!: number;

  @Column({ type: 'int', default: 11 })
  playersNeeded!: number;

  @Column({ type: 'text', nullable: true })
  message!: string;

 @Column({ type: 'jsonb', default: [] })
  squad!: {
    positionKey: string;
    playerId: string;
    playerName: string;
    playerPosition: string;
    /** Fee assigned by admin after the confirmation call. */
    amount?: number;
  }[];

  @Column({ type: 'enum', enum: TeamRequestStatus, default: TeamRequestStatus.CALLING_SOON })
  status!: TeamRequestStatus;

  @Column({ nullable: true })
phone!: string;

  @Column({ type: 'text', nullable: true })
  adminNote!: string;

  @Column({ type: 'int', nullable: true })
  finalAmount!: number;

  @Column({ type: 'int', nullable: true })
  advanceAmount!: number;

  @Column({ type: 'jsonb', default: [] })
  suggestedPlayerIds!: string[];


  // ─── Payment ───

  @Column({ type: 'int', nullable: true })
  commissionRate!: number | null;

  @Column({ type: 'int', nullable: true })
  commissionAmount!: number | null;

  @Column({ type: 'int', default: 0 })
  amountPaid!: number;

  @Column({ type: 'int', default: 0 })
  payoutPaid!: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus!: PaymentStatus;

  @CreateDateColumn()
  createdAt!: Date;


  @UpdateDateColumn()
  updatedAt!: Date;
}