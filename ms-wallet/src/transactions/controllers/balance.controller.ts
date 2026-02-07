import { Controller, ForbiddenException, Get, Query } from '@nestjs/common';
import { GetBalanceDto } from '../dtos/get-balance.dto';
import { GetBalanceAction } from '../actions/get-balance.action';
import { BalanceViewDto } from '../dtos/balance-view.dto';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';

@Controller('balance')
export class BalanceController {
  constructor(private getBalanceAction: GetBalanceAction) {}

  @Get()
  async balance(
    @CurrentUserId() currentUserId: string,
    @Query() params: GetBalanceDto,
  ) {
    if (params.user_id !== currentUserId) throw new ForbiddenException();

    const balance = await this.getBalanceAction.execute(params);

    return new BalanceViewDto(balance);
  }
}
