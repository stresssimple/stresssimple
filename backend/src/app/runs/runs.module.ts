import { Logger, Module } from '@nestjs/common';
import { TestsModule } from '../tests/tests.module';
import { RunsService } from './runs.service';
import { RunsController } from './runs.controller';
import { INQUIRER } from '@nestjs/core';
import { InfluxModule } from '../influxdb/influx.module';
import { RunScheduler } from './run.scheduler';
import { RunReportController } from './runReport.controller';
import { TemplateRunnerModule } from '../template-runner/templateRunner.module';
import { RunnersManager } from './runners.manager';
import { TestExecution } from '../mysql/TestExecution';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppLogsModule } from '../appLogs/AppLogs.module';
import { AuditWriter } from './audit.writer';
import { AuditRecord } from '../mysql/AuditRecord';

@Module({
  imports: [
    TestsModule,
    InfluxModule,
    TemplateRunnerModule,
    AppLogsModule,
    TypeOrmModule.forFeature([TestExecution, AuditRecord]),
  ],
  providers: [
    RunsService,
    RunnersManager,
    AuditWriter,
    RunScheduler,
    {
      provide: Logger,
      useFactory: (context) => new Logger(context),
      inject: [INQUIRER],
    },
  ],
  controllers: [RunsController, RunReportController],
})
export class RunsModule {}
