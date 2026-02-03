import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from '../transactions/transaction.entity';
import { Bill, BillStatus } from '../bills/bill.entity';
import { Ewallet } from '../ewallet/ewallet.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,

    @InjectRepository(Ewallet)
    private readonly ewalletRepository: Repository<Ewallet>,
  ) {}

  /* =========================
     SUMMARY
  ========================== */
  async getSummary(userId: number) {
    const wallet = await this.ewalletRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      return this.getEmptySummary();
    }

    const totalDeposits = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.ewallet = :walletId', { walletId: wallet.id })
      .andWhere('transaction.type = :type', {
        type: TransactionType.DEPOSIT,
      })
      .andWhere('transaction.status = :status', {
        status: TransactionStatus.COMPLETED,
      })
      .getRawOne();

    const totalWithdrawals = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.ewallet = :walletId', { walletId: wallet.id })
      .andWhere('transaction.type = :type', {
        type: TransactionType.WITHDRAW,
      })
      .andWhere('transaction.status = :status', {
        status: TransactionStatus.COMPLETED,
      })
      .getRawOne();

    const transactionCount = await this.transactionRepository.count({
      where: { ewallet: { id: wallet.id } },
    });

    const pendingBills = await this.billRepository.count({
      where: { user: { id: userId }, status: BillStatus.PENDING },
    });

    const paidBills = await this.billRepository.count({
      where: { user: { id: userId }, status: BillStatus.PAID },
    });

    const overdueBills = await this.billRepository.count({
      where: { user: { id: userId }, status: BillStatus.OVERDUE },
    });

    const totalBillAmount = await this.billRepository
      .createQueryBuilder('bill')
      .select('SUM(bill.amount)', 'total')
      .where('bill.user = :userId', { userId })
      .andWhere('bill.status = :status', { status: BillStatus.PENDING })
      .getRawOne();

    return {
      balance: Number(wallet.balance),
      totalDeposits: Number(totalDeposits?.total || 0),
      totalWithdrawals: Number(totalWithdrawals?.total || 0),
      transactionCount,
      bills: {
        pending: pendingBills,
        paid: paidBills,
        overdue: overdueBills,
        totalPendingAmount: Number(totalBillAmount?.total || 0),
      },
    };
  }

  /* =========================
     MONTHLY ANALYTICS
  ========================== */
  async getMonthlyAnalytics(userId: number) {
    const wallet = await this.ewalletRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      return { months: [] };
    }

    const months: {
      month: string;
      deposits: number;
      withdrawals: number;
      net: number;
    }[] = [];

    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      const deposits = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.ewallet = :walletId', { walletId: wallet.id })
        .andWhere('transaction.type = :type', {
          type: TransactionType.DEPOSIT,
        })
        .andWhere('transaction.createdAt BETWEEN :start AND :end', {
          start: monthStart,
          end: monthEnd,
        })
        .andWhere('transaction.status = :status', {
          status: TransactionStatus.COMPLETED,
        })
        .getRawOne();

      const withdrawals = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.ewallet = :walletId', { walletId: wallet.id })
        .andWhere('transaction.type = :type', {
          type: TransactionType.WITHDRAW,
        })
        .andWhere('transaction.createdAt BETWEEN :start AND :end', {
          start: monthStart,
          end: monthEnd,
        })
        .andWhere('transaction.status = :status', {
          status: TransactionStatus.COMPLETED,
        })
        .getRawOne();

      const depositValue = Number(deposits?.total || 0);
      const withdrawalValue = Number(withdrawals?.total || 0);

      months.push({
        month: date.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        }),
        deposits: depositValue,
        withdrawals: withdrawalValue,
        net: depositValue - withdrawalValue,
      });
    }

    return { months };
  }

  /* =========================
     YEARLY ANALYTICS
  ========================== */
  async getYearlyAnalytics(userId: number) {
    const wallet = await this.ewalletRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      return { years: [] };
    }

    const years: {
      year: string;
      deposits: number;
      withdrawals: number;
      net: number;
    }[] = [];

    const currentYear = new Date().getFullYear();

    for (let year = currentYear - 2; year <= currentYear; year++) {
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59);

      const deposits = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.ewallet = :walletId', { walletId: wallet.id })
        .andWhere('transaction.type = :type', {
          type: TransactionType.DEPOSIT,
        })
        .andWhere('transaction.createdAt BETWEEN :start AND :end', {
          start: yearStart,
          end: yearEnd,
        })
        .andWhere('transaction.status = :status', {
          status: TransactionStatus.COMPLETED,
        })
        .getRawOne();

      const withdrawals = await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'total')
        .where('transaction.ewallet = :walletId', { walletId: wallet.id })
        .andWhere('transaction.type = :type', {
          type: TransactionType.WITHDRAW,
        })
        .andWhere('transaction.createdAt BETWEEN :start AND :end', {
          start: yearStart,
          end: yearEnd,
        })
        .andWhere('transaction.status = :status', {
          status: TransactionStatus.COMPLETED,
        })
        .getRawOne();

      const depositValue = Number(deposits?.total || 0);
      const withdrawalValue = Number(withdrawals?.total || 0);

      years.push({
        year: year.toString(),
        deposits: depositValue,
        withdrawals: withdrawalValue,
        net: depositValue - withdrawalValue,
      });
    }

    return { years };
  }

  /* =========================
     CATEGORY ANALYTICS
  ========================== */
  async getCategoryAnalytics(userId: number) {
    const categories = await this.billRepository
      .createQueryBuilder('bill')
      .select('bill.category', 'category')
      .addSelect('COUNT(bill.id)', 'count')
      .addSelect('SUM(bill.amount)', 'total')
      .where('bill.user = :userId', { userId })
      .groupBy('bill.category')
      .getRawMany();

    const formatted = categories.map((cat) => {
      const count = Number(cat.count);
      const total = Number(cat.total || 0);

      return {
        category: cat.category,
        count,
        total,
        average: count ? total / count : 0,
      };
    });

    const topBills = await this.billRepository.find({
      where: { user: { id: userId } },
      order: { amount: 'DESC' },
      take: 5,
    });

    return {
      categories: formatted,
      topBills: topBills.map((bill) => ({
        id: bill.id,
        title: bill.title,
        amount: Number(bill.amount),
        category: bill.category,
        status: bill.status,
      })),
    };
  }

  /* =========================
     EMPTY SUMMARY
  ========================== */
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

