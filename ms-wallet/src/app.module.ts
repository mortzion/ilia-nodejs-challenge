import 'reflect-metadata';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthCheckController } from './health-check.controller';
import { TransactionModule } from './transactions/transaction.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transactions/models/transaction.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Transaction],
    }),
    TransactionModule,
  ],
  controllers: [HealthCheckController],
  providers: [],
})
export class AppModule {}
