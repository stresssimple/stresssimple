import { Redis } from 'ioredis';
import { Global, Logger, Module } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

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
          port: 6379,
        });
      },
    },
  ],
  exports: [Logger, Redis],
})
export class InfraModule {}
