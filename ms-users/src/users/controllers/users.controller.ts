import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { CreateUserAction } from '../actions/create-user.action';
import { UserViewDto } from '../dtos/user-view.dto';
import { Public } from 'src/decorators/public.decorator';
import { EmailAlreadyInUseException } from '../exceptions/email-already-in-use.exception';

@Controller('users')
export class UsersController {
  constructor(private createUserAction: CreateUserAction) {}

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
}
