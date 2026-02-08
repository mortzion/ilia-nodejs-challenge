import { Controller, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { plainToClass } from 'class-transformer';
import { GetBalanceAction } from 'src/transactions/actions/get-balance.action';
import { BalanceResponseDto } from 'src/transactions/dtos/balance-response.dto';
import { GetBalanceDto } from 'src/transactions/dtos/get-balance.dto';
import { GRPCGuard } from 'src/common/guards/grpc.guard';

@Controller()
@UseGuards(GRPCGuard)
export class GRPCWalletController {
  constructor(private getBalanceAction: GetBalanceAction) {}

  @GrpcMethod('WalletService', 'Balance')
  async balance(data: typeof GetBalanceDto): Promise<BalanceResponseDto> {
    const balance = await this.getBalanceAction.execute(
      plainToClass(GetBalanceDto, data),
    );

    return new BalanceResponseDto(balance);
  }
}
