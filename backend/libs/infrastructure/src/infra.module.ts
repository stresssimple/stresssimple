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
  ],
  exports: [Logger],
})
export class InfraModule {}
