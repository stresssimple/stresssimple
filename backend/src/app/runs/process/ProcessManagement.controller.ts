import { Controller, Get } from '@nestjs/common';
import { ServerRecord } from './ProcessManagement.service';
import { ApiTags } from '@nestjs/swagger';
import { ServersObserver } from './ServersObserver';

@Controller('servers')
@ApiTags('Servers')
export class ServersController {
  constructor(private readonly serversService: ServersObserver) {}

  @Get('')
  public async listServers(): Promise<ServerRecord[]> {
    return this.serversService.listServers();
  }
}
