import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class ListTransactionsDto {
  @IsNumber()
  @Transform((params) => Number(params.value))
  user_id: number;
}
