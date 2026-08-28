import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { ClaimStatus, TxMethod, TxRefType } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('payment_claims')
@Index(['status'])
@Index(['userId'])
export class PaymentClaim {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
    userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  /** Which bookings this payment covers, and how much against each. */
  @Column({ type: 'jsonb', default: [] })
    refs!: { refType: TxRefType; refId: string; amount: number; label?: string; }[];

  @Column({ type: 'int' })
    totalAmount!: number;

  @Column({ type: 'enum', enum: TxMethod })
    method!: TxMethod;

  /** The bKash/Nagad TrxID exactly as the hirer typed it. */
  @Column({ type: 'varchar', length: 120 })
    externalRef!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
    senderNumber!: string | null;

  @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.PENDING })
    status!: ClaimStatus;

  @Column({ type: 'text', nullable: true })
    note!: string | null;

  /** Why admin rejected it — shown back to the hirer. */
  @Column({ type: 'text', nullable: true })
    adminNote!: string | null;

  @Column({ type: 'uuid', nullable: true })
    reviewedById!: string | null;

  @Column({ type: 'timestamp', nullable: true })
    reviewedAt!: Date | null;

  @CreateDateColumn()
    createdAt!: Date;
}