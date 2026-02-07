import { UserViewDto } from './user-view.dto';

export class LoginResponseDto {
  constructor(
    public user: UserViewDto,
    public access_token: string,
  ) {}
}
