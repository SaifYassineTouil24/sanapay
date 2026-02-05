import { Controller, Post, Get, Body, Query, UseGuards, Request,Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { DepositDto, WithdrawDto } from './dto/transaction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TransferDto } from './dto/transaction.dto';


@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit money to wallet' })
  @ApiResponse({ status: 201, description: 'Deposit successful' })
  @ApiResponse({ status: 400, description: 'Invalid amount' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deposit(@Request() req, @Body() depositDto: DepositDto) {
    return this.transactionsService.deposit(req.user.id, depositDto);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Withdraw money from wallet' })
  @ApiResponse({ status: 201, description: 'Withdrawal successful' })
  @ApiResponse({ status: 400, description: 'Insufficient balance or invalid amount' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async withdraw(@Request() req, @Body() withdrawDto: WithdrawDto) {
    return this.transactionsService.withdraw(req.user.id, withdrawDto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of transactions to return' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getHistory(@Request() req, @Query('limit') limit?: number) {
    return this.transactionsService.getHistory(req.user.id, limit || 50);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(@Request() req) {
    return this.transactionsService.getStats(req.user.id);
  }
@Post('transfer')
@UseGuards(JwtAuthGuard)
transfer(
  @Req() req: any,
  @Body() dto: TransferDto,
) {
  const userId = req.user.id;
  return this.transactionsService.transfer(userId, dto);
}


}
