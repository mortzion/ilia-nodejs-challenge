import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/transactions.repository';

@Injectable()
export class ListUsersAction {
  constructor(private repository: UsersRepository) {}

  async execute() {
    return this.repository.findAll();
  }
}
