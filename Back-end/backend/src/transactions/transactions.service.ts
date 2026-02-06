import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from './transaction.entity';
import { EwalletService } from '../ewallet/ewallet.service';
import { DepositDto, WithdrawDto } from './dto/transaction.dto';
import { v4 as uuidv4 } from 'uuid';
import { TransferDto } from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly ewalletService: EwalletService,
  ) { }

  async deposit(userId: number, depositDto: DepositDto) {
    const { amount, description } = depositDto;

    const wallet = await this.ewalletService.deposit(userId, amount);

    return {
      message: 'Deposit successful',
      balance: wallet.balance,
    };
  }

  async withdraw(userId: number, withdrawDto: WithdrawDto) {
    const { amount } = withdrawDto;

    const wallet = await this.ewalletService.withdraw(userId, amount);

    return {
      message: 'Withdrawal successful',
      balance: wallet.balance,
    };
  }

  async getHistory(userId: number, limit = 50) {
    const wallet = await this.ewalletService.getWalletByUserId(userId);

    const transactions = await this.transactionRepository.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return {
      total: transactions.length,
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        description: t.description,
        reference: t.reference,
        balanceBefore: t.balanceBefore,
        balanceAfter: t.balanceAfter,
        createdAt: t.createdAt,
      })),
    };
  }

  async getStats(userId: number) {
    const wallet = await this.ewalletService.getWalletByUserId(userId);

    const totalTransactions = await this.transactionRepository.count({
      where: { walletId: wallet.id },
    });

    return {
      currentBalance: wallet.balance,
      totalDeposited: wallet.totalDeposited,
      totalWithdrawn: wallet.totalWithdrawn,
      totalTransactions,
    };
  }



  async transfer(userId: number, dto: TransferDto) {
    const { walletNumber, amount, description } = dto;

    // Wallet source
    const senderWallet = await this.ewalletService.getWalletByUserId(userId);
    const senderBalance = senderWallet.balance;

    if (senderBalance < amount) {
      throw new BadRequestException('Solde insuffisant');
    }

    // Wallet destinataire
    const receiverWallet =
      await this.ewalletService.getWalletByNumber(walletNumber);

    // Mise à jour soldes
    senderWallet.balance = senderBalance - amount;
    receiverWallet.balance = receiverWallet.balance + amount;

    // ✅ sauvegarde via EwalletService
    await this.ewalletService.saveWallet(senderWallet);
    await this.ewalletService.saveWallet(receiverWallet);

    // Transaction
    const tx = this.transactionRepository.create({
      type: TransactionType.TRANSFER,
      amount: amount,
      status: TransactionStatus.COMPLETED,
      description: description || 'Transfer',
      reference: `TRF-${Date.now()}`,
      walletId: senderWallet.id,
      balanceBefore: senderBalance,
      balanceAfter: senderBalance - amount,
    });

    await this.transactionRepository.save(tx);

    return {
      message: 'Transfer effectué avec succès',
      balanceAfter: senderWallet.balance,
    };
  }


}
