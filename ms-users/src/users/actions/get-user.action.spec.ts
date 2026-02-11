/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GetUserAction } from './get-user.action';
import { UsersRepository } from '../repositories/transactions.repository';
import { User } from '../models/user.model';
import { NotFoundException } from '../exceptions/not-found.exception';

describe('GetUserAction', () => {
  let action: GetUserAction;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserAction,
        { provide: UsersRepository, useValue: { findById: jest.fn() } },
      ],
    }).compile();

    action = module.get<GetUserAction>(GetUserAction);
    repository = module.get(UsersRepository);

    jest.clearAllMocks();
  });

  it('should return user when found', async () => {
    const mockUser: User = {
      id: 'uuid',
      first_name: 'first_name',
      last_name: 'last_name',
      email: 'email',
      password: 'password',
      deleted_at: null,
    };

    repository.findById.mockResolvedValue(mockUser);

    const result = await action.execute(mockUser.id);

    expect(repository.findById).toHaveBeenCalledWith(mockUser.id);
    expect(result).toEqual(mockUser);
  });

  it('should throw NotFoundException when user not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(action.execute('uuid')).rejects.toThrow(NotFoundException);
  });
});
