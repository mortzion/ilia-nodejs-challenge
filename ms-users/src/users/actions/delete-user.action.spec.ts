/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserAction } from './delete-user.action';
import { UsersRepository } from '../repositories/transactions.repository';
import { WalletService } from 'src/grpc/services/wallet.service';
import { UserWithBalanceException } from '../exceptions/user-with-balance.exception';
import { NotFoundException } from '../exceptions/not-found.exception';
import { WalletServiceUnavailableException } from '../exceptions/wallet-service-unavailable.exception';

describe('DeleteUserAction', () => {
  let action: DeleteUserAction;
  let repository: jest.Mocked<UsersRepository>;
  let walletService: jest.Mocked<WalletService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserAction,
        { provide: UsersRepository, useValue: { delete: jest.fn() } },
        { provide: WalletService, useValue: { balance: jest.fn() } },
      ],
    }).compile();

    action = module.get<DeleteUserAction>(DeleteUserAction);
    repository = module.get(UsersRepository);
    walletService = module.get(WalletService);

    jest.clearAllMocks();
  });

  it('should successfully delete user when balance is zero', async () => {
    const user_id = 'uuid';

    walletService.balance.mockResolvedValue({ amount: 0 });
    repository.delete.mockResolvedValue(true);

    await action.execute(user_id);

    expect(walletService.balance).toHaveBeenCalledWith({ user_id });
    expect(repository.delete).toHaveBeenCalledWith(user_id);
  });

  it('should throw UserWithBalanceException when balance is positive', async () => {
    const user_id = 'uuid';

    walletService.balance.mockResolvedValue({ amount: 100 });

    await expect(action.execute(user_id)).rejects.toThrow(
      UserWithBalanceException,
    );
    expect(walletService.balance).toHaveBeenCalledWith({ user_id });
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should throw WalletServiceUnavailableException when the gRPC call fails', async () => {
    const user_id = 'uuid';

    walletService.balance.mockRejectedValue(new Error());

    await expect(action.execute(user_id)).rejects.toThrow(
      WalletServiceUnavailableException,
    );
    expect(walletService.balance).toHaveBeenCalledWith({ user_id });
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when user does not exist', async () => {
    const userId = 'uuid';

    walletService.balance.mockResolvedValue({ amount: 0 });
    repository.delete.mockResolvedValue(false);

    await expect(action.execute(userId)).rejects.toThrow(NotFoundException);
    expect(walletService.balance).toHaveBeenCalledWith({ user_id: userId });
    expect(repository.delete).toHaveBeenCalledWith(userId);
  });
});
