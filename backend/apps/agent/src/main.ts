import { NestFactory } from '@nestjs/core';
import { AgentModule } from './agent.module';
import { config } from 'dotenv';
import { ShutdownSignal } from '@nestjs/common';
import { thisServer } from '@infra/infrastructure/mysql/servers.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AgentModule);
  app.enableShutdownHooks([ShutdownSignal.SIGINT]);
  thisServer.type = 'agent';
  await app.init();
}
config();

bootstrap();
