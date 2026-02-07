import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/transactions.repository';

@Injectable()
export class DeleteUserAction {
  constructor(private repository: UsersRepository) {}

  async execute(id: string) {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('User not found');
    }
  }
}
