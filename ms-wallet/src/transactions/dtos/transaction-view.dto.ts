import { TransactionType } from '../models/transaction.model';

export class TransactionViewDto {
  constructor(
    public id: string,
    public amount: number,
    public user_id: string,
    public type: TransactionType,
  ) {}
}
