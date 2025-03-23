import { Logger, Module } from '@nestjs/common';
import { TestsModule } from '../tests/tests.module';
import { RunsService } from './api/runs.service';
import { RunsController } from './api/runs.controller';
import { INQUIRER } from '@nestjs/core';
import { InfluxModule } from '../influxdb/influx.module';
import { RunScheduler } from './run.scheduler';
import { RunReportController } from '../influxdb/runReport.controller';
import { TemplateRunnerModule } from '../template-runner/templateRunner.module';
import { RunnersManager } from './runners.manager';
import { TestExecution } from '../mysql/Entities/TestExecution';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppLogsModule } from '../appLogs/AppLogs.module';
import { AuditWriter } from './audit.writer';
import { AuditRecord } from '../mysql/Entities/AuditRecord';
import { ProcessManagementService } from './process/ProcessManagement.service';
import { ServersController } from './process/ProcessManagement.controller';
import { RunsManagementController } from './RunsManagment.controller';
import { ServersObserver } from './process/ServersObserver';

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
    ProcessManagementService,
    ServersObserver,
    RunsManagementController,
    RunScheduler,
    {
      provide: Logger,
      useFactory: (context) => new Logger(context),
      inject: [INQUIRER],
    },
  ],
  controllers: [RunsController, RunReportController, ServersController],
})
export class RunsModule {}
