import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.model';
import { UsersController } from './controllers/users.controller';
import { UsersRepository } from './repositories/transactions.repository';
import { CreateUserAction } from './actions/create-user.action';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersRepository, CreateUserAction],
})
export class UsersModule {}
