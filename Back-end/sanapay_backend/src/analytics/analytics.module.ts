import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Transaction } from '../transactions/transaction.entity';
import { Bill } from '../bills/bill.entity';
import { Ewallet } from '../ewallet/ewallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Bill, Ewallet])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
