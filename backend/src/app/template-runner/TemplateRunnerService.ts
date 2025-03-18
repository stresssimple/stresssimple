import { exec, spawn } from 'child_process';
import * as fs from 'fs/promises';
import { existsSync, rmSync } from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { copyAsyncRecursive } from './fs.helpers';
import { cwd } from 'process';
import { AppLogsService } from '../appLogs/AppLogsService';

const TEMPLATE_FOLDER = 'templates/runner';

export class TemplateRunnerService {
  private readonly RUNNER_TEMPLATE_FOLDER =
    process.env['RUNNER_TEMPLATE_FOLDER']; // 'C:\\tmp\\templates';
  private initDirRun = false;
  constructor(
    private readonly testId: string,
    private readonly runId: string,
    public readonly appLogger: AppLogsService,
    private readonly logger: Logger,
  ) {
    const folder = path.join(
      this.RUNNER_TEMPLATE_FOLDER,
      this.testId,
      this.runId,
    );
    if (existsSync(folder)) {
      logger.log(`Folder ${folder} already exists. deleting it`);
      appLogger.info(
        this.runId,
        `Folder ${folder} already exists. deleting it`,
      );
      rmSync(folder, { recursive: true });
    }
  }

  public async initDirectory(): Promise<void> {
    const folder = path.join(
      this.RUNNER_TEMPLATE_FOLDER,
      this.testId,
      this.runId,
    );
    await fs.mkdir(folder, { recursive: true });
    this.appLogger.info(this.runId, `Created directory ${folder}`);
    copyAsyncRecursive(TEMPLATE_FOLDER, folder);
    this.appLogger.info(this.runId, `Copied template to ${folder}`);
    this.initDirRun = true;
  }

  public async compileTemplate(source: string): Promise<boolean> {
    if (!this.initDirRun) {
      await this.initDirectory();
    }
    let success = false;
    const templateFolder = path.join(
      this.RUNNER_TEMPLATE_FOLDER,
      this.testId,
      this.runId,
    );
    try {
      const testPath = path.join(templateFolder, 'src', 'test.ts');
      await fs.writeFile(testPath, source);

      await new Promise<void>((resolve, reject) => {
        this.logger.log(`Compiling template in ${templateFolder}`);
        exec(`tsc`, { cwd: templateFolder }, (error, stdout, stderr) => {
          if (error) {
            this.logger.error(`Error compiling template`);
            this.logger.error('STDOUT\n' + stdout.substring(0, 1000));
            this.logger.error(stderr);
            this.appLogger.error(this.runId, `Error compiling template`);
            this.appLogger.error(this.runId, 'STDOUT\n' + stdout);
            this.appLogger.error(this.runId, stderr.substring(0, 1000));
            reject(error);
          } else {
            this.logger.log(`Template compiled`);
            this.appLogger.info(this.runId, `Template compiled`);
            resolve();
            success = true;
          }
        });
      });
    } catch (error) {
      this.appLogger.error(this.runId, `Error compiling template`);
      this.appLogger.error(this.runId, error.toString());
      this.logger.error(`Error compiling template`, error);
    }
    return success;
  }

  public async npmInstall(modules: string[]): Promise<boolean> {
    this.logger.log(`Installing modules ${modules.join(' ')}`);
    this.appLogger.info(this.runId, `Installing modules ${modules.join(' ')}`);
    if (!this.initDirRun) {
      await this.initDirectory();
    }
    let success = false;
    const templateFolder = path.join(
      this.RUNNER_TEMPLATE_FOLDER,
      this.testId,
      this.runId,
    );
    await new Promise<void>((resolve, reject) => {
      exec(
        `npm install ${modules.join(' ')}`,
        { cwd: templateFolder },
        (error, stdout, stderr) => {
          if (error) {
            console.log('error', error, stdout, stderr);
            this.logger.error(`Error installing module ${module}`, error);
            if (stdout) {
              this.appLogger.info(this.runId, stdout);
            }
            if (stderr) {
              this.appLogger.error(this.runId, stderr);
            }
            reject(error);
          } else {
            this.appLogger.info(this.runId, stdout);
            this.appLogger.info(
              this.runId,
              `Modules installed ${modules.join(' ')}`,
            );

            resolve();
            success = true;
          }
        },
      );
    });
    return success;
  }

  public dispose(): void {
    const folder = path.join(
      this.RUNNER_TEMPLATE_FOLDER,
      this.testId,
      this.runId,
    );
    rmSync(folder, { recursive: true });
    this.logger.log(`Deleted folder ${folder}`);
  }

  public startRunner(): Promise<void> {
    this.appLogger.info(this.runId, `Starting runner`);
    const folder = path.join(
      this.RUNNER_TEMPLATE_FOLDER,
      this.testId,
      this.runId,
    );
    const nodePath = process.env['CONTAINER'] ? '/usr/local/bin/node' : 'node';
    const runner = spawn(nodePath, ['dist/index.js', this.testId, this.runId], {
      cwd: folder,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        INFLUXDB_URL: process.env['INFLUXDB_URL'],
        INFLUXDB_TOKEN: process.env['INFLUXDB_TOKEN'],
        INFLUXDB_ORG: process.env['INFLUXDB_ORG'],
        INFLUXDB_BUCKET: process.env['INFLUXDB_BUCKET'],
        REDIS_HOST: process.env['REDIS_HOST'],
        REDIS_PORT: process.env['REDIS_PORT'],
      },
    });

    runner.stdout?.on('data', async (data) => {
      await this.appLogger.info(this.runId, data.toString());
    });
    runner.stderr?.on('data', async (data) => {
      await this.appLogger.error(this.runId, data.toString());
    });

    return new Promise<void>((resolve) => {
      runner.on('close', (code) => {
        this.logger.log(`Runner exited with code ${code}`);
        this.appLogger.info(this.runId, `Runner exited with code ${code}`);
        resolve();
      });
    });
  }

  public async cleanup() {
    this.logger.log(`Cleaning up`);
    this.appLogger.info(this.runId, `Cleaning up`);
    const folder = path.join(
      this.RUNNER_TEMPLATE_FOLDER,
      this.testId,
      this.runId,
    );
    await fs.rm(folder, { recursive: true });
    this.logger.log(`Deleted folder ${folder}`);
  }
}
