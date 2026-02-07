import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../models/transaction.model';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectRepository(Transaction) private repository: Repository<Transaction>,
  ) {}

  insert(transaction: Transaction): Promise<Transaction> {
    return this.repository.save(transaction);
  }

  list(user_id: number): Promise<Transaction[]> {
    return this.repository.find({
      where: { user_id },
      order: { created_at: 'DESC' },
    });
  }

  async balance(user_id: number): Promise<number> {
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

    return data ? data.amount : 0;
  }
}
