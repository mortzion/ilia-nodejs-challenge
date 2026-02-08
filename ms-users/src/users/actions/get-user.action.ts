import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/transactions.repository';
import { NotFoundException } from '../exceptions/not-found.exception';

@Injectable()
export class GetUserAction {
  constructor(private repository: UsersRepository) {}

  async execute(id: string) {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
