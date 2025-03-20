import { Injectable, Logger } from '@nestjs/common';
import { TypescriptTemplateRunnerService } from './TypescriptTemplateRunnerService';
import { AppLogsService } from '../appLogs/AppLogsService';
import { TemplateRunnerService } from './TemplateRunnerService';
import { PythonTemplateRunnerService } from './PythonTemplateRunnerService';

@Injectable()
export class TemplateRunnerSvcFactory {
  private services: Map<string, TemplateRunnerService> = new Map<
    string,
    TemplateRunnerService
  >();

  constructor(
    private appLogsSvc: AppLogsService,
    private logger: Logger,
  ) {}
  getRunnerSvc(
    testId: string,
    runId: string,
    language: string,
  ): TemplateRunnerService {
    if (!this.services.has(testId + '-' + runId)) {
      this.logger.log(`Creating new TemplateRunnerService for runId: ${runId}`);

      this.appLogsSvc.info(
        runId,
        `Creating new TemplateRunnerService for runId: ${runId}`,
      );
      if (language === 'typescript') {
        this.services.set(
          testId + '-' + runId,
          new TypescriptTemplateRunnerService(
            testId,
            runId,
            this.appLogsSvc,
            this.logger,
          ),
        );
      } else {
        this.services.set(
          testId + '-' + runId,
          new PythonTemplateRunnerService(
            testId,
            runId,
            this.appLogsSvc,
            this.logger,
          ),
        );
      }
    } else {
      this.logger.log(
        `TemplateRunnerService already exists for runId: ${runId}`,
      );
    }
    return this.services.get(testId + '-' + runId);
  }

  public removeRunnerSvc(testId: string, runId: string): void {
    this.logger.log(`Removing TemplateRunnerService for runId: ${runId}`);
    this.appLogsSvc.info(
      runId,
      `Removing TemplateRunnerService for runId: ${runId}`,
    );
    this.services.delete(testId + '-' + runId);
  }
}
