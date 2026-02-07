import { IsString } from 'class-validator';

export class GetBalanceDto {
  @IsString()
  user_id: string;
}
