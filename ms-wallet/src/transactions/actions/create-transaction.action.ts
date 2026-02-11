import { Injectable } from '@nestjs/common';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { Transaction, TransactionType } from '../models/transaction.model';
import { v4 } from 'uuid';
import { OverdraftException } from '../exceptions/email-already-in-use.exception';

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

    if (transaction.type === TransactionType.credit) {
      return this.repository.insert(transaction);
    }

    return this.repository.transaction(async (repository) => {
      await repository.lockTransactionsForUpdate(transaction.user_id);

      const balance = await repository.balance(transaction.user_id);

      if (balance < transaction.amount) {
        throw new OverdraftException();
      }

      return await repository.insert(transaction);
    });
  }
}
