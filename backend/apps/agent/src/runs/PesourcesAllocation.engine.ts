import { Injectable, Logger } from '@nestjs/common';
import { PublishBus } from '@infra/infrastructure';
import { RunsService } from '@infra/infrastructure/mysql/runs.service';
import { ServersService } from '@infra/infrastructure/mysql/servers.service';
import { TestServer } from '@infra/infrastructure/mysql/Entities/Server';
import {
  AllocateProcessCommand,
  AllocateProcessesCommand,
  TestExecutionStatus,
} from '@dto/dto';
import { TestProcess } from '@infra/infrastructure/mysql/Entities/TestProcess';

@Injectable()
export class ProcessesAllocationEngine {
  constructor(
    private runsService: RunsService,
    private publish: PublishBus,
    private logger: Logger,
    private serversService: ServersService,
  ) {}

  public async requireProcesses(
    cmd: AllocateProcessesCommand,
  ): Promise<TestProcess[]> {
    const processes: TestProcess[] = [];
    let run = await this.runsService.getRun(cmd.runId);
    let servers: TestServer[] = await this.serversService.getServers();
    this.logger.log(
      'Allocating processes for run ' + run.id + ' status ' + run.status,
    );
    while (
      processes.length < run.processes &&
      run.status === TestExecutionStatus.waitingForSchedule
    ) {
      run = await this.runsService.getRun(run.id);
      if (run.status !== TestExecutionStatus.waitingForSchedule) {
        this.logger.log(
          'Run status changed, stopping process allocation ' + run.status,
        );
        break;
      }

      servers = await this.serversService.getServers();
      servers = servers.filter(
        (s) => s.type === 'agent' && s.processes.length < s.maxProcesses,
      );
      if (servers.length === 0) {
        this.logger.log('No servers available, waiting...');
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      this.logger.log(
        `Allocating processes for run ${run.id}, ${processes.length} allocated, ${servers.length} available servers`,
      );
      while (servers.length > 0 && processes.length < run.processes) {
        const server = servers.shift();
        try {
          const process = (await this.publish.executeCommand(
            new AllocateProcessCommand({
              runId: run.id,
              serverId: server.id,
              testId: run.testId,
            }),
          )) as TestProcess | null;
          if (!process) {
            this.logger.log('No process allocated on server ' + server.id);
            continue;
          }
          processes.push(process);
        } catch (e) {
          this.logger.warn('Failed to allocate process: ' + e.message);
        }
      }
    }
    return processes;
  }
}
