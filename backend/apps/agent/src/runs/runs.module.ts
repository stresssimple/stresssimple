import { ProcessManagementService } from './process/ProcessManagement.service';
import { ServersController } from '../../../application/src/app/api/ProcessManagement.controller';
import { RunsManagementController } from './RunsManagment.controller';
import { RunsController } from 'apps/application/src/app/api/runs.controller';
import { RunScheduler } from './run.scheduler';
import {
  InfluxModule,
  AppLogsModule,
  TestExecution,
  AuditRecord,
  MysqlModule,
} from '@infra/infrastructure';
import { RunsService } from '@infra/infrastructure/mysql/runs.service';
import { Logger, Module } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestsModule } from 'apps/application/src/app/tests/tests.module';
import { TemplateRunnerModule } from '../template-runner/templateRunner.module';
import { AuditWriter } from './audit.writer';
import { RunnersManager } from './runners.manager';

@Module({
  imports: [
    MysqlModule,
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
    RunsManagementController,
    RunScheduler,
    {
      provide: Logger,
      useFactory: (context) => new Logger(context),
      inject: [INQUIRER],
    },
  ],
  controllers: [],
})
export class RunsModule {}
