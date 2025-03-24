import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('servers')
@ApiTags('Servers')
export class ServersController {}
