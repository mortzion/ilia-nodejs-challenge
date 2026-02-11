import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../models/transaction.model';
import { Repository } from 'typeorm';
import { ListTransactionsDto } from '../dtos/list-transactions.dto';

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectRepository(Transaction) private repository: Repository<Transaction>,
  ) {}

  insert(transaction: Transaction): Promise<Transaction> {
    return this.repository.save(transaction);
  }

  list(dto: ListTransactionsDto): Promise<Transaction[]> {
    return this.repository.find({
      where: { user_id: dto.user_id, type: dto.type },
      order: { created_at: 'DESC' },
    });
  }

  async balance(user_id: string): Promise<number> {
    const data = await this.repository
      .createQueryBuilder()
      .select(
        `sum(
          case
              when type = 'CREDIT' then amount
              else -amount
          end
        ) as amount`,
      )
      .where('user_id = :user_id', { user_id })
      .getRawOne<{ amount: number }>();

    return data?.amount ?? 0;
  }

  async lockTransactionsForUpdate(user_id: string): Promise<void> {
    await this.repository.findOne({
      where: { user_id },
      order: { created_at: 'DESC' },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async transaction<T>(
    callback: (repository: TransactionsRepository) => Promise<T>,
  ): Promise<T> {
    return await this.repository.manager.transaction((transaction) => {
      const repository = transaction.getRepository(Transaction);

      return callback(new TransactionsRepository(repository));
    });
  }
}
