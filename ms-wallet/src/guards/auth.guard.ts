import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.substring(7);

    if (!token) throw new UnauthorizedException();

    try {
      request['user'] = await this.jwtService.verifyAsync(token);

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
