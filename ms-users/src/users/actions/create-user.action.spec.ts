/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserAction } from './create-user.action';
import { UsersRepository } from '../repositories/transactions.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../models/user.model';
import { EmailAlreadyInUseException } from '../exceptions/email-already-in-use.exception';

jest.mock('bcrypt');
jest.mock('uuid');

import { hash } from 'bcrypt';
import { v4 } from 'uuid';

describe('CreateUserAction', () => {
  let action: CreateUserAction;
  let repository: jest.Mocked<UsersRepository>;

  const mockHash = hash as jest.MockedFunction<typeof hash>;
  const mockV4 = v4 as jest.MockedFunction<() => string>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserAction,
        { provide: UsersRepository, useValue: { insert: jest.fn() } },
      ],
    }).compile();

    action = module.get<CreateUserAction>(CreateUserAction);
    repository = module.get(UsersRepository);

    jest.clearAllMocks();
  });

  it('should create a user with hashed password', async () => {
    const mockUserId = 'uuid';
    const mockHashedPassword = 'hash';
    const createUserDto: CreateUserDto = {
      first_name: 'first_name',
      last_name: 'last_name',
      email: 'email',
      password: 'password',
    };
    const expectedUser: User = {
      id: mockUserId,
      first_name: 'first_name',
      last_name: 'last_name',
      email: 'email',
      password: mockHashedPassword,
      deleted_at: null,
    };

    mockV4.mockReturnValue(mockUserId);
    mockHash.mockResolvedValue(mockHashedPassword as never);
    repository.insert.mockResolvedValue(expectedUser);

    const result = await action.execute(createUserDto);

    expect(mockHash).toHaveBeenCalledWith(createUserDto.password, 10);
    expect(repository.insert).toHaveBeenCalledWith(
      expect.objectContaining(expectedUser),
    );
    expect(result).toEqual(expectedUser);
  });

  it('should propagate repository errors', async () => {
    const createUserDto: CreateUserDto = {
      first_name: 'first_name',
      last_name: 'last_name',
      email: 'email',
      password: 'password',
    };
    const emailError = new EmailAlreadyInUseException(createUserDto.email);

    repository.insert.mockRejectedValue(emailError);

    await expect(action.execute(createUserDto)).rejects.toThrow(
      EmailAlreadyInUseException,
    );
  });
});
