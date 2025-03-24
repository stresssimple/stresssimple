import { ServersService } from '@infra/infrastructure/servers.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Get('list/:serverType')
  public async getServerList(@Param('serverType') serverType?: string) {
    const servers = await this.serversService.getServers();
    if (serverType) {
      return servers.filter((server) => server.type === serverType);
    }
    return servers;
  }
}
