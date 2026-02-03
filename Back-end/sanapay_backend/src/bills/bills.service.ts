import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill, BillStatus } from './bill.entity';
import { CreateBillDto, UpdateBillDto } from './dto/bill.dto';
import { EwalletService } from '../ewallet/ewallet.service';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    private readonly ewalletService: EwalletService,
  ) {}

  async create(userId: number, createBillDto: CreateBillDto) {
    const bill = this.billRepository.create({
      ...createBillDto,
      user: { id: userId } as any,
      status: BillStatus.PENDING,
    });

    const savedBill = await this.billRepository.save(bill);

    return {
      message: 'Bill created successfully',
      bill: this.formatBill(savedBill),
    };
  }

  async findAll(userId: number, status?: BillStatus, category?: string) {
    const where: any = {
      user: { id: userId },
    };

    if (status) where.status = status;
    if (category) where.category = category;

    const bills = await this.billRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    const now = new Date();
    for (const bill of bills) {
      if (
        bill.status === BillStatus.PENDING &&
        bill.dueDate &&
        new Date(bill.dueDate) < now
      ) {
        bill.status = BillStatus.OVERDUE;
        await this.billRepository.save(bill);
      }
    }

    return {
      bills: bills.map((bill) => this.formatBill(bill)),
      total: bills.length,
    };
  }

  async findOne(userId: number, billId: string) {
    const bill = await this.billRepository.findOne({
      where: { id: billId, user: { id: userId } },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    return this.formatBill(bill);
  }

  async update(userId: number, billId: string, updateBillDto: UpdateBillDto) {
    const bill = await this.billRepository.findOne({
      where: { id: billId, user: { id: userId } },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    if (bill.status === BillStatus.PAID) {
      throw new BadRequestException('Cannot update a paid bill');
    }

    Object.assign(bill, updateBillDto);
    const updatedBill = await this.billRepository.save(bill);

    return {
      message: 'Bill updated successfully',
      bill: this.formatBill(updatedBill),
    };
  }

  async remove(userId: number, billId: string) {
    const bill = await this.billRepository.findOne({
      where: { id: billId, user: { id: userId } },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    if (bill.status === BillStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid bill');
    }

    await this.billRepository.remove(bill);

    return {
      message: 'Bill deleted successfully',
    };
  }

  async pay(userId: number, billId: string) {
    const bill = await this.billRepository.findOne({
      where: { id: billId, user: { id: userId } },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    if (bill.status === BillStatus.PAID) {
      throw new BadRequestException('Bill is already paid');
    }

    if (bill.status === BillStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay a cancelled bill');
    }

    const wallet = await this.ewalletService.getWalletByUserId(userId);
    const balance = Number(wallet.balance);
    const amount = Number(bill.amount);

    if (balance < amount) {
      throw new BadRequestException('Insufficient balance to pay this bill');
    }

    await this.ewalletService.updateBalance(wallet.id, amount, 'WITHDRAW');

    bill.status = BillStatus.PAID;
    bill.paidAt = new Date();
    bill.transactionId = `BILL-${Date.now()}`;

    await this.billRepository.save(bill);

    return {
      message: 'Bill paid successfully',
      bill: this.formatBill(bill),
      remainingBalance: balance - amount,
    };
  }

  private formatBill(bill: Bill) {
    return {
      id: bill.id,
      title: bill.title,
      amount: Number(bill.amount),
      status: bill.status,
      category: bill.category,
      dueDate: bill.dueDate,
      notes: bill.notes,
      accountNumber: bill.accountNumber,
      paidAt: bill.paidAt,
      transactionId: bill.transactionId,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
    };
  }
}
