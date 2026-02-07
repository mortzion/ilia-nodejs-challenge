import { Injectable } from '@nestjs/common';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { GetBalanceDto } from '../dtos/get-balance.dto';

@Injectable()
export class GetBalanceAction {
  constructor(private repository: TransactionsRepository) {}

  execute(dto: GetBalanceDto): Promise<number> {
    return this.repository.balance(dto.user_id);
  }
}
