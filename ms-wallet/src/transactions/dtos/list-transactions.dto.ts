import { IsString } from 'class-validator';

export class ListTransactionsDto {
  @IsString()
  user_id: string;
}
