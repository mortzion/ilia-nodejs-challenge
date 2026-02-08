import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app
    .useGlobalPipes(new ValidationPipe())
    .connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: 'wallet',
        protoPath: join(__dirname, 'grpc/wallet.proto'),
        url: process.env.GRPC_URL,
        loader: { keepCase: true },
      },
    });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT!, '0.0.0.0');
}

void bootstrap();
