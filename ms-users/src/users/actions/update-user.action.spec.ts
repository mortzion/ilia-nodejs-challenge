/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserAction } from './update-user.action';
import { UsersRepository } from '../repositories/transactions.repository';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../models/user.model';
import { NotFoundException } from '../exceptions/not-found.exception';
import { EmailAlreadyInUseException } from '../exceptions/email-already-in-use.exception';

jest.mock('bcrypt');

import { hash } from 'bcrypt';

describe('UpdateUserAction', () => {
  let action: UpdateUserAction;
  let repository: jest.Mocked<UsersRepository>;

  const mockHash = hash as jest.MockedFunction<typeof hash>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserAction,
        {
          provide: UsersRepository,
          useValue: { findById: jest.fn(), update: jest.fn() },
        },
      ],
    }).compile();

    action = module.get<UpdateUserAction>(UpdateUserAction);
    repository = module.get(UsersRepository);

    jest.clearAllMocks();
  });

  it('should update user with all fields provided', async () => {
    const existingUser: User = {
      id: 'uuid',
      first_name: 'first_name',
      last_name: 'last_name',
      email: 'email',
      password: 'password',
      deleted_at: null,
    };
    const updateDto: UpdateUserDto = {
      first_name: 'new_first_name',
      last_name: 'new_last_name',
      email: 'new_email',
      password: 'newpassword',
    };
    const mockHashedPassword = 'hashnewpassword';
    const updatedUser: User = {
      id: existingUser.id,
      first_name: updateDto.first_name!,
      last_name: updateDto.last_name!,
      email: updateDto.email!,
      password: mockHashedPassword,
      deleted_at: null,
    };

    repository.findById.mockResolvedValue(existingUser);
    mockHash.mockResolvedValue(mockHashedPassword as never);
    repository.update.mockResolvedValue(updatedUser);

    const result = await action.execute(existingUser.id, updateDto);

    expect(repository.findById).toHaveBeenCalledWith(existingUser.id);
    expect(mockHash).toHaveBeenCalledWith(updateDto.password, 10);
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining(updatedUser),
    );
    expect(result).toEqual(updatedUser);
  });

  it('should update user with partial fields (only first_name)', async () => {
    const existingUser: User = {
      id: 'uuid',
      first_name: 'first_name',
      last_name: 'last_name',
      email: 'email',
      password: 'hash',
      deleted_at: null,
    };
    const updateDto: UpdateUserDto = {
      first_name: 'new_first_name',
    };
    const updatedUser: User = {
      ...existingUser,
      first_name: updateDto.first_name!,
    };

    repository.findById.mockResolvedValue(existingUser);
    repository.update.mockResolvedValue(updatedUser);

    const result = await action.execute(existingUser.id, updateDto);

    expect(repository.findById).toHaveBeenCalledWith(existingUser.id);
    expect(mockHash).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining(updatedUser),
    );
    expect(result).toEqual(updatedUser);
  });

  it('should throw NotFoundException when user not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(action.execute('uuid', {})).rejects.toThrow(NotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should propagate repository errors', async () => {
    const existingUser: User = {
      id: 'uuid',
      first_name: 'first_name',
      last_name: 'last_name',
      email: 'email',
      password: 'hash',
      deleted_at: null,
    };
    const updateDto: UpdateUserDto = {
      email: 'email',
    };
    const emailError = new EmailAlreadyInUseException('existing@example.com');

    repository.findById.mockResolvedValue(existingUser);
    repository.update.mockRejectedValue(emailError);

    await expect(action.execute(existingUser.id, updateDto)).rejects.toThrow(
      EmailAlreadyInUseException,
    );
  });
});
