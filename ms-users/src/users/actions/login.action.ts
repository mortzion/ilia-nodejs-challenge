import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UsersRepository } from 'src/users/repositories/transactions.repository';
import { LoginDto } from '../dtos/login.dto';
import { AccessTokenDto } from '../dtos/access-token.dto';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';

@Injectable()
export class LoginAction {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto) {
    const user = await this.usersRepository.findByEmail(dto.user.email);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await compare(dto.user.password, user.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const now = Math.floor(Date.now() / 1000);
    const durationInHours = Number(process.env.JWT_EXP_IN_HOURS ?? 1);
    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      iat: now,
      exp: now + durationInHours * 60 * 60,
    });

    return new AccessTokenDto(user, access_token);
  }
}
