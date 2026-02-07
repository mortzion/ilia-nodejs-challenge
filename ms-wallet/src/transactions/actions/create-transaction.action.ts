import { Injectable } from '@nestjs/common';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { Transaction } from '../models/transaction.model';
import { v4 } from 'uuid';

@Injectable()
export class CreateTransactionAction {
  constructor(private repository: TransactionsRepository) {}

  execute(dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = new Transaction();

    transaction.id = v4();
    transaction.user_id = dto.user_id;
    transaction.amount = dto.amount;
    transaction.type = dto.type;
    transaction.created_at = new Date();

    return this.repository.insert(transaction);
  }
}
