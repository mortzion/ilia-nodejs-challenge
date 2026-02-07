import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateTransactionDto } from 'src/transactions/dtos/create-transaction.dto';
import { ListTransactionsDto } from 'src/transactions/dtos/list-transactions.dto';
import { CreateTransactionAction } from '../actions/create-transaction.action';
import { ListTransactionAction } from '../actions/list-transactions.action';
import { TransactionViewDto } from '../dtos/transaction-view.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private createTransactionAction: CreateTransactionAction,
    private listTransactionsAction: ListTransactionAction,
  ) {}

  @Post()
  async createTransaction(@Body() dto: CreateTransactionDto) {
    const transaction = await this.createTransactionAction.execute(dto);

    return new TransactionViewDto(
      transaction.id,
      transaction.amount,
      transaction.user_id,
      transaction.type,
    );
  }

  @Get()
  async listTransactions(@Query() dto: ListTransactionsDto) {
    const transactions = await this.listTransactionsAction.execute(dto);

    return transactions.map(
      (transaction) =>
        new TransactionViewDto(
          transaction.id,
          transaction.amount,
          transaction.user_id,
          transaction.type,
        ),
    );
  }
}
