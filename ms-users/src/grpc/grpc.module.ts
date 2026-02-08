import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WalletService } from './services/wallet.service';

@Module({
  imports: [
    ClientsModule.registerAsync({
      clients: [
        {
          name: 'WALLET_PACKAGE',
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            return {
              transport: Transport.GRPC,
              options: {
                package: 'wallet',
                protoPath: join(__dirname, './wallet.proto'),
                url: config.getOrThrow<string>('WALLET_GRPC_URL'),
                loader: { keepCase: true },
              },
            };
          },
        },
      ],
    }),
  ],
  providers: [WalletService],
  exports: [WalletService],
})
export class GRPCModule {}
