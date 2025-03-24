import { Redis } from 'ioredis';
import { Global, Logger, Module } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { ServersService } from './servers.service';

@Global()
@Module({
  providers: [
    {
      provide: Logger,
      useFactory: (context) => new Logger(context),
      inject: [INQUIRER],
    },
    {
      provide: Redis,
      useFactory: () => {
        return new Redis({
          host: process.env['REDIS_HOST'] || 'localhost',
          port: Number.parseInt(process.env['REDIS_PORT']),
        });
      },
    },
    ServersService,
  ],
  exports: [Logger, Redis, ServersService],
})
export class InfraModule {}
