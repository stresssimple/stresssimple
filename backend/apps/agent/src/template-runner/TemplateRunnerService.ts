import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import { Logger } from '@nestjs/common';
import { copyAsyncRecursive } from './fs.helpers';
import { AppLogsService } from '@infra/infrastructure';

export abstract class TemplateRunnerService {
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
    let created = false;
    if (!existsSync(this.envPath)) {
      created = true;
      await fs.mkdir(this.envPath, { recursive: true });
      this.appLogger.info(this.runId, `Created directory ${this.envPath}`);
    }

    await copyAsyncRecursive(this.templateFolder, this.envPath);
    this.appLogger.info(this.runId, `Copied template to ${this.envPath}`);
    return created;
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
