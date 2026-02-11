/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GetBalanceAction } from './get-balance.action';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { GetBalanceDto } from '../dtos/get-balance.dto';

describe('GetBalanceAction', () => {
  let action: GetBalanceAction;
  let repository: jest.Mocked<TransactionsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBalanceAction,
        { provide: TransactionsRepository, useValue: { balance: jest.fn() } },
      ],
    }).compile();

    action = module.get<GetBalanceAction>(GetBalanceAction);
    repository = module.get(TransactionsRepository);

    jest.clearAllMocks();
  });

  it('should return balance for the user', async () => {
    const balance = 150.75;
    const dto: GetBalanceDto = { user_id: 'uuid' };

    repository.balance.mockResolvedValue(balance);

    const result = await action.execute(dto);

    expect(repository.balance).toHaveBeenCalledWith(dto.user_id);
    expect(result).toBe(balance);
  });
});
