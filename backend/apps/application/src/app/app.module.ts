import {
  AppLogsModule,
  InfluxModule,
  MysqlModule,
  RabbitmqModule,
} from '@infra/infrastructure';
import { InfraModule } from '@infra/infrastructure/infra.module';
import { Module } from '@nestjs/common';
import { TestsModule } from './tests/tests.module';
import { HttpModule } from './http/http.module';
import { RunsController } from './api/runs.controller';
import { RunReportController } from './api/runReport.controller';
import { AuditController } from './api/Audit.controller';

@Module({
  imports: [
    InfraModule,
    InfluxModule,
    MysqlModule,
    AppLogsModule,
    RabbitmqModule,
    HttpModule,
    TestsModule,
  ],
  controllers: [RunsController, RunReportController, AuditController],
  providers: [],
})
export class AppModule {}
