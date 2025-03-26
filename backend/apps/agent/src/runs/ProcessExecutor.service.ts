import * as os from 'os';
import { Injectable, Logger } from '@nestjs/common';
import { PublishBus } from '@infra/infrastructure';
import { RunsService } from '@infra/infrastructure/mysql/runs.service';
import { TestsService } from 'apps/application/src/app/tests/tests.service';
import { TemplateRunnerSvcFactory } from '../template-runner/TemplateRunnerFactory';
import { thisServer } from '@infra/infrastructure/mysql/servers.service';
import { TestEnvironmentService } from '../TestEnvironment.service';
import { ProcessesService } from '../process/process.service';
import { ProcessStatus } from '@dto/dto';

@Injectable()
export class ProcessesManagementService {
  interval: NodeJS.Timeout;
  maxProcesses: number;
  startTime: Date = new Date();

  constructor(
    private readonly envService: TestEnvironmentService,
    private readonly testsService: TestsService,
    private readonly runsService: RunsService,
    private readonly publisher: PublishBus,
    private readonly processesService: ProcessesService,
    private readonly factory: TemplateRunnerSvcFactory,
    private readonly logger: Logger,
  ) {
    this.maxProcesses = parseInt(
      process.env.MAX_PROCESSES ?? os.cpus().length.toString(),
    );
    thisServer.maxProcesses = this.maxProcesses;
    thisServer.allocatedProcesses = 0;
  }

  public async runProcess(data: {
    payload: {
      processId: string;
      testId: string;
      runId: string;
      source: string;
    };
  }): Promise<boolean> {
    const r = data.payload;
    const proc = await this.processesService.getProcess(r.processId);
    const run = await this.runsService.getRun(proc.runId);
    this.logger.log('Initializing directory.');
    const env = await this.envService.getEnvironmentById(proc.environmentId);
    const test = await this.testsService.getTest(r.testId);
    const templateRunner = await this.factory.getRunnerSvc(
      proc.id,
      run.testId,
      env.runId,
      env.id,
      test.language,
    );

    const init = await templateRunner.initDirectory();
    if (!init) {
      this.logger.error('Failed to initialize directory.');
      this.factory.removeRunnerSvc(proc.environmentId);
      await this.envService.setEnvironmentFree(proc.environmentId);
      return false;
    }

    const packageInstaller = await templateRunner.packagesInstall(test.modules);
    if (!packageInstaller) {
      this.logger.error('Failed to install packages.');
      this.factory.removeRunnerSvc(proc.environmentId);
      await this.envService.setEnvironmentFree(proc.environmentId);
      return false;
    }

    const compile = await templateRunner.compileTemplate(r.source);
    if (!compile) {
      this.logger.error('Failed to compile source.');
      this.factory.removeRunnerSvc(proc.environmentId);
      await this.envService.setEnvironmentFree(proc.environmentId);
      return false;
    }

    const runner = templateRunner.startRunner().catch((e) => {
      this.logger.error('Failed to start runner.');
      this.logger.error(e);
    });
    if (!runner) {
      this.logger.error('Failed to start runner.');
      this.factory.removeRunnerSvc(proc.environmentId);
      await this.envService.setEnvironmentFree(proc.environmentId);
      return false;
    }

    runner.finally(async () => {
      this.factory.removeRunnerSvc(proc.environmentId);
      await this.envService.setEnvironmentFree(proc.environmentId);
      this.logger.log('Process ended!!!!!');

      await this.publisher.publishAsync({
        route: 'run',
        routingKey: 'runnerStopped',
        processId: r.processId,
        testId: r.testId,
        runId: r.runId,
      });
      await this.processesService.updateProcess(r.processId, {
        status: ProcessStatus.ended,
      });
    });
    return true;
  }
}
