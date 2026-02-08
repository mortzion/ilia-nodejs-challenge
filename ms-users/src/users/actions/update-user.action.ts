import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UsersRepository } from '../repositories/transactions.repository';
import { NotFoundException } from '../exceptions/not-found.exception';

/**
 * The ms-users.yaml uses the PATCH verb for the endpoint but has all fields as required. To
 * keep the spirit of the PATCH verb all fields in the endpoint were changed to be optional.
 * Also the ms-users.yaml allows the user to change the email of the account, which is unusual
 * but was kept.
 */
@Injectable()
export class UpdateUserAction {
  private static PASSWORD_HASH_SALT_ROUNDS = Number(
    process.env.PASSWORD_HASH_SALT_ROUNDS ?? '10',
  );

  constructor(private repository: UsersRepository) {}

  async execute(id: string, dto: UpdateUserDto) {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.first_name !== undefined) user.first_name = dto.first_name;
    if (dto.last_name !== undefined) user.last_name = dto.last_name;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.password !== undefined) {
      user.password = await hash(
        dto.password,
        UpdateUserAction.PASSWORD_HASH_SALT_ROUNDS,
      );
    }

    return this.repository.update(user);
  }
}
