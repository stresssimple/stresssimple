import { Module } from '@nestjs/common';
import { HttpModule } from './http/http.module';
import { TestsModule } from './tests/tests.module';
import { RunsModule } from './runs/runs.module';
import { TemplateRunnerModule } from './template-runner/templateRunner.module';
import { InfraModule } from './infra.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from './mysql/Test';
import { TestExecution } from './mysql/TestExecution';
import { LogRecord } from './mysql/LogRecord';
import { AuditRecord } from './mysql/AuditRecord';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env['MYSQL_HOST'] || 'localhost',
        port: process.env['MYSQL_PORT']
          ? parseInt(process.env['MYSQL_PORT'])
          : 3306,
        username: process.env['MYSQL_USER'],
        password: process.env['MYSQL_PASSWORD'],
        database: process.env['MYSQL_DATABASE'],
        entities: [Test, TestExecution, LogRecord, AuditRecord],
        synchronize: true,
      }),
    }),
    InfraModule,
    HttpModule,
    TestsModule,
    RunsModule,
    TemplateRunnerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
