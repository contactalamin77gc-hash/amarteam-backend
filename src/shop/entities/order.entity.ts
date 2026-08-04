import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne,
} from 'typeorm';
import { OrderStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ length: 20, unique: true })
    orderNo!: string;

  @ManyToOne(() => User, { eager: true })
    customer!: User;

  @Column()
    customerId!: string;

  // Line items snapshot
  @Column({ type: 'jsonb', default: [] })
    items!: {
        productId: string;
        productName: string;
        photo: string;
        price: number;
        quantity: number;
        variant?: string;
        subtotal: number;
    }[];

  @Column({ type: 'int' })
    subtotal!: number;

  @Column({ type: 'int' })
    deliveryCharge!: number;

  @Column({ type: 'int' })
    total!: number;

  // Shipping
  @Column({ length: 100 })
    recipientName!: string;

  @Column({ length: 20 })
    phone!: string;

  @Column({ length: 100 })
    district!: string;

  @Column({ length: 100, nullable: true })
    upazila!: string;

  @Column({ type: 'text' })
    address!: string;

  @Column({ type: 'text', nullable: true })
    note!: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status!: OrderStatus;

  @Column({ length: 50, default: 'cashOnDelivery' })
    paymentMethod!: string;

  @Column({ default: false })
    isPaid!: boolean;

  @Column({ length: 100, nullable: true })
    transactionId!: string;

  @Column({ type: 'text', nullable: true })
    adminNote!: string;

  @CreateDateColumn()
    createdAt!: Date;

  @UpdateDateColumn()
    updatedAt!: Date;
}