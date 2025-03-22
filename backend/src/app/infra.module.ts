import { Redis } from 'ioredis';
import { Global, Logger, Module } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';

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
  ],
  exports: [Logger, Redis],
})
export class InfraModule {}
