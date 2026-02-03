import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillCategory, BillStatus } from '../bill.entity';

export class CreateBillDto {
  @ApiProperty({
    example: 'Electricity Bill - January 2026',
    description: 'Bill title',
  })
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @ApiProperty({
    example: 450.50,
    description: 'Bill amount in MAD',
  })
  @IsNumber()
  @Min(1, { message: 'Amount must be at least 1 MAD' })
  @Max(100000, { message: 'Amount must not exceed 100,000 MAD' })
  amount: number;

  @ApiProperty({
    example: 'ELECTRICITY',
    enum: BillCategory,
    description: 'Bill category',
  })
  @IsEnum(BillCategory, { message: 'Invalid bill category' })
  category: BillCategory;

  @ApiProperty({
    example: '2026-02-15',
    description: 'Due date (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    example: 'Additional notes about this bill',
    description: 'Optional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiProperty({
    example: 'ACC-123456',
    description: 'Account number',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountNumber?: string;
}

export class UpdateBillDto {
  @ApiProperty({
    example: 'Electricity Bill - February 2026',
    description: 'Bill title',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    example: 475.00,
    description: 'Bill amount in MAD',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100000)
  amount?: number;

  @ApiProperty({
    example: 'PENDING',
    enum: BillStatus,
    description: 'Bill status',
    required: false,
  })
  @IsOptional()
  @IsEnum(BillStatus)
  status?: BillStatus;

  @ApiProperty({
    example: 'ELECTRICITY',
    enum: BillCategory,
    description: 'Bill category',
    required: false,
  })
  @IsOptional()
  @IsEnum(BillCategory)
  category?: BillCategory;

  @ApiProperty({
    example: '2026-02-20',
    description: 'Due date (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    example: 'Updated notes',
    description: 'Optional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiProperty({
    example: 'ACC-654321',
    description: 'Account number',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountNumber?: string;
}
