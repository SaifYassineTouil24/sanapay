import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';

import { User } from './user/user.entity';
import { Ewallet } from './ewallet/ewallet.entity';
import { Transaction } from './transactions/transaction.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // 🔴 OBLIGATOIRE : toutes les entities ici
  entities: [
    User,
    Ewallet,
    Transaction,
  ],

  migrations: ['src/migrations/*.ts'],
  synchronize: false, // ❌ jamais true
  logging: false,
});
