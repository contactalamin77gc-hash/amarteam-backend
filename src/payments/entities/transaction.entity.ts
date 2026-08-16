import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { TxKind, TxRefType, TxMethod, TxStatus } from '../../common/enums';
import { Player } from '../../players/entities/player.entity';
import { User } from '../../users/entities/user.entity';

@Entity('transactions')
@Index(['refType', 'refId'])
@Index('UQ_tx_externalRef_refType', ['externalRef', 'refType'], { unique: true, where: '"externalRef" IS NOT NULL' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ type: 'enum', enum: TxKind })
    kind!: TxKind;

  @Column({ type: 'enum', enum: TxRefType })
    refType!: TxRefType;

  /** Polymorphic — intentionally not a FK, since it points at five different tables */
  @Column({ type: 'uuid' })
    refId!: string;

  @Column({ type: 'uuid', nullable: true })
    playerId!: string | null;

  @ManyToOne(() => Player, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'playerId' })
  player?: Player;

  /** Always positive. Direction is implied by `kind`. */
  @Column({ type: 'numeric', precision: 12, scale: 2 })
    amount!: string;

  @Column({ type: 'enum', enum: TxMethod, default: TxMethod.MANUAL })
    method!: TxMethod;

  /** bKash/Nagad TrxID, or the gateway transaction id */
  @Column({ type: 'varchar', nullable: true })
  externalRef!: string | null;

  @Column({ type: 'enum', enum: TxStatus, default: TxStatus.PENDING })
    status!: TxStatus;

  @Column({ type: 'text', nullable: true })
    note!: string | null;

  /** Admin who verified a manual payment */
  @Column({ type: 'uuid', nullable: true })
    createdById!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdById' })
  createdBy?: User;

  @CreateDateColumn()
    createdAt!: Date;
}