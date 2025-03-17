import { Injectable, Logger } from '@nestjs/common';
import { TemplateRunnerService } from './TemplateRunnerService';
import pino from 'pino';
import { RunsService } from '../runs/runs.service';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class TemplateRunnerSvcFactory {
  private services: Map<string, TemplateRunnerService> = new Map();

  constructor(private logger: Logger) {}
  getRunnerSvc(
    testId: string,
    runId: string,
    runFolder: string,
  ): TemplateRunnerService {
    if (!this.services.has(testId + '-' + runId)) {
      this.logger.log(`Creating new TemplateRunnerService for runId: ${runId}`);
      if (!existsSync(runFolder)) {
        this.logger.log(`Creating folder: ${runFolder}`);
        mkdirSync(runFolder, { recursive: true });
      }
      const appLogger = pino(
        pino.destination({
          dest: `${runFolder}/app.log`,
          sync: false,
          periodicFlush: true,
          flushInterval: 1000,
        }),
      );
      appLogger.info(`Creating new TemplateRunnerService for runId: ${runId}`);
      appLogger.info(`Run folder: ${runFolder}`);
      this.services.set(
        testId + '-' + runId,
        new TemplateRunnerService(testId, runId, appLogger, this.logger),
      );
    } else {
      this.logger.log(
        `TemplateRunnerService already exists for runId: ${runId}`,
      );
    }

    return this.services.get(testId + '-' + runId);
  }
}
