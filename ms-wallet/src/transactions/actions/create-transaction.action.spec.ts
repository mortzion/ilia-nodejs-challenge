/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionAction } from './create-transaction.action';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { Transaction, TransactionType } from '../models/transaction.model';
import { OverdraftException } from '../exceptions/email-already-in-use.exception';

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
        {
          provide: TransactionsRepository,
          useValue: {
            insert: jest.fn(),
            balance: jest.fn(),
            lockTransactionsForUpdate: jest.fn(),
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    action = module.get<CreateTransactionAction>(CreateTransactionAction);
    repository = module.get(TransactionsRepository);

    jest.clearAllMocks();
  });

  it('should create a credit transaction directly without checking balance', async () => {
    const dto: CreateTransactionDto = {
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

    const result = await action.execute(dto);

    expect(repository.transaction).not.toHaveBeenCalled();
    expect(repository.balance).not.toHaveBeenCalled();
    expect(repository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        ...expectedTransaction,
        created_at: expect.anything() as Date,
      }),
    );
    expect(result).toEqual(expectedTransaction);
  });

  it('should create a debit transaction when balance is sufficient', async () => {
    const dto: CreateTransactionDto = {
      user_id: 'uuid',
      amount: 50,
      type: TransactionType.debit,
    };
    const mockTransactionId = 'transaction-uuid';
    const expectedTransaction: Transaction = {
      id: mockTransactionId,
      user_id: 'uuid',
      amount: 50,
      type: TransactionType.debit,
      created_at: new Date(),
    };
    const innerRepository = {
      lockTransactionsForUpdate: jest.fn().mockResolvedValue(undefined),
      balance: jest.fn().mockResolvedValue(100),
      insert: jest.fn().mockResolvedValue(expectedTransaction),
    };

    repository.transaction.mockImplementation((callback) =>
      callback(innerRepository as unknown as TransactionsRepository),
    );

    const result = await action.execute(dto);

    expect(repository.transaction).toHaveBeenCalledTimes(1);
    expect(innerRepository.balance).toHaveBeenCalledWith(dto.user_id);
    expect(innerRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        ...expectedTransaction,
        created_at: expect.anything() as Date,
      }),
    );
    expect(result).toEqual(expectedTransaction);
  });

  it('should throw OverdraftException when balance is insufficient for a debit transaction', async () => {
    const dto: CreateTransactionDto = {
      user_id: 'uuid',
      amount: 150,
      type: TransactionType.debit,
    };
    const innerRepository = {
      lockTransactionsForUpdate: jest.fn().mockResolvedValue(undefined),
      balance: jest.fn().mockResolvedValue(100),
      insert: jest.fn(),
    };

    repository.transaction.mockImplementation((callback) =>
      callback(innerRepository as unknown as TransactionsRepository),
    );

    await expect(action.execute(dto)).rejects.toThrow(OverdraftException);
    expect(innerRepository.lockTransactionsForUpdate).toHaveBeenCalledWith(
      'uuid',
    );
    expect(innerRepository.balance).toHaveBeenCalledWith(dto.user_id);
    expect(innerRepository.insert).not.toHaveBeenCalled();
  });
});
