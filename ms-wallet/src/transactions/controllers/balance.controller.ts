import { Controller, Get, Query } from '@nestjs/common';
import { GetBalanceDto } from '../dtos/get-balance.dto';
import { GetBalanceAction } from '../actions/get-balance.action';
import { BalanceViewDto } from '../dtos/balance-view.dto';

@Controller('balance')
export class BalanceController {
  constructor(private getBalanceAction: GetBalanceAction) {}

  @Get()
  async balance(@Query() params: GetBalanceDto) {
    const balance = await this.getBalanceAction.execute(params);

    return new BalanceViewDto(balance);
  }
}
