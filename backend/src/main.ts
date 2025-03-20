import { Logger, ShutdownSignal } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { swaggerSetup } from './app/swagger';
import * as express from 'express';
import { AllExceptionsFilter } from './globalErrorHandler';
import { config } from 'dotenv';
import { spawn } from 'node:child_process';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(
    new AllExceptionsFilter(new Logger('GlobalErrorHandler')),
  );
  app.enableShutdownHooks([ShutdownSignal.SIGINT]);

  swaggerSetup(app);
  app.enableCors({
    allowedHeaders: '*',
    exposedHeaders: '*',
    origin: '*',
    credentials: false,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 200,
  });
  app.use(express.text());
  await app.listen(3000);
  Logger.log(`🚀 Application is running...`, 'Bootstrap');
}
config();

bootstrap();
