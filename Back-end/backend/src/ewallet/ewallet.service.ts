import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ewallet, WalletStatus } from './ewallet.entity';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from '../transactions/transaction.entity';

@Injectable()
export class EwalletService {
  constructor(
    @InjectRepository(Ewallet)
    private readonly ewalletRepo: Repository<Ewallet>,

    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {}

  async createWallet(userId: number): Promise<Ewallet> {
    const wallet = this.ewalletRepo.create({
      userId,
      walletNumber: `WALLET-${Date.now()}`,
      balance: '0',
      totalDeposited: '0',
      totalWithdrawn: '0',
      currency: 'MAD',
      status: WalletStatus.ACTIVE,
    });

    return this.ewalletRepo.save(wallet);
  }

  async getWalletByUserId(userId: number): Promise<Ewallet> {
    let wallet = await this.ewalletRepo.findOne({ where: { userId } });
    if (!wallet) {
      wallet = await this.createWallet(userId);
    }
    return wallet;
  }

  async deposit(userId: number, amount: number): Promise<Ewallet> {
    const wallet = await this.getWalletByUserId(userId);

    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('Wallet not active');
    }

    const balanceBefore = parseFloat(wallet.balance);
    const balanceAfter = balanceBefore + amount;

    wallet.balance = balanceAfter.toFixed(2);
    wallet.totalDeposited = (
      parseFloat(wallet.totalDeposited) + amount
    ).toFixed(2);

    await this.ewalletRepo.save(wallet);

    const tx = this.txRepo.create({
      type: TransactionType.DEPOSIT,
      amount: amount.toFixed(2),
      status: TransactionStatus.COMPLETED,
      description: 'Deposit',
      reference: `DEP-${Date.now()}`,
      balanceBefore: balanceBefore.toFixed(2),
      balanceAfter: balanceAfter.toFixed(2),
      walletId: wallet.id,
      
    });

    await this.txRepo.save(tx);

    return wallet;
  }

  async withdraw(userId: number, amount: number): Promise<Ewallet> {
    const wallet = await this.getWalletByUserId(userId);
    const balanceBefore = parseFloat(wallet.balance);

    if (balanceBefore < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const balanceAfter = balanceBefore - amount;

    wallet.balance = balanceAfter.toFixed(2);
    wallet.totalWithdrawn = (
      parseFloat(wallet.totalWithdrawn) + amount
    ).toFixed(2);

    await this.ewalletRepo.save(wallet);

    const tx = this.txRepo.create({
      type: TransactionType.WITHDRAW,
      amount: amount.toFixed(2),
      status: TransactionStatus.COMPLETED,
      description: 'Withdraw',
      reference: `WTH-${Date.now()}`,
      balanceBefore: balanceBefore.toFixed(2),
      balanceAfter: balanceAfter.toFixed(2),
      walletId: wallet.id,
   
    });

    await this.txRepo.save(tx);

    return wallet;
  }
  async getWalletByNumber(walletNumber: string) {
  const wallet = await this.ewalletRepo.findOne({
    where: { walletNumber },
  });

  if (!wallet) {
    throw new BadRequestException('Portefeuille introuvable');
  }

  return wallet;
}
async saveWallet(wallet: Ewallet) {
  return this.ewalletRepo.save(wallet);
}

}
