import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from '../dtos/login.dto';
import { LoginAction } from '../actions/login.action';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { Public } from 'src/decorators/public.decorator';
import { UserViewDto } from '../dtos/user-view.dto';

@Controller('auth')
export class AuthController {
  constructor(private loginAction: LoginAction) {}

  @Public()
  @Post()
  async login(@Body() dto: LoginDto) {
    const { user, access_token } = await this.loginAction.execute(dto);
    const userView = new UserViewDto(
      user.id,
      user.first_name,
      user.last_name,
      user.email,
    );

    return new LoginResponseDto(userView, access_token);
  }
}
