import * as os from 'os';
import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TestServer } from './Entities/Server';
import { In, LessThan, Not, Repository } from 'typeorm';
import { ProcessStatus } from '@dto/dto';

export const thisServer = new TestServer({
  name: os.hostname(),
  allocatedProcesses: 0,
  maxProcesses: os.cpus().length,
  lastHeartbeat: new Date(),
  startTimestamp: new Date(),
});

@Injectable()
export class ServersService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private interval: NodeJS.Timeout;

  constructor(
    @InjectRepository(TestServer)
    private readonly repository: Repository<TestServer>,
  ) {}

  public async getServers(): Promise<TestServer[]> {
    const servers = await this.repository.find({
      loadEagerRelations: true,
      where: {
        up: true,
      },
      relations: ['processes'],
    });
    servers.forEach((server) => {
      server.processes = server.processes.filter(
        (process) =>
          process.status !== ProcessStatus.ended &&
          process.status !== ProcessStatus.failed,
      );
    });
    return servers;
  }

  public async onApplicationShutdown(signal?: string) {
    console.log('ServersService destroyed ' + signal);
    clearInterval(this.interval);
    await this.repository.delete(thisServer);
  }

  public async onApplicationBootstrap() {
    this.interval = setInterval(async () => {
      thisServer.lastHeartbeat = new Date();
      thisServer.up = true;
      await this.repository.save(thisServer);
      const toDelete = await this.repository.find({
        where: {
          up: true,
          lastHeartbeat: LessThan(new Date(Date.now() - 3000)),
        },
      });
      toDelete.forEach(async (server) => {
        server.up = false;
        await this.repository.update({ id: server.id }, server);
      });
    }, 1000);
  }
}
