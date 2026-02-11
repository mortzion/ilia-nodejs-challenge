import { Inject, Injectable } from '@nestjs/common';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { Transaction, TransactionType } from '../models/transaction.model';
import { v4 } from 'uuid';
import { OverdraftException } from '../exceptions/email-already-in-use.exception';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { getBalanceCacheKey } from '../utils/cache-key';
import { noop } from 'rxjs';

@Injectable()
export class CreateTransactionAction {
  constructor(
    private repository: TransactionsRepository,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = await this.createTransaction(dto);

    // Normally we should retry to delete the cache to keep consistency in the balance endpoint
    // But we should not throw an error to the user in this endpoint. We are also no awaiting
    // for the cache to be deleted before returning to not delay the response to the user
    this.cache.del(getBalanceCacheKey(dto.user_id)).catch(noop);

    return transaction;
  }

  private async createTransaction(
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    const transaction = new Transaction();

    transaction.id = v4();
    transaction.user_id = dto.user_id;
    transaction.amount = dto.amount;
    transaction.type = dto.type;
    transaction.created_at = new Date();

    if (transaction.type === TransactionType.credit) {
      return await this.repository.insert(transaction);
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
