import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors({ methods: ['GET', 'POST', 'DELETE', 'PATCH'], origin: '*' });
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT!, '0.0.0.0');
}

void bootstrap();
