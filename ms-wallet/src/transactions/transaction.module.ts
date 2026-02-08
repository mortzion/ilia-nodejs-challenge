import { Module } from '@nestjs/common';
import { TransactionsController } from './controllers/transactions.controller';
import { TransactionsRepository } from './repositories/transactions.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './models/transaction.model';
import { BalanceController } from './controllers/balance.controller';
import { CreateTransactionAction } from './actions/create-transaction.action';
import { ListTransactionAction } from './actions/list-transactions.action';
import { GetBalanceAction } from './actions/get-balance.action';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [TransactionsController, BalanceController],
  providers: [
    TransactionsRepository,
    CreateTransactionAction,
    ListTransactionAction,
    GetBalanceAction,
  ],
  exports: [CreateTransactionAction, ListTransactionAction, GetBalanceAction],
})
export class TransactionModule {}
