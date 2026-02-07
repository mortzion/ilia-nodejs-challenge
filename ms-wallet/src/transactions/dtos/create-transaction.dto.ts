import { TransactionType } from 'src/transactions/models/transaction.model';
import { IsEnum, IsNumber } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateTransactionDto {
  @Expose()
  @IsNumber()
  user_id: number;

  @Expose()
  @IsNumber()
  amount: number;

  @Expose()
  @IsEnum(TransactionType)
  type: TransactionType;
}
