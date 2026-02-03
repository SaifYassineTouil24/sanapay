import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { Bill } from './bill.entity';
import { EwalletModule } from '../ewallet/ewallet.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bill]), EwalletModule],
  controllers: [BillsController],
  providers: [BillsService],
  exports: [BillsService],
})
export class BillsModule {}
