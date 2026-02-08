import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/transactions.repository';
import { UserWithBalanceException } from '../exceptions/user-with-balance.exception';
import { NotFoundException } from '../exceptions/not-found.exception';
import { WalletService } from 'src/grpc/services/wallet.service';

@Injectable()
export class DeleteUserAction {
  constructor(
    private repository: UsersRepository,
    private walletService: WalletService,
  ) {}

  async execute(id: string) {
    const balance = await this.walletService.balance({ user_id: id });

    if (balance.amount > 0) {
      throw new UserWithBalanceException(id, balance.amount);
    }

    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('User not found');
    }
  }
}
