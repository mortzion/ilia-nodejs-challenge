import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  NotFoundException as HttpNotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { UpdateUserDto } from 'src/users/dtos/update-user.dto';
import { CreateUserAction } from '../actions/create-user.action';
import { UpdateUserAction } from '../actions/update-user.action';
import { GetUserAction } from '../actions/get-user.action';
import { ListUsersAction } from '../actions/list-users.action';
import { DeleteUserAction } from '../actions/delete-user.action';
import { UserViewDto } from '../dtos/user-view.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUserId } from 'src/common/decorators/current-user.decorator';
import { EmailAlreadyInUseException } from '../exceptions/email-already-in-use.exception';
import { UserWithBalanceException } from '../exceptions/user-with-balance.exception';
import { NotFoundException } from '../exceptions/not-found.exception';

@Controller('users')
export class UsersController {
  constructor(
    private createUserAction: CreateUserAction,
    private updateUserAction: UpdateUserAction,
    private getUserAction: GetUserAction,
    private listUsersAction: ListUsersAction,
    private deleteUserAction: DeleteUserAction,
  ) {}

  @Public()
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    try {
      const user = await this.createUserAction.execute(dto);

      return new UserViewDto(
        user.id,
        user.first_name,
        user.last_name,
        user.email,
      );
    } catch (error) {
      if (error instanceof EmailAlreadyInUseException) {
        throw new BadRequestException(`Email ${error.email} is already in use`);
      }

      throw error;
    }
  }

  /**
   * I've added a check in the get, patch and delete endpoints to allow only reading/updating/deleting
   * the user associated with the JWT from the authentication. Otherwise a forbidden exception is thrown,
   * but this logic does not make sense for a list endpoint. This endpoint should only be accessible with
   * an admin access token or from another microservice, but this is not part of the scope of the project.
   * (also it should have a paginated result, but once again the specification was followed)
   */
  @Get()
  async listUsers() {
    const users = await this.listUsersAction.execute();

    return users.map(
      (user) =>
        new UserViewDto(user.id, user.first_name, user.last_name, user.email),
    );
  }

  @Get(':id')
  async getUser(
    @Param('id') id: string,
    @CurrentUserId() currentUserId: string,
  ) {
    try {
      if (id !== currentUserId) throw new ForbiddenException();

      const user = await this.getUserAction.execute(id);

      return new UserViewDto(
        user.id,
        user.first_name,
        user.last_name,
        user.email,
      );
    } catch (error) {
      if (error instanceof NotFoundException) throw new HttpNotFoundException();

      throw error;
    }
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @CurrentUserId() currentUserId: string,
    @Body() dto: UpdateUserDto,
  ) {
    if (id !== currentUserId) throw new ForbiddenException();

    try {
      const user = await this.updateUserAction.execute(id, dto);

      return new UserViewDto(
        user.id,
        user.first_name,
        user.last_name,
        user.email,
      );
    } catch (error) {
      if (error instanceof NotFoundException) throw new HttpNotFoundException();
      if (error instanceof EmailAlreadyInUseException) {
        throw new BadRequestException(`Email ${error.email} is already in use`);
      }

      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(
    @Param('id') id: string,
    @CurrentUserId() currentUserId: string,
  ) {
    if (id !== currentUserId) throw new ForbiddenException();

    try {
      await this.deleteUserAction.execute(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw new HttpNotFoundException();
      if (error instanceof UserWithBalanceException) {
        throw new ForbiddenException(
          `The user ${error.user_id} has a positive balance and cannot be deleted. Clear his wallet first`,
        );
      }

      throw error;
    }
  }
}
