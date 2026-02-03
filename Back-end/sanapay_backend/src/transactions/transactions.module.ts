import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './transaction.entity';
import { Ewallet } from '../ewallet/ewallet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Ewallet]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
