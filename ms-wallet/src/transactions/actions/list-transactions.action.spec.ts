/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ListTransactionAction } from './list-transactions.action';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { ListTransactionsDto } from '../dtos/list-transactions.dto';
import { Transaction, TransactionType } from '../models/transaction.model';

describe('ListTransactionAction', () => {
  let action: ListTransactionAction;
  let repository: jest.Mocked<TransactionsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListTransactionAction,
        { provide: TransactionsRepository, useValue: { list: jest.fn() } },
      ],
    }).compile();

    action = module.get<ListTransactionAction>(ListTransactionAction);
    repository = module.get(TransactionsRepository);

    jest.clearAllMocks();
  });

  it('should return all transactions for a user without type filter', async () => {
    const dto: ListTransactionsDto = { user_id: 'uuid' };
    const mockTransactions: Transaction[] = [
      {
        id: 'transaction-1',
        user_id: 'uuid',
        amount: 100,
        type: TransactionType.credit,
        created_at: new Date('2026-01-01'),
      },
      {
        id: 'transaction-2',
        user_id: 'uuid',
        amount: 50,
        type: TransactionType.debit,
        created_at: new Date('2026-01-02'),
      },
    ];

    repository.list.mockResolvedValue(mockTransactions);

    const result = await action.execute(dto);

    expect(repository.list).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockTransactions);
  });

  it('should filter transactions by type when type filter is set', async () => {
    const listTransactionsDto: ListTransactionsDto = {
      user_id: 'uuid',
      type: TransactionType.credit,
    };

    const mockCreditTransactions: Transaction[] = [
      {
        id: 'transaction-1',
        user_id: 'uuid',
        amount: 100,
        type: TransactionType.credit,
        created_at: new Date('2026-01-01'),
      },
      {
        id: 'transaction-2',
        user_id: 'uuid',
        amount: 75,
        type: TransactionType.credit,
        created_at: new Date('2026-01-03'),
      },
    ];

    repository.list.mockResolvedValue(mockCreditTransactions);

    const result = await action.execute(listTransactionsDto);

    expect(repository.list).toHaveBeenCalledWith(listTransactionsDto);
    expect(result).toEqual(mockCreditTransactions);
  });
});
