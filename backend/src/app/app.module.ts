import { Module } from '@nestjs/common';
import { HttpModule } from './http/http.module';
import { TestsModule } from './tests/tests.module';
import { TemplateRunnerModule } from './template-runner/templateRunner.module';
import { InfraModule } from './infra.module';
import { MysqlModule } from './mysql/mysql.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { RunsModule } from './runs/runs.module';

@Module({
  imports: [
    InfraModule,
    MysqlModule,
    RabbitmqModule,
    HttpModule,
    TestsModule,
    RunsModule,
    TemplateRunnerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
