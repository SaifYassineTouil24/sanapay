import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EwalletService } from './ewallet.service';

@Controller('ewallet')
@UseGuards(JwtAuthGuard)
export class EwalletController {
  constructor(private readonly service: EwalletService) {}

  @Get('me')
  getMyWallet(@Req() req) {
    return this.service.getWalletByUserId(req.user.id);
  }

  @Post('deposit')
  deposit(@Req() req, @Body('amount') amount: number) {
    return this.service.deposit(req.user.id, amount);
  }

  @Post('withdraw')
  withdraw(@Req() req, @Body('amount') amount: number) {
    return this.service.withdraw(req.user.id, amount);
  }
}
