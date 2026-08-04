import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @Column({ length: 100, unique: true })
    name!: string;

  @Column({ length: 100, nullable: true })
    nameBn!: string;

  @Column({ length: 10, nullable: true })
    icon!: string;

  @Column({ length: 500, nullable: true })
    image!: string;

  @Column({ length: 255, nullable: true })
    imagePublicId!: string;

  @Column({ type: 'text', nullable: true })
    description!: string;

  @Column({ type: 'int', default: 0 })
    sortOrder!: number;

  @Column({ default: true })
    isActive!: boolean;

  @CreateDateColumn()
    createdAt!: Date;

  @UpdateDateColumn()
    updatedAt!: Date;

  @OneToMany(() => Product, (p) => p.category)
    products!: Product[];
}