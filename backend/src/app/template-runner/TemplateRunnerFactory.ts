import { Injectable, Logger } from '@nestjs/common';
import { TemplateRunnerService } from './TemplateRunnerService';
import { AppLogsService } from '../appLogs/AppLogsService';

@Injectable()
export class TemplateRunnerSvcFactory {
  private services: Map<string, TemplateRunnerService> = new Map();

  constructor(
    private appLogsSvc: AppLogsService,
    private logger: Logger,
  ) {}
  getRunnerSvc(testId: string, runId: string): TemplateRunnerService {
    if (!this.services.has(testId + '-' + runId)) {
      this.logger.log(`Creating new TemplateRunnerService for runId: ${runId}`);

      this.appLogsSvc.info(
        runId,
        `Creating new TemplateRunnerService for runId: ${runId}`,
      );

      this.services.set(
        testId + '-' + runId,
        new TemplateRunnerService(testId, runId, this.appLogsSvc, this.logger),
      );
    } else {
      this.logger.log(
        `TemplateRunnerService already exists for runId: ${runId}`,
      );
    }
    return this.services.get(testId + '-' + runId);
  }
}
