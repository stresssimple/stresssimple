import { AllocateProcessCommand, ProcessStatus } from '@dto/dto';
import { thisServer } from '@infra/infrastructure/mysql/servers.service';
import { Controller, Logger } from '@nestjs/common';
import { TestsService } from 'apps/application/src/app/tests/tests.service';
import { TestEnvironmentService } from '../TestEnvironment.service';
import { ProcessesService } from '../process/process.service';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { TestProcess } from '@infra/infrastructure/mysql/Entities/TestProcess';

const allocateProcessCommand = new AllocateProcessCommand({
  serverId: thisServer.id,
});

@Controller()
export class ServerController {
  constructor(
    private readonly logger: Logger,
    private readonly envService: TestEnvironmentService,
    private readonly testsService: TestsService,
    private readonly processService: ProcessesService,
  ) {}

  @RabbitRPC({
    exchange: allocateProcessCommand.route,
    routingKey: allocateProcessCommand.routingKey,
    queue: AllocateProcessCommand.name + '.' + thisServer.id,
    queueOptions: { autoDelete: true },
  })
  async allocateProcess(
    data: AllocateProcessCommand,
  ): Promise<TestProcess | null> {
    this.logger.log('Allocating process for test ' + data.testId);
    await new Promise((r) => setTimeout(r, 1000));

    const proc = await this.processService.tryAllocateProcess(
      data.runId,
      data.testId,
    );
    if (!proc) {
      this.logger.log('No free processes available');
      return null;
    }
    const testDefinitions = await this.testsService.getTest(data.testId);
    const env = await this.envService.getFreeEnvironment(
      thisServer.id,
      data.runId,
      testDefinitions.language,
      testDefinitions.modules,
    );
    await this.processService.updateProcess(proc.id, {
      environmentId: env.id,
      status: ProcessStatus.ready,
    });
    return proc;
  }
}
