import { Logger, Module } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { TemplateRunnerSvcFactory } from './TemplateRunnerFactory';
import { AppLogsModule } from '../appLogs/AppLogs.module';

@Module({
  imports: [AppLogsModule],
  providers: [
    TemplateRunnerSvcFactory,
    {
      provide: Logger,
      useFactory: (context) => new Logger(context),
      inject: [INQUIRER],
    },
  ],
  exports: [TemplateRunnerSvcFactory],
})
export class TemplateRunnerModule {}
