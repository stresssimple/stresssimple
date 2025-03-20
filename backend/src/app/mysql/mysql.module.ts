import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditRecord } from './Entities/AuditRecord';
import { LogRecord } from './Entities/LogRecord';
import { Test } from './Entities/Test';
import { TestEnvironment } from './Entities/TestEnvironment';
import { TestExecution } from './Entities/TestExecution';
import { TestEnvironmentService } from './TestEnvironment.service';
const mySqlEntities = [
  Test,
  TestExecution,
  LogRecord,
  AuditRecord,
  TestEnvironment,
];

@Global()
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
        entities: mySqlEntities,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature(mySqlEntities),
  ],
  providers: [TestEnvironmentService],
  exports: [TestEnvironmentService],
})
export class MysqlModule {}
