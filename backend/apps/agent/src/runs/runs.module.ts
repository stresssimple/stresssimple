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
import { AuditWriter } from '../audit.writer';

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
    AuditWriter,
    {
      provide: Logger,
      useFactory: (context) => new Logger(context),
      inject: [INQUIRER],
    },
  ],
  controllers: [],
})
export class RunsModule {}
