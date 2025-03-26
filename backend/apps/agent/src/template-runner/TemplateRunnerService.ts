import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import { Logger } from '@nestjs/common';
import { copyAsyncRecursive } from './fs.helpers';
import { AppLogsService } from '@infra/infrastructure';

export abstract class TemplateRunnerService {
  protected get environmentVars(): { [key: string]: string } {
    return {
      INFLUXDB_URL: process.env['INFLUXDB_URL'],
      INFLUXDB_TOKEN: process.env['INFLUXDB_TOKEN'],
      INFLUXDB_ORG: process.env['INFLUXDB_ORG'],
      INFLUXDB_BUCKET: process.env['INFLUXDB_BUCKET'],

      RABBITMQ_URI: process.env['RABBITMQ_URI'],
    };
  }

  constructor(
    protected readonly processId: string,
    protected readonly testId: string,
    protected readonly runId: string,
    protected readonly envPath: string,
    protected readonly appLogger: AppLogsService,
    protected readonly logger: Logger,
    protected readonly templateFolder: string,
  ) {}

  public async initDirectory(): Promise<boolean> {
    try {
      if (!existsSync(this.envPath)) {
        await fs.mkdir(this.envPath, { recursive: true });
        this.appLogger.info(
          this.runId,
          this.processId,
          `Created directory ${this.envPath}`,
        );
      }

      await copyAsyncRecursive(this.templateFolder, this.envPath);
      this.appLogger.info(
        this.runId,
        this.processId,
        `Copied template to ${this.envPath}`,
      );
    } catch (err) {
      this.appLogger.error(this.runId, this.processId, err.message);
      return false;
    }

    return true;
  }

  public abstract packagesInstall(modules: string[]): Promise<boolean>;
  public abstract compileTemplate(source: string): Promise<boolean>;
  public abstract startRunner(): Promise<void>;

  public async cleanup() {
    this.logger.log(`Cleaning up`);
    await fs.rm(this.envPath, { recursive: true });
    this.logger.log(`Deleted folder ${this.envPath}`);
  }
}
