import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne,
} from 'typeorm';
import { BookingStatus } from '../../common/enums';
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

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
    status!: BookingStatus;

  @CreateDateColumn()
    createdAt!: Date;

  @UpdateDateColumn()
    updatedAt!: Date;
}