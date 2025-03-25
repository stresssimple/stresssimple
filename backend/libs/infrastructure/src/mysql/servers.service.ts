import * as os from 'os';
import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServerRecord } from './Entities/Server';
import { LessThan, Repository } from 'typeorm';

export const thisServer = new ServerRecord({
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
    @InjectRepository(ServerRecord)
    private readonly repository: Repository<ServerRecord>,
  ) {}

  public async getServers(): Promise<ServerRecord[]> {
    return await this.repository.find();
  }

  public async onApplicationShutdown(signal?: string) {
    console.log('ServersService destroyed ' + signal);
    clearInterval(this.interval);
    await this.repository.delete(thisServer);
  }

  public async onApplicationBootstrap() {
    this.interval = setInterval(async () => {
      thisServer.lastHeartbeat = new Date();
      await this.repository.save(thisServer);
      const toDelete = await this.repository.find({
        where: {
          lastHeartbeat: LessThan(new Date(Date.now() - 3000)),
        },
      });
      toDelete.forEach(async (server) => {
        await this.repository.delete(server);
      });
    }, 1000);
  }
}
