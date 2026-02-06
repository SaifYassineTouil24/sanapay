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

  @Column({ type: 'simple-enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'real' })
  amount: number;

  @Column({ type: 'simple-enum', enum: TransactionStatus })
  status: TransactionStatus;

  @Column({ nullable: true })
  description?: string;

  @Column()
  reference: string;

  @Column()
  walletId: string;

  @Column({ type: 'real', nullable: true })
  balanceBefore?: number;

  @Column({ type: 'real', nullable: true })
  balanceAfter?: number;

  @CreateDateColumn()
  createdAt: Date;
}
