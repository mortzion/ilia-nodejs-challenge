import { Metadata } from '@grpc/grpc-js';
import { Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';

interface BalanceData {
  user_id: string;
}

interface BalanceResponse {
  amount: number;
}

export interface GRPCWalletService {
  balance(data: BalanceData, metadata?: Metadata): Observable<BalanceResponse>;
}

export class WalletService implements OnModuleInit {
  private grpcWalletService: GRPCWalletService;

  constructor(@Inject('WALLET_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.grpcWalletService =
      this.client.getService<GRPCWalletService>('WalletService');
  }

  balance(data: BalanceData): Promise<BalanceResponse> {
    const metadata = new Metadata();
    metadata.set('authorization', process.env.INTERNAL_TOKEN!);

    return lastValueFrom(this.grpcWalletService.balance(data, metadata));
  }
}
