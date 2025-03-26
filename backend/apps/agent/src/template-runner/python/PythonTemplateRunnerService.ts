import * as os from 'os';
import { exec, spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { TemplateRunnerService } from '../TemplateRunnerService';
import { AppLogsService } from '@infra/infrastructure';
import { time } from 'console';

const TEMPLATE_FOLDER = 'templates/python';

export class PythonTemplateRunnerService extends TemplateRunnerService {
  constructor(
    processId: string,
    testId: string,
    runId: string,
    envPath: string,
    appLogger: AppLogsService,
    logger: Logger,
  ) {
    super(
      processId,
      testId,
      runId,
      envPath,
      appLogger,
      logger,
      TEMPLATE_FOLDER,
    );
  }

  public async compileTemplate(source: string): Promise<boolean> {
    const success = true;
    try {
      const testPath = path.join(this.envPath, 'src', 'test.py');
      await fs.writeFile(testPath, source);
    } catch (error) {
      this.appLogger.error(
        this.runId,
        this.processId,
        `Error compiling template`,
      );
      this.appLogger.error(this.runId, this.processId, error.toString());
      this.logger.error(`Error compiling template`, error);
    }
    return success;
  }

  public async packagesInstall(modules: string[]): Promise<boolean> {
    this.logger.log(`Installing modules ${modules.join(' ')}`);
    this.appLogger.info(
      this.runId,
      this.processId,
      `Installing modules ${modules.join(' ')}`,
    );
    let success = false;
    await new Promise<void>((resolve, reject) => {
      const activateCommand = this.activateCommand();

      let cmd: string;
      const platform = os.platform();
      if (platform === 'win32') {
        const commands = [
          'python -m venv venv',
          activateCommand,
          'pip install -r requirements.txt',
        ];
        if (modules.length > 0) {
          commands.push(`pip install ${modules.join(' ')}`);
        }
        cmd = commands.join(' && ');
      } else {
        const commands = [
          'python3 -m venv venv',
          activateCommand,
          'pip install -r requirements.txt',
        ];
        if (modules.length > 0) {
          commands.push(`pip install ${modules.join(' ')}`);
        }
        cmd = `bash -c '${commands.join(' && ')}'`;
      }

      exec(cmd, { cwd: this.envPath }, (error, stdout, stderr) => {
        if (error) {
          console.log('error', error, stdout, stderr);
          this.logger.error(`Error installing module ${module}`, error);
          if (stdout) {
            this.appLogger.info(this.runId, this.processId, stdout);
          }
          if (stderr) {
            this.appLogger.error(this.runId, this.processId, stderr);
          }
          reject(error);
        } else {
          this.appLogger.info(this.runId, this.processId, stdout);
          this.appLogger.info(
            this.runId,
            this.processId,
            `Modules installed ${modules.join(' ')}`,
          );

          resolve();
          success = true;
        }
      });
    });
    return success;
  }

  public startRunner(): Promise<void> {
    this.appLogger.info(this.runId, this.processId, `Starting runner`);

    try {
      let cmd: string;
      let args: string[];
      const platform = os.platform();
      if (platform === 'win32') {
        cmd = 'cmd.exe';
        args = [
          '/c',
          `1.bat ${this.processId} ${this.testId} ${this.runId} && exit`,
        ];
      } else {
        cmd = 'bash';
        args = [
          '-c',
          `'1.sh ${this.processId} ${this.testId} ${this.runId}' && exit`,
        ];
      }

      const runner = spawn(cmd, args, {
        cwd: this.envPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
        windowsHide: false,
        env: this.environmentVars,
      });

      runner.stdout?.on('data', async (data) => {
        await this.appLogger.info(this.runId, this.processId, data.toString());
      });
      runner.stderr?.on('data', async (data) => {
        await this.appLogger.error(this.runId, this.processId, data.toString());
      });

      return new Promise<void>((resolve) => {
        runner.on('close', (code) => {
          this.logger.log(`Runner exited with code ${code}`);
          this.appLogger.info(
            this.runId,
            this.processId,
            `Runner exited with code ${code}`,
          );
          resolve();
        });
      });
    } catch (error) {
      this.logger.error(`Error starting runner`, error);
      this.appLogger.error(this.runId, this.processId, `Error starting runner`);
      this.appLogger.error(this.runId, this.processId, error.toString());
      return Promise.resolve();
    }
  }

  private activateCommand(): string {
    const platform = os.platform();
    let activateCommand;

    if (platform === 'win32') {
      activateCommand = 'venv\\Scripts\\activate.bat'; // Note the backslashes
    } else {
      activateCommand = 'source venv/bin/activate';
    }
    return activateCommand;
  }
}
