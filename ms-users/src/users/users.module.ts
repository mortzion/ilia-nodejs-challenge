import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.model';
import { UsersController } from './controllers/users.controller';
import { AuthController } from './controllers/auth.controller';
import { UsersRepository } from './repositories/transactions.repository';
import { CreateUserAction } from './actions/create-user.action';
import { GetUserAction } from './actions/get-user.action';
import { ListUsersAction } from './actions/list-users.action';
import { UpdateUserAction } from './actions/update-user.action';
import { DeleteUserAction } from './actions/delete-user.action';
import { LoginAction } from './actions/login.action';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, AuthController],
  providers: [
    UsersRepository,
    CreateUserAction,
    GetUserAction,
    ListUsersAction,
    UpdateUserAction,
    DeleteUserAction,
    LoginAction,
  ],
})
export class UsersModule {}
