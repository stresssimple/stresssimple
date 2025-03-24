import { NestFactory } from '@nestjs/core';
import { AgentModule } from './agent.module';
import { config } from 'dotenv';
import { ShutdownSignal } from '@nestjs/common';
import { ServerInstance } from '@infra/infrastructure/servers.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AgentModule);
  app.enableShutdownHooks([ShutdownSignal.SIGINT]);

  await app.init();
}
config();
ServerInstance.instance.setType('agent');

bootstrap();
