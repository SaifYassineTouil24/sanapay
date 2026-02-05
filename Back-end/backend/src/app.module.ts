import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';


import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EwalletModule } from './ewallet/ewallet.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BillsModule } from './bills/bills.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    
   

    // ================= BACKEND =================
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'sanapaydb',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),

    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL) || 60,
        limit: parseInt(process.env.THROTTLE_LIMIT) || 10,
      },
    ]),

    AuthModule,
    UserModule,
    EwalletModule,
    TransactionsModule,
    BillsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}