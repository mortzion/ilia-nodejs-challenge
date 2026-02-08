import { Metadata } from '@grpc/grpc-js';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

/**
 * I've added a simple static token for the gRPC authentication due
 * to time constraint. Ideally I would use mTLS/SSL authentication.
 */
@Injectable()
export class GRPCGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const metadata = context.getArgByIndex<Metadata>(1);

    return (
      metadata instanceof Metadata &&
      metadata.get('authorization').includes(process.env.INTERNAL_TOKEN!)
    );
  }
}
