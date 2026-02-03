import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from './transaction.entity';
import { Ewallet } from '../ewallet/ewallet.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Ewallet)
    private readonly walletRepo: Repository<Ewallet>,

    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {}

  // ➕ DÉPÔT
  async deposit(userId: number, amount: number) {
    amount = Number(amount);

    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Montant invalide');
    }

    let wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!wallet) {
      wallet = this.walletRepo.create({
        user: { id: userId },
        walletNumber: 'WALLET-' + Date.now(),
        balance: 0,
        currency: 'MAD',
        status: 'ACTIVE',
      });

      await this.walletRepo.save(wallet);
    }

    const currentBalance = Number(wallet.balance);
    const newBalance = Number((currentBalance + amount).toFixed(2));

    wallet.balance = newBalance;
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      type: TransactionType.DEPOSIT,
      amount,
      status: TransactionStatus.COMPLETED,
      ewallet: wallet,
    });

    await this.txRepo.save(tx);

    return {
      success: true,
      message: 'Dépôt effectué',
      balance: newBalance,
    };
  }

  // ➖ RETRAIT
  async withdraw(userId: number, amount: number) {
    amount = Number(amount);

    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Montant invalide');
    }

    const wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!wallet) {
      throw new BadRequestException('Ewallet introuvable');
    }

    const currentBalance = Number(wallet.balance);

    if (currentBalance < amount) {
      throw new BadRequestException('Solde insuffisant');
    }

    const newBalance = Number((currentBalance - amount).toFixed(2));

    wallet.balance = newBalance;
    await this.walletRepo.save(wallet);

    const tx = this.txRepo.create({
      type: TransactionType.WITHDRAW,
      amount,
      status: TransactionStatus.COMPLETED,
      ewallet: wallet,
    });

    await this.txRepo.save(tx);

    return {
      success: true,
      message: 'Retrait effectué',
      balance: newBalance,
    };
  }

  // 📜 HISTORIQUE
  async getHistory(userId: number) {
    const transactions = await this.txRepo.find({
      where: {
        ewallet: {
          user: { id: userId },
        },
      },
      relations: ['ewallet'],
      order: { createdAt: 'DESC' },
    });

    return transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: Number(tx.amount),
      status: tx.status,
      createdAt: tx.createdAt,
    }));
  }

  // 📊 STATS DASHBOARD
  async getStats(userId: number) {
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!wallet) {
      return {
        balance: 0,
        totalDeposits: 0,
        totalWithdraws: 0,
        transactionsCount: 0,
      };
    }

    const transactions = await this.txRepo.find({
      where: {
        ewallet: {
          user: { id: userId },
        },
      },
      relations: ['ewallet'],
    });

    let totalDeposits = 0;
    let totalWithdraws = 0;

    for (const tx of transactions) {
      const amount = Number(tx.amount);

      if (tx.type === TransactionType.DEPOSIT) {
        totalDeposits += amount;
      }

      if (tx.type === TransactionType.WITHDRAW) {
        totalWithdraws += amount;
      }
    }

    return {
      balance: Number(wallet.balance),
      totalDeposits: Number(totalDeposits.toFixed(2)),
      totalWithdraws: Number(totalWithdraws.toFixed(2)),
      transactionsCount: transactions.length,
    };
  }
}
    