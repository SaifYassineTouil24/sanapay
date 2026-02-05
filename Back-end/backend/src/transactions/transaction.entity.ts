import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  TRANSFER = 'TRANSFER',
}

export enum TransactionStatus {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @Column({ type: 'enum', enum: TransactionStatus })
  status: TransactionStatus;

  @Column({ nullable: true })
  description?: string;

  @Column()
  reference: string;

  @Column()
  walletId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  balanceBefore?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  balanceAfter?: string;

  @CreateDateColumn()
  createdAt: Date;
}
