import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTransactionDto } from 'src/transactions/dtos/create-transaction.dto';
import { ListTransactionsDto } from 'src/transactions/dtos/list-transactions.dto';
import { CreateTransactionAction } from '../actions/create-transaction.action';
import { ListTransactionAction } from '../actions/list-transactions.action';
import { TransactionViewDto } from '../dtos/transaction-view.dto';
import { CurrentUserId } from 'src/common/decorators/current-user-id.decorator';
import { OverdraftException } from '../exceptions/email-already-in-use.exception';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private createTransactionAction: CreateTransactionAction,
    private listTransactionsAction: ListTransactionAction,
  ) {}

  @Post()
  async createTransaction(
    @CurrentUserId() currentUserId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    if (dto.user_id !== currentUserId) throw new ForbiddenException();

    try {
      const transaction = await this.createTransactionAction.execute(dto);

      return new TransactionViewDto(
        transaction.id,
        transaction.amount,
        transaction.user_id,
        transaction.type,
      );
    } catch (error) {
      if (error instanceof OverdraftException) {
        throw new ForbiddenException("Can't overdraft wallet");
      }

      throw error;
    }
  }

  @Get()
  async listTransactions(
    @CurrentUserId() currentUserId: string,
    @Query() dto: ListTransactionsDto,
  ) {
    if (dto.user_id !== currentUserId) throw new ForbiddenException();

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
