/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GetBalanceAction } from './get-balance.action';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { GetBalanceDto } from '../dtos/get-balance.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('GetBalanceAction', () => {
  let action: GetBalanceAction;
  let repository: jest.Mocked<TransactionsRepository>;
  let cache: { wrap: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBalanceAction,
        { provide: TransactionsRepository, useValue: { balance: jest.fn() } },
        { provide: CACHE_MANAGER, useValue: { wrap: jest.fn() } },
      ],
    }).compile();

    action = module.get<GetBalanceAction>(GetBalanceAction);
    repository = module.get(TransactionsRepository);
    cache = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  it('should return the cached balance value without calling the repository', async () => {
    const balance = 150.75;
    const dto: GetBalanceDto = { user_id: 'uuid' };

    cache.wrap.mockResolvedValue(balance);
    repository.balance.mockResolvedValue(balance);

    const result = await action.execute(dto);

    expect(cache.wrap).toHaveBeenCalled();
    expect(repository.balance).not.toHaveBeenCalled();
    expect(result).toBe(balance);
  });

  it('should fallback to the repository when the cache misses', async () => {
    const balance = 200;
    const dto: GetBalanceDto = { user_id: 'uuid' };

    cache.wrap.mockImplementation((_key, callback) => callback());
    repository.balance.mockResolvedValue(balance);

    const result = await action.execute(dto);

    expect(cache.wrap).toHaveBeenCalled();
    expect(repository.balance).toHaveBeenCalledWith(dto.user_id);
    expect(result).toBe(balance);
  });

  it('should fall back to the repository when cache throws', async () => {
    const balance = 150.75;
    const dto: GetBalanceDto = { user_id: 'uuid' };

    cache.wrap.mockRejectedValue(new Error());
    repository.balance.mockResolvedValue(balance);

    const result = await action.execute(dto);

    expect(cache.wrap).toHaveBeenCalled();
    expect(repository.balance).toHaveBeenCalledWith(dto.user_id);
    expect(result).toBe(balance);
  });
});
