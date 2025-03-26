import { Global, Logger, Module, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

@Global()
@Module({
  providers: [
    {
      provide: Logger,
      useFactory: (context) => {
        return new Logger(context?.constructor?.name ?? 'General');
      },
      inject: [INQUIRER],
      scope: Scope.TRANSIENT,
    },
  ],
  exports: [Logger],
})
export class InfraModule {}
