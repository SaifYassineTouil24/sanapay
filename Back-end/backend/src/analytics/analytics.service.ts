import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from '../transactions/transaction.entity';
import { Bill, BillStatus } from '../bills/bill.entity';
import { Ewallet } from '../ewallet/ewallet.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    @InjectRepository(Ewallet)
    private ewalletRepository: Repository<Ewallet>,
  ) {}

  async getSummary(userId: number) {
    // Get user's wallet
    const wallet = await this.ewalletRepository.findOne({ where: { userId } });
    if (!wallet) {
      return this.getEmptySummary();
    }

    // Get transaction stats
    const totalDeposits = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.ewalletId = :walletId', { walletId: wallet.id })
      .andWhere('transaction.type = :type', { type: TransactionType.DEPOSIT })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .getRawOne();

    const totalWithdrawals = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.ewalletId = :walletId', { walletId: wallet.id })
      .andWhere('transaction.type = :type', { type: TransactionType.WITHDRAW })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .getRawOne();

    const transactionCount = await this.transactionRepository.count({
      where: { walletId: wallet.id },
    });

    // Get bill stats
    const pendingBills = await this.billRepository.count({
      where: { userId, status: BillStatus.PENDING },
    });

    const paidBills = await this.billRepository.count({
      where: { userId, status: BillStatus.PAID },
    });

    const overdueBills = await this.billRepository.count({
      where: { userId, status: BillStatus.OVERDUE },
    });

    const totalBillAmount = await this.billRepository
      .createQueryBuilder('bill')
      .select('SUM(bill.amount)', 'total')
      .where('bill.userId = :userId', { userId })
      .andWhere('bill.status = :status', { status: BillStatus.PENDING })
      .getRawOne();

    return {
      balance: parseFloat(wallet.balance.toString()),
      totalDeposits: parseFloat(totalDeposits.total || '0'),
      totalWithdrawals: parseFloat(totalWithdrawals.total || '0'),
      transactionCount,
      bills: {
        pending: pendingBills,
        paid: paidBills,
        overdue: overdueBills,
        totalPendingAmount: parseFloat(totalBillAmount.total || '0'),
      },
    };
  }

  async getMonthlyAnalytics(userId: number) {
    const wallet = await this.ewalletRepository.findOne({ where: { userId } });
    if (!wallet) {
      return { months: [] };
    }

    const months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const deposits = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.ewalletId = :walletId', { walletId: wallet.id })
        .andWhere('transaction.type = :type', { type: TransactionType.DEPOSIT })
        .andWhere('transaction.createdAt >= :start', { start: monthStart })
        .andWhere('transaction.createdAt <= :end', { end: monthEnd })
        .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .getRawOne();

      const withdrawals = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.ewalletId = :walletId', { walletId: wallet.id })
        .andWhere('transaction.type = :type', { type: TransactionType.WITHDRAW })
        .andWhere('transaction.createdAt >= :start', { start: monthStart })
        .andWhere('transaction.createdAt <= :end', { end: monthEnd })
        .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .getRawOne();

      months.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        deposits: parseFloat(deposits.total || '0'),
        withdrawals: parseFloat(withdrawals.total || '0'),
        net: parseFloat(deposits.total || '0') - parseFloat(withdrawals.total || '0'),
      });
    }

    return { months };
  }

  async getYearlyAnalytics(userId: number) {
    const wallet = await this.ewalletRepository.findOne({ where: { userId } });
    if (!wallet) {
      return { years: [] };
    }

    const years = [];
    const currentYear = new Date().getFullYear();

    for (let year = currentYear - 2; year <= currentYear; year++) {
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59);

      const deposits = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.ewalletId = :walletId', { walletId: wallet.id })
        .andWhere('transaction.type = :type', { type: TransactionType.DEPOSIT })
        .andWhere('transaction.createdAt >= :start', { start: yearStart })
        .andWhere('transaction.createdAt <= :end', { end: yearEnd })
        .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .getRawOne();

      const withdrawals = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.ewalletId = :walletId', { walletId: wallet.id })
        .andWhere('transaction.type = :type', { type: TransactionType.WITHDRAW })
        .andWhere('transaction.createdAt >= :start', { start: yearStart })
        .andWhere('transaction.createdAt <= :end', { end: yearEnd })
        .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
        .getRawOne();

      years.push({
        year: year.toString(),
        deposits: parseFloat(deposits.total || '0'),
        withdrawals: parseFloat(withdrawals.total || '0'),
        net: parseFloat(deposits.total || '0') - parseFloat(withdrawals.total || '0'),
      });
    }

    return { years };
  }

  async getCategoryAnalytics(userId: number) {
    const categories = await this.billRepository
      .createQueryBuilder('bill')
      .select('bill.category', 'category')
      .addSelect('COUNT(bill.id)', 'count')
      .addSelect('SUM(bill.amount)', 'total')
      .where('bill.userId = :userId', { userId })
      .groupBy('bill.category')
      .getRawMany();

    const formatted = categories.map((cat) => ({
      category: cat.category,
      count: parseInt(cat.count),
      total: parseFloat(cat.total || '0'),
      average: parseFloat(cat.total || '0') / parseInt(cat.count),
    }));

    // Get top 5 bills
    const topBills = await this.billRepository.find({
      where: { userId },
      order: { amount: 'DESC' },
      take: 5,
    });

    return {
      categories: formatted,
      topBills: topBills.map((bill) => ({
        id: bill.id,
        title: bill.title,
        amount: parseFloat(bill.amount.toString()),
        category: bill.category,
        status: bill.status,
      })),
    };
  }

  private getEmptySummary() {
    return {
      balance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      transactionCount: 0,
      bills: {
        pending: 0,
        paid: 0,
        overdue: 0,
        totalPendingAmount: 0,
      },
    };
  }
}
