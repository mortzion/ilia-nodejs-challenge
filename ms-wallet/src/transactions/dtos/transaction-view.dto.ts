import { TransactionType } from '../models/transaction.model';

export class TransactionViewDto {
  constructor(
    private id: string,
    private amount: number,
    private user_id: string,
    private type: TransactionType,
  ) {}
}
