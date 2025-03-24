import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';
import * as os from 'os';
import { generateId } from './utils';

export class ServerInstance {
  public setType(serverType: string) {
    this.type = serverType;
  }
  public type: string = 'default';
  public serverName = os.hostname();
  public serverId = generateId();
  public startTime = new Date();
  public status = 'running';

  public properties: { [key: string]: any } = {};

  private static _instance?: ServerInstance;

  private constructor() {}

  public static get instance() {
    return this._instance || (this._instance = new ServerInstance());
  }
}

@Injectable()
export class ServersService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private interval: NodeJS.Timeout;
  private readonly serverType: string;
  private readonly serverKey: string;

  constructor(private readonly redis: Redis) {
    console.log('ServersService created');
    this.serverType = process.env['SERVER_TYPE'] || 'default';
    ServerInstance.instance.setType(this.serverType);
    this.serverKey = `servers:${this.serverType}:${ServerInstance.instance.serverId}`;
  }

  public async getServers(): Promise<ServerInstance[]> {
    const keys = await this.redis.keys('servers:*');
    const servers = await this.redis.mget(...keys);
    return servers.map((server) => JSON.parse(server));
  }

  public onApplicationShutdown(signal?: string) {
    console.log('ServersService destroyed ' + signal);
    clearInterval(this.interval);
    this.redis.del(this.serverKey);
    this.redis.quit();
  }
  public onApplicationBootstrap() {
    this.interval = setInterval(() => {
      this.redis.set(this.serverKey, JSON.stringify(ServerInstance.instance));
      this.redis.expire(this.serverKey, 3);
    }, 1000);
  }
}
