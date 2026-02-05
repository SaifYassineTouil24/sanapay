import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

export enum BillCategory {
  ELECTRICITY = 'ELECTRICITY',
  WATER = 'WATER',
  INTERNET = 'INTERNET',
  PHONE = 'PHONE',
  GAS = 'GAS',
  INSURANCE = 'INSURANCE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  RENT = 'RENT',
  OTHER = 'OTHER',
}

export enum BillStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: BillStatus, default: BillStatus.PENDING })
  status: BillStatus;

  @Column({ type: 'enum', enum: BillCategory })
  category: BillCategory;

  @Column({ type: 'date', nullable: true, name: 'dueDate' })
  dueDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 100, nullable: true, name: 'accountNumber' })
  accountNumber: string;

  @Column({ type: 'timestamp', nullable: true, name: 'paidAt' })
  paidAt: Date;

  @Column({ length: 100, nullable: true, name: 'transactionId' })
  transactionId: string;

  @Column({ name: 'userId' })
  userId: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
