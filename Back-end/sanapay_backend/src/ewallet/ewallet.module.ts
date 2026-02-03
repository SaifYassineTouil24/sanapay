import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ewallet } from './ewallet.entity';
import { EwalletService } from './ewallet.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Ewallet]),
  ],
  providers: [EwalletService],
  exports: [EwalletService], // pour AuthModule
})
export class EwalletModule {}
