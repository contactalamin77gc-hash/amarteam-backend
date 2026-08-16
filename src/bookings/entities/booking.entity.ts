//bookings/entities/booking.entity.ts

import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne,
} from 'typeorm';
import { BookingStatus, PaymentStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Player } from '../../players/entities/player.entity';


@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @ManyToOne(() => User, (user) => user.bookings, { eager: true })
    hirer!: User;

  @Column()
    hirerId!: string;

  @ManyToOne(() => Player, (player) => player.bookings, { eager: true })
    player!: Player;

  @Column()
    playerId!: string;

  @Column({ type: 'date' })
    matchDate!: string;

  @Column({ length: 150 })
    tournament!: string;

  @Column({ type: 'text', nullable: true })
    message!: string;

  @Column({ type: 'int' })
    amount!: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.CALLING_SOON })
    status!: BookingStatus;

  @Column({ type: 'text', nullable: true })
    adminNote!: string | null;

  // ─── Payment ───

  @Column({ type: 'int', nullable: true })
    finalAmount!: number | null;

  @Column({ type: 'int', nullable: true })
    advanceAmount!: number | null;

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