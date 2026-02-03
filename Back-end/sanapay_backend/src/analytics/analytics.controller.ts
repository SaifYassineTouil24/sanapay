import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get analytics summary' })
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSummary(@Request() req) {
    return this.analyticsService.getSummary(req.user.id);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly analytics (last 12 months)' })
  @ApiResponse({ status: 200, description: 'Monthly analytics retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMonthlyAnalytics(@Request() req) {
    return this.analyticsService.getMonthlyAnalytics(req.user.id);
  }

  @Get('yearly')
  @ApiOperation({ summary: 'Get yearly analytics (last 3 years)' })
  @ApiResponse({ status: 200, description: 'Yearly analytics retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getYearlyAnalytics(@Request() req) {
    return this.analyticsService.getYearlyAnalytics(req.user.id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get analytics by bill category' })
  @ApiResponse({ status: 200, description: 'Category analytics retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCategoryAnalytics(@Request() req) {
    return this.analyticsService.getCategoryAnalytics(req.user.id);
  }
}
