import { Module } from '@nestjs/common';
import { HttpModule } from './http/http.module';
import { TestsModule } from './tests/tests.module';
import { RunsModule } from './runs/runs.module';
import { TemplateRunnerModule } from './template-runner/templateRunner.module';
import { InfraModule } from './infra.module';
import { MysqlModule } from './mysql/mysql.module';

@Module({
  imports: [
    InfraModule,
    MysqlModule,
    HttpModule,
    TestsModule,
    RunsModule,
    TemplateRunnerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
