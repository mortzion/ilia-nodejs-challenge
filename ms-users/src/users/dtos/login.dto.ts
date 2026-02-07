import { IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UserCredentialsDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginDto {
  @ValidateNested()
  @Type(() => UserCredentialsDto)
  @IsNotEmpty()
  user: UserCredentialsDto;
}
