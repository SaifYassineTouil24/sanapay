import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ewallet } from './ewallet.entity';
import { Transaction } from '../transactions/transaction.entity';
import { EwalletService } from './ewallet.service';
import { EwalletController } from './ewallet.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ewallet, Transaction])],
  controllers: [EwalletController],
  providers: [EwalletService],
  exports: [EwalletService], // ✅ LIGNE MANQUANTE
})
export class EwalletModule {}
