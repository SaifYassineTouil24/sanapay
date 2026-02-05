import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { BillsService } from './bills.service';
import { CreateBillDto, UpdateBillDto } from './dto/bill.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BillStatus } from './bill.entity';

@ApiTags('Bills')
@Controller('bills')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bill' })
  @ApiResponse({ status: 201, description: 'Bill created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req, @Body() createBillDto: CreateBillDto) {
    return this.billsService.create(req.user.id, createBillDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bills' })
  @ApiQuery({ name: 'status', required: false, enum: BillStatus })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Bills retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Request() req,
    @Query('status') status?: BillStatus,
    @Query('category') category?: string,
  ) {
    return this.billsService.findAll(req.user.id, status, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bill by ID' })
  @ApiParam({ name: 'id', description: 'Bill ID' })
  @ApiResponse({ status: 200, description: 'Bill retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.billsService.findOne(req.user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a bill' })
  @ApiParam({ name: 'id', description: 'Bill ID' })
  @ApiResponse({ status: 200, description: 'Bill updated successfully' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  @ApiResponse({ status: 400, description: 'Cannot update paid bill' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBillDto: UpdateBillDto,
  ) {
    return this.billsService.update(req.user.id, id, updateBillDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bill' })
  @ApiParam({ name: 'id', description: 'Bill ID' })
  @ApiResponse({ status: 200, description: 'Bill deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete paid bill' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.billsService.remove(req.user.id, id);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Pay a bill' })
  @ApiParam({ name: 'id', description: 'Bill ID' })
  @ApiResponse({ status: 200, description: 'Bill paid successfully' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  @ApiResponse({ status: 400, description: 'Insufficient balance or invalid bill status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async pay(@Request() req, @Param('id') id: string) {
    return this.billsService.pay(req.user.id, id);
  }
}
