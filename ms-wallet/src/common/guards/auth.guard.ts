import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';

export interface JWTPayload {
  sub: string;
}

export interface FastifyRequestWithUser extends FastifyRequest {
  user?: JWTPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequestWithUser>();
    const token = request.headers.authorization?.substring(7);

    if (!token) throw new UnauthorizedException();

    try {
      const user = await this.jwtService.verifyAsync<JWTPayload>(token);

      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
