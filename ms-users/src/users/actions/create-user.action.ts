import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../models/user.model';
import { UsersRepository } from '../repositories/transactions.repository';
import { hash } from 'bcrypt';

@Injectable()
export class CreateUserAction {
  private static PASSWORD_HASH_SALT_ROUNDS = Number(
    process.env.PASSWORD_HASH_SALT_ROUNDS ?? '10',
  );

  constructor(private repository: UsersRepository) {}

  async execute(dto: CreateUserDto) {
    const user = new User();

    user.id = v4();
    user.first_name = dto.first_name;
    user.last_name = dto.last_name;
    user.email = dto.email;
    user.password = await hash(
      dto.password,
      CreateUserAction.PASSWORD_HASH_SALT_ROUNDS,
    );

    return this.repository.insert(user);
  }
}
