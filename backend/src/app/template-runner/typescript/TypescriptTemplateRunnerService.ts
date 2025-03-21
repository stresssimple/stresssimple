import * as os from 'os';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec, spawn } from 'child_process';
import { Logger } from '@nestjs/common';
import { AppLogsService } from '../../appLogs/AppLogsService';
import { TemplateRunnerService } from '../TemplateRunnerService';

const TEMPLATE_FOLDER = 'templates/typescript';

export class TypescriptTemplateRunnerService extends TemplateRunnerService {
  constructor(
    testId: string,
    runId: string,
    envPath: string,
    appLogger: AppLogsService,
    logger: Logger,
  ) {
    super(testId, runId, envPath, appLogger, logger, TEMPLATE_FOLDER);
  }

  public async packagesInstall(modules: string[]): Promise<boolean> {
    this.logger.log(`Installing modules ${modules.join(' ')}`);
    this.appLogger.info(this.runId, `Installing modules ${modules.join(' ')}`);
    let success = false;
    await new Promise<void>(async (resolve, reject) => {
      exec(
        `npm install ${modules.join(' ')}`,
        { cwd: this.envPath },
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

  public async compileTemplate(source: string): Promise<boolean> {
    let success = false;
    try {
      const testPath = path.join(this.envPath, 'src', 'test.ts');
      await fs.writeFile(testPath, source);

      await new Promise<void>((resolve, reject) => {
        this.logger.log(`Compiling template in ${this.envPath}`);
        exec(`tsc`, { cwd: this.envPath }, (error, stdout, stderr) => {
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

  public startRunner(): Promise<void> {
    this.appLogger.info(this.runId, `Starting runner`);

    const nodePath = os.platform() !== 'win32' ? '/usr/local/bin/node' : 'node';
    const runner = spawn(nodePath, ['dist/index.js', this.testId, this.runId], {
      cwd: this.envPath,
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
}
