import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('ewallet')
export class Ewallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  walletNumber: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column({ default: 'MAD' })
  currency: string;

  @Column({ default: 'ACTIVE' })
  status: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
