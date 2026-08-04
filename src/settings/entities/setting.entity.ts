import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('site_settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100, unique: true })
  key!: string;

  @Column({ type: 'text', nullable: true })
  value!: string;

  @Column({ length: 255, nullable: true })
  publicId!: string;

  @UpdateDateColumn()
  updatedAt!: Date;
}