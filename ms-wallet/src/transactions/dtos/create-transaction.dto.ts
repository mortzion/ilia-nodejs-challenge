import { TransactionType } from 'src/transactions/models/transaction.model';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateTransactionDto {
  @Expose()
  @IsString()
  user_id: string;

  @Expose()
  @IsNumber()
  amount: number;

  @Expose()
  @IsEnum(TransactionType)
  type: TransactionType;
}
