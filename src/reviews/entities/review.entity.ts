import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Player } from '../../players/entities/player.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  @ManyToOne(() => User, (user) => user.reviews, { eager: true })
    author!: User;

  @Column()
    authorId!: string;

  @ManyToOne(() => Player, (player) => player.reviews)
    player!: Player;

  @Column()
    playerId!: string;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
    rating!: number;

  @Column({ type: 'text' })
    text!: string;

  @CreateDateColumn()
    createdAt!: Date;
}