import { Logger, Module } from '@nestjs/common';
import { TestsModule } from '../tests/tests.module';
import { RunsService } from './runs.service';
import { RunsController } from './runs.controller';
import { INQUIRER } from '@nestjs/core';
import { InfluxModule } from '../influxdb/influx.module';
import { RunScheduler } from './run.scheduler';
import { RunReportController } from './runReport.controller';
import { TemplateRunnerModule } from '../template-runner/templateRunner.module';
import { TemplateRunnerController } from './templateRunner.controller';
import { RunnersManager } from './runners.manager';

@Module({
  imports: [TestsModule, InfluxModule, TemplateRunnerModule],
  providers: [
    RunsService,
    RunnersManager,
    TemplateRunnerController,
    RunScheduler,
    {
      provide: Logger,
      useFactory: (context) => new Logger(context),
      inject: [INQUIRER],
    },
  ],
  controllers: [RunsController, RunReportController, TemplateRunnerController],
})
export class RunsModule {}
