import { IsNotEmpty,IsNumber, IsPositive, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class DepositDto {
  @ApiProperty({
    example: 1000,
    description: 'Amount to deposit (MAD)',
    minimum: 10,
    maximum: 50000,
  })
  @IsNumber()
  @IsPositive({ message: 'Amount must be positive' })
  @Min(10, { message: 'Minimum deposit amount is 10 MAD' })
  @Max(50000, { message: 'Maximum deposit amount is 50,000 MAD' })
  amount: number;

  @ApiProperty({
    example: 'Monthly salary deposit',
    description: 'Optional description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class WithdrawDto {
  @ApiProperty({
    example: 500,
    description: 'Amount to withdraw (MAD)',
    minimum: 10,
    maximum: 10000,
  })
  @IsNumber()
  @IsPositive({ message: 'Amount must be positive' })
  @Min(10, { message: 'Minimum withdrawal amount is 10 MAD' })
  @Max(10000, { message: 'Maximum withdrawal amount is 10,000 MAD' })
  amount: number;

  @ApiProperty({
    example: 'ATM withdrawal',
    description: 'Optional description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
export class TransferDto {
  @IsNotEmpty()
  @IsString()
  walletNumber: string;   // portefeuille destinataire

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  description?: string;
}
