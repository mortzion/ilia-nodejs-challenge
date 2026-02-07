import { User } from '../models/user.model';

export class AccessTokenDto {
  constructor(
    public user: User,
    public access_token: string,
  ) {}
}
