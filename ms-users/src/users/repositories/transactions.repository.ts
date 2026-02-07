import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user.model';
import { EmailAlreadyInUseException } from '../exceptions/email-already-in-use.exception';

const UNIQUE_VIOLATION_CODE = '23505';
const EMAIL_UNIQUE_INDEX = 'users_email_idx';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async insert(user: User): Promise<User> {
    try {
      return await this.repository.save(user);
    } catch (error) {
      if (this.isEmailUniqueConstraintViolation(error)) {
        throw new EmailAlreadyInUseException(user.email);
      }

      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        password: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async update(user: User): Promise<User> {
    try {
      return await this.repository.save(user);
    } catch (error) {
      if (this.isEmailUniqueConstraintViolation(error)) {
        throw new EmailAlreadyInUseException(user.email);
      }

      throw error;
    }
  }

  private isEmailUniqueConstraintViolation(error: any): boolean {
    return (
      'code' in error &&
      error.code == UNIQUE_VIOLATION_CODE &&
      error.constraint == EMAIL_UNIQUE_INDEX
    );
  }
}
