import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

@Entity('ewallet')
export class Ewallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  walletNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0' })
  balance: string;

  @Column({ default: 'MAD' })
  currency: string;

  @Column({
    type: 'enum',
    enum: WalletStatus,
    default: WalletStatus.ACTIVE,
  })
  status: WalletStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0' })
  totalDeposited: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0' })
  totalWithdrawn: string;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.ewallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
