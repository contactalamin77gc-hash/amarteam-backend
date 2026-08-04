import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { VehicleType } from '../../common/enums';
import { VehicleBooking } from './vehicle-booking.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ length: 150 })
    model!: string;

  @Column({ type: 'enum', enum: VehicleType, default: VehicleType.CAR })
    vehicleType!: VehicleType;

  @Column({ type: 'int' })
    seats!: number;

  @Column({ default: false })
    hasAc!: boolean;

  @Column({ type: 'text', nullable: true })
    description!: string;

  // Photos — Cloudinary
  @Column({ type: 'jsonb', default: [] })
    photos!: { url: string; publicId: string; }[];

  // Base rate per day (Dhaka)
  @Column({ type: 'int' })
    basePerDay!: number;

  // District surcharges — [{ district: 'Sylhet', extraCharge: 3000 }]
  @Column({ type: 'jsonb', default: [] })
    districtCharges!: { district: string; extraCharge: number; }[];

  @Column({ type: 'int', default: 1 })
    minDays!: number;

  @Column({ type: 'int', nullable: true })
    maxDays!: number;

  @Column({ default: true })
    isAvailable!: boolean;

  // Dates blocked by admin or existing bookings
  @Column({ type: 'jsonb', default: [] })
    unavailableDates!: string[];

  @Column({ length: 100, nullable: true })
    baseDistrict!: string;

  @Column({ length: 20, nullable: true })
    registrationNo!: string;

  @CreateDateColumn()
    createdAt!: Date;

  @UpdateDateColumn()
    updatedAt!: Date;

  @OneToMany(() => VehicleBooking, (b) => b.vehicle)
    bookings!: VehicleBooking[];
}