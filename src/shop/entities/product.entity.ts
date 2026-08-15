//product.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ length: 200 })
    name!: string;

  @Column({ length: 200, nullable: true })
    nameBn!: string;

  @Column({ type: 'text', nullable: true })
    description!: string;

  @ManyToOne(() => Category, (c) => c.products, { eager: true, nullable: true })
    category!: Category;

  @Column({ nullable: true })
    categoryId!: string;

  @Column({ type: 'jsonb', default: [] })
    photos!: { url: string; publicId: string; }[];

  @Column({ type: 'int' })
    price!: number;

  // Optional strike-through original price
  @Column({ type: 'int', nullable: true })
    oldPrice!: number;

  @Column({ type: 'int', default: 0 })
    stock!: number;

  @Column({ length: 100, nullable: true })
    brand!: string;

  // Size / color variants
  @Column({ type: 'jsonb', default: [] })
    variants!: { name: string; options: string[]; }[];

  // Delivery
  @Column({ type: 'int', default: 60 })
    dhakaDeliveryCharge!: number;

  @Column({ type: 'int', default: 120 })
    outsideDeliveryCharge!: number;

  @Column({ default: false })
    isFeatured!: boolean;

  @Column({ default: true })
    isActive!: boolean;

  @Column({ type: 'int', default: 0 })
    soldCount!: number;

  @CreateDateColumn()
    createdAt!: Date;

  @UpdateDateColumn()
    updatedAt!: Date;
}