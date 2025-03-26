import {
  InfluxModule,
  AppLogsModule,
  TestExecution,
  AuditRecord,
  MysqlModule,
} from '@infra/infrastructure';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestsModule } from 'apps/application/src/app/tests/tests.module';
import { TemplateRunnerModule } from '../template-runner/templateRunner.module';
import { AuditWriter } from '../audit.writer';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MysqlModule,
    TestsModule,
    InfluxModule,
    TemplateRunnerModule,
    AppLogsModule,
    TypeOrmModule.forFeature([TestExecution, AuditRecord]),
  ],
  providers: [AuditWriter],
  controllers: [],
})
export class RunsModule {}
