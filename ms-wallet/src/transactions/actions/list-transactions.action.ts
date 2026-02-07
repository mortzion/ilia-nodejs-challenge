import { Injectable } from '@nestjs/common';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { Transaction } from '../models/transaction.model';
import { ListTransactionsDto } from '../dtos/list-transactions.dto';

@Injectable()
export class ListTransactionAction {
  constructor(private repository: TransactionsRepository) {}

  execute(dto: ListTransactionsDto): Promise<Transaction[]> {
    return this.repository.list(dto.user_id);
  }
}
