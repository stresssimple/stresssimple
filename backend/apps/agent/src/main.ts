import { NestFactory } from '@nestjs/core';
import { AgentModule } from './agent.module';
import { config } from 'dotenv';
import { ShutdownSignal } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AgentModule);
  app.enableShutdownHooks([ShutdownSignal.SIGINT]);

  await app.init();
}
config();

bootstrap();
