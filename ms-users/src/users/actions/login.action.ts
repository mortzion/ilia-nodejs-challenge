import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UsersRepository } from 'src/users/repositories/transactions.repository';
import { LoginDto } from '../dtos/login.dto';
import { AccessTokenDto } from '../dtos/access-token.dto';

@Injectable()
export class LoginAction {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto) {
    const user = await this.usersRepository.findByEmail(dto.user.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(dto.user.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return new AccessTokenDto(user, access_token);
  }
}
