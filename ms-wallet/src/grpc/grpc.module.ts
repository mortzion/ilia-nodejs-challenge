import { Module } from '@nestjs/common';
import { GRPCWalletController } from './controllers/grpc-wallet.controller';
import { TransactionModule } from '../transactions/transaction.module';

@Module({
  imports: [TransactionModule],
  controllers: [GRPCWalletController],
})
export class GRPCModule {}
