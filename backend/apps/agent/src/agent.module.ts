import { MysqlModule, RabbitmqModule } from '@infra/infrastructure';
import { InfraModule } from '@infra/infrastructure/infra.module';
import { Module } from '@nestjs/common';
import { TemplateRunnerModule } from './template-runner/templateRunner.module';
import { RunsModule } from './runs/runs.module';

@Module({
  imports: [
    InfraModule,
    MysqlModule,
    RabbitmqModule,
    TemplateRunnerModule,
    RunsModule,
  ],
  controllers: [],
  providers: [],
})
export class AgentModule {}
