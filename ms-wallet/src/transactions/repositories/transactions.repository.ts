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
}
