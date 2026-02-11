/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ListUsersAction } from './list-users.action';
import { UsersRepository } from '../repositories/transactions.repository';
import { User } from '../models/user.model';

describe('ListUsersAction', () => {
  let action: ListUsersAction;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUsersAction,
        { provide: UsersRepository, useValue: { findAll: jest.fn() } },
      ],
    }).compile();

    action = module.get<ListUsersAction>(ListUsersAction);
    repository = module.get(UsersRepository);

    jest.clearAllMocks();
  });

  it('should return all non-deleted users', async () => {
    const mockUsers: User[] = [
      {
        id: 'uuid',
        first_name: 'first_name',
        last_name: 'last_name',
        email: 'email',
        password: 'hash',
        deleted_at: null,
      },
    ];

    repository.findAll.mockResolvedValue(mockUsers);

    const result = await action.execute();

    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockUsers);
  });
});
