/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LoginAction } from './login.action';
import { UsersRepository } from '../repositories/transactions.repository';
import { LoginDto } from '../dtos/login.dto';
import { User } from '../models/user.model';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';
import { AccessTokenDto } from '../dtos/access-token.dto';

jest.mock('bcrypt');

import { compare } from 'bcrypt';

describe('LoginAction', () => {
  let action: LoginAction;
  let usersRepository: jest.Mocked<UsersRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockCompare = compare as jest.MockedFunction<typeof compare>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginAction,
        { provide: UsersRepository, useValue: { findByEmail: jest.fn() } },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
      ],
    }).compile();

    action = module.get<LoginAction>(LoginAction);
    usersRepository = module.get(UsersRepository);
    jwtService = module.get(JwtService);
    process.env.JWT_EXP_IN_HOUR = '1';

    jest.clearAllMocks();
  });

  it('should successfully authenticate with valid credentials', async () => {
    const loginDto: LoginDto = {
      user: { email: 'email', password: 'password' },
    };
    const mockUser: User = {
      id: 'uuid',
      first_name: 'first_name',
      last_name: 'last_name',
      email: 'email',
      password: 'hash',
      deleted_at: null,
    };
    const mockToken = 'jwt';

    usersRepository.findByEmail.mockResolvedValue(mockUser);
    mockCompare.mockResolvedValue(true as never);
    jwtService.signAsync.mockResolvedValue(mockToken);

    const result = await action.execute(loginDto);

    expect(usersRepository.findByEmail).toHaveBeenCalledWith(
      loginDto.user.email,
    );
    expect(mockCompare).toHaveBeenCalledWith(
      loginDto.user.password,
      mockUser.password,
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: mockUser.id, exp: expect.anything() }),
    );
    expect(result).toBeInstanceOf(AccessTokenDto);
    expect(result.user).toEqual(mockUser);
    expect(result.access_token).toBe(mockToken);
  });

  it('should throw InvalidCredentialsException when user not found', async () => {
    const loginDto: LoginDto = {
      user: { email: 'email', password: 'password' },
    };

    usersRepository.findByEmail.mockResolvedValue(null);

    await expect(action.execute(loginDto)).rejects.toThrow(
      InvalidCredentialsException,
    );
    expect(mockCompare).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should throw InvalidCredentialsException when password is invalid', async () => {
    const loginDto: LoginDto = {
      user: { email: 'email', password: 'password' },
    };
    const mockUser: User = {
      id: 'uuid',
      first_name: 'first_name',
      last_name: 'last_name',
      email: 'email',
      password: 'hash',
      deleted_at: null,
    };

    usersRepository.findByEmail.mockResolvedValue(mockUser);
    mockCompare.mockResolvedValue(false as never);

    await expect(action.execute(loginDto)).rejects.toThrow(
      InvalidCredentialsException,
    );
    expect(mockCompare).toHaveBeenCalledWith(
      loginDto.user.password,
      mockUser.password,
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should use JWT_EXP_IN_HOURS from environment', async () => {
    process.env.JWT_EXP_IN_HOURS = '24';
    const loginDto: LoginDto = {
      user: { email: 'email', password: 'password' },
    };
    const mockUser: User = {
      id: 'uuid',
      first_name: 'first_name',
      last_name: 'last_name',
      email: 'email',
      password: 'hash',
      deleted_at: null,
    };
    const now = 1234567890;

    jest.spyOn(Date, 'now').mockReturnValue(now * 1000);
    usersRepository.findByEmail.mockResolvedValue(mockUser);
    mockCompare.mockResolvedValue(true as never);
    jwtService.signAsync.mockResolvedValue('token');

    await action.execute(loginDto);

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: mockUser.id,
      iat: now,
      exp: now + Number(process.env.JWT_EXP_IN_HOURS) * 60 * 60,
    });
  });
});
