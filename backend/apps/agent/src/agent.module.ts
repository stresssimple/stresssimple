import {
  mySqlEntities,
  MysqlModule,
  RabbitmqModule,
} from '@infra/infrastructure';
import { InfraModule } from '@infra/infrastructure/infra.module';
import { Module } from '@nestjs/common';
import { TemplateRunnerModule } from './template-runner/templateRunner.module';
import { RunsModule } from './runs/runs.module';
import { AgentController } from './agent/agent.controller';
import { ProcessesAllocationEngine } from './runs/PesourcesAllocation.engine';
import { ProcessesService } from './process/process.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RunsManagementController } from './runs/RunsManagment.controller';
import { ProcessController } from './process/process.controller';
import { ServerController } from './server/server.controller';
import { TestEnvironmentService } from './TestEnvironment.service';
import { TestsService } from 'apps/application/src/app/tests/tests.service';
import { ProcessesManagementService } from './runs/ProcessExecutor.service';
import { RunnersManager } from './runs/runners.manager';
import { RunScheduler } from './runs/run.scheduler';

@Module({
  imports: [
    InfraModule,
    MysqlModule,
    RabbitmqModule,
    TemplateRunnerModule,
    RunsModule,
    TypeOrmModule.forFeature(mySqlEntities),
  ],
  controllers: [],
  providers: [
    ProcessesAllocationEngine,
    ProcessesService,
    ProcessesManagementService,
    ProcessController,
    AgentController,
    ServerController,
    TestsService,
    TestEnvironmentService,
    RunsManagementController,
    RunnersManager,
    RunScheduler,
  ],
})
export class AgentModule {}
