/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionAction } from './create-transaction.action';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { Transaction, TransactionType } from '../models/transaction.model';

jest.mock('uuid');

import { v4 } from 'uuid';

describe('CreateTransactionAction', () => {
  let action: CreateTransactionAction;
  let repository: jest.Mocked<TransactionsRepository>;

  const mockV4 = v4 as jest.MockedFunction<() => string>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionAction,
        { provide: TransactionsRepository, useValue: { insert: jest.fn() } },
      ],
    }).compile();

    action = module.get<CreateTransactionAction>(CreateTransactionAction);
    repository = module.get(TransactionsRepository);

    jest.clearAllMocks();
  });

  it('should create a transaction', async () => {
    const createTransactionDto: CreateTransactionDto = {
      user_id: 'uuid',
      amount: 100.5,
      type: TransactionType.credit,
    };
    const mockTransactionId = 'transaction-uuid';
    const expectedTransaction: Transaction = {
      id: mockTransactionId,
      user_id: 'uuid',
      amount: 100.5,
      type: TransactionType.credit,
      created_at: new Date(),
    };

    mockV4.mockReturnValue(mockTransactionId);
    repository.insert.mockResolvedValue(expectedTransaction);

    const result = await action.execute(createTransactionDto);

    expect(mockV4).toHaveBeenCalledTimes(1);
    expect(repository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        ...expectedTransaction,
        created_at: expect.anything() as Date,
      }),
    );
    expect(result).toEqual(expectedTransaction);
  });
});
