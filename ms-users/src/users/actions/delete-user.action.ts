import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { UsersRepository } from '../repositories/transactions.repository';
import { WalletService } from 'src/common/grpc/services/wallet.service';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserWithBalanceException } from '../exceptions/user-with-balance.exception';
import { NotFoundException } from '../exceptions/not-found.exception';

@Injectable()
export class DeleteUserAction implements OnModuleInit {
  private walletService: WalletService;

  constructor(
    private repository: UsersRepository,
    @Inject('WALLET_PACKAGE') private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.walletService = this.client.getService('WalletService');
  }

  async execute(id: string) {
    const balance = await firstValueFrom(
      this.walletService.balance({ user_id: id }),
    );

    if (balance.amount > 0) {
      throw new UserWithBalanceException(id, balance.amount);
    }

    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('User not found');
    }
  }
}
