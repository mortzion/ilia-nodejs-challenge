import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { UpdateUserDto } from 'src/users/dtos/update-user.dto';
import { CreateUserAction } from '../actions/create-user.action';
import { UpdateUserAction } from '../actions/update-user.action';
import { UserViewDto } from '../dtos/user-view.dto';
import { Public } from 'src/decorators/public.decorator';
import { CurrentUserId } from 'src/decorators/current-user.decorator';
import { EmailAlreadyInUseException } from '../exceptions/email-already-in-use.exception';

@Controller('users')
export class UsersController {
  constructor(
    private createUserAction: CreateUserAction,
    private updateUserAction: UpdateUserAction,
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
      if (error instanceof EmailAlreadyInUseException) {
        throw new BadRequestException(`Email ${error.email} is already in use`);
      }

      throw error;
    }
  }
}
