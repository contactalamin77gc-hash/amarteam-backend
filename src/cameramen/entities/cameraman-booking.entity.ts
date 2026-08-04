import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne,
} from 'typeorm';
import { ServiceBookingStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Player } from '../../players/entities/player.entity';

@Entity('cameraman_bookings')
export class CameramanBooking {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @ManyToOne(() => User, { eager: true })
    customer!: User;

  @Column()
    customerId!: string;

  @ManyToOne(() => Player, { eager: true })
    cameraman!: Player;

  @Column()
    cameramanId!: string;

  @Column({ type: 'date' })
    matchDate!: string;

  @Column({ length: 150, nullable: true })
    tournament!: string;

  @Column({ length: 100 })
    district!: string;

  @Column({ length: 100, nullable: true })
    upazila!: string;

  @Column({ length: 250, nullable: true })
    venue!: string;

  @Column({ length: 20, nullable: true })
    startTime!: string;

  @Column({ type: 'int', default: 2 })
    durationHours!: number;

  @Column({ type: 'text', nullable: true })
    message!: string;

  @Column({ type: 'int' })
    quotedRate!: number;

  @Column({ type: 'int', nullable: true })
    finalAmount!: number;

  @Column({ type: 'int', nullable: true })
    advanceAmount!: number;

  @Column({ type: 'enum', enum: ServiceBookingStatus, default: ServiceBookingStatus.ADVANCE_PENDING })
    status!: ServiceBookingStatus;

  @Column({ type: 'text', nullable: true })
    adminNote!: string;

  @CreateDateColumn()
    createdAt!: Date;

  @UpdateDateColumn()
    updatedAt!: Date;
}