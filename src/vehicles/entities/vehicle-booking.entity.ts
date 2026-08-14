//src/vehicles/entities/vehicle-booking.entity.ts

import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne,
} from 'typeorm';
import { ServiceBookingStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from './vehicle.entity';

@Entity('vehicle_bookings')
export class VehicleBooking {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @ManyToOne(() => User, { eager: true })
    customer!: User;

  @Column()
    customerId!: string;

  @ManyToOne(() => Vehicle, (v) => v.bookings, { eager: true })
    vehicle!: Vehicle;

  @Column()
    vehicleId!: string;

  @Column({ type: 'date' })
    startDate!: string;

  @Column({ type: 'int' })
    days!: number;

  @Column({ length: 100 })
    district!: string;

  @Column({ length: 100, nullable: true })
    upazila!: string;

  @Column({ length: 250, nullable: true })
    pickupAddress!: string;

  @Column({ type: 'text', nullable: true })
    message!: string;

  // Calculated: (basePerDay * days) + districtSurcharge
  @Column({ type: 'int' })
    estimatedAmount!: number;

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