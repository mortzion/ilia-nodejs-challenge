import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionType } from '../models/transaction.model';

export class ListTransactionsDto {
  @IsString()
  user_id: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;
}
