import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, Index,
} from 'typeorm';
import { OtpPurpose, OtpChannel } from '../../common/enums';

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /** email address or phone number */
  @Index()
    @Column({ length: 150 })
    identifier!: string;

  @Column({ length: 10 })
    code!: string;

  @Column({ type: 'enum', enum: OtpPurpose })
    purpose!: OtpPurpose;

  @Column({ type: 'enum', enum: OtpChannel })
    channel!: OtpChannel;

  @Column({ nullable: true })
    userId!: string;

  @Column({ type: 'timestamp' })
    expiresAt!: Date;

  @Column({ default: false })
    isUsed!: boolean;

  @Column({ type: 'int', default: 0 })
    attempts!: number;

  @CreateDateColumn()
    createdAt!: Date;
}