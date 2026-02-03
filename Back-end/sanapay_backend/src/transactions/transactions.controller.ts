import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('deposit')
  deposit(@Req() req, @Body('amount') amount: number) {
    return this.transactionsService.deposit(req.user.id, amount);
  }

  @Post('withdraw')
  withdraw(@Req() req, @Body('amount') amount: number) {
    return this.transactionsService.withdraw(req.user.id, amount);
  }

  @Get('history')
  getHistory(@Req() req) {
    return this.transactionsService.getHistory(req.user.id);
  }

  @Get('stats')
  getStats(@Req() req) {
    return this.transactionsService.getStats(req.user.id);
  }
}


