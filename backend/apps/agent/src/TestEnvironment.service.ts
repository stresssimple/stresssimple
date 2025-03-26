import { TestEnvironment } from '@infra/infrastructure';
import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';

@Injectable()
export class TestEnvironmentService {
  private readonly fileName: string;

  constructor(
    // @InjectRepository(TestEnvironment)
    // private readonly repository: Repository<TestEnvironment>,

    private readonly logger: Logger,
  ) {
    const dir = process.env['RUNNER_TEMPLATE_FOLDER'] || '/tmp';
    this.fileName = `${dir}/test-environment.json`;

    if (!existsSync(dir)) {
      this.logger.warn(`Directory ${dir} does not exist. Creating it`);
      mkdirSync(dir, { recursive: true });
    }

    if (!existsSync(this.fileName)) {
      this.logger.warn(`File ${this.fileName} does not exist. Creating it`);
      writeFileSync(this.fileName, '[]');
    }
  }

  public async getEnvironmentById(id: string): Promise<TestEnvironment> {
    const envs = await this.getEnvironments();
    return envs.find((env: TestEnvironment) => env.id === id);
  }

  public async getFreeEnvironment(
    serverId: string,
    runId: string,
    language: string,
    modules: string[],
  ): Promise<TestEnvironment> {
    const envs = await this.getEnvironments();

    let environment = envs.find(
      (env: TestEnvironment) =>
        env.isFree &&
        env.language === language &&
        env.modules === modules.join(','),
    );

    if (!environment) {
      this.logger.warn(`Not found free env. Creating new environment`);
      environment = new TestEnvironment();
      environment.language = language;
      environment.isFree = false;
      environment.modules = modules.join(',');
      envs.push(environment);
    } else {
      this.logger.log(`Found free env. Using it`);
      environment.isFree = false;
    }
    environment.runId = runId;
    await this.saveEnvironment(environment);
    return environment;
  }

  public async setEnvironmentFree(id: string): Promise<void> {
    const envs = await this.getEnvironments();
    const environment = envs.find((env: TestEnvironment) => env.id === id);
    environment.isFree = true;
    await this.saveEnvironment(environment);
  }

  public async removeEnvironment(id: string): Promise<void> {
    const envs = await this.getEnvironments();
    const index = envs.findIndex((env: TestEnvironment) => env.id === id);
    envs.splice(index, 1);
    await writeFile(this.fileName, JSON.stringify(envs));
  }

  private async saveEnvironment(environment: TestEnvironment): Promise<void> {
    const json = await readFile(this.fileName);
    const envs = JSON.parse(json.toString());
    const index = envs.findIndex(
      (env: TestEnvironment) => env.id === environment.id,
    );
    if (index === -1) {
      envs.push(environment);
    } else {
      envs[index] = environment;
    }
    await writeFile(this.fileName, JSON.stringify(envs));
  }

  private async getEnvironments(): Promise<TestEnvironment[]> {
    const json = await readFile(this.fileName);
    return JSON.parse(json.toString());
  }
}
