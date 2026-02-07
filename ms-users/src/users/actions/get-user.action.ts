import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/transactions.repository';

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
