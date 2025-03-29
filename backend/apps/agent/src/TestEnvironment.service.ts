import { TestEnvironment } from '@infra/infrastructure';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, mkdirSync } from 'fs';
import { readdir } from 'fs/promises';
import { In, Repository } from 'typeorm';

@Injectable()
export class TestEnvironmentService {
  private readonly basePath;
  constructor(
    @InjectRepository(TestEnvironment)
    private readonly repository: Repository<TestEnvironment>,
    private readonly logger: Logger,
  ) {
    this.basePath = process.env['RUNNER_TEMPLATE_FOLDER'] || '/tmp';

    if (!existsSync(this.basePath)) {
      this.logger.warn(
        `Directory ${this.basePath} does not exist. Creating it`,
      );
      mkdirSync(this.basePath, { recursive: true });
    }
  }

  public async getEnvironmentById(id: string): Promise<TestEnvironment> {
    const env = await this.repository.findOneBy({ id });
    if (!env) {
      this.logger.warn(`Environment ${id} not found`);
      return null;
    }
    this.logger.log(`Environment ${id} found`);
    return env;
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
    const env = await this.repository.findOneBy({ id });
    if (!env) {
      this.logger.warn(`Environment ${id} not found`);
      return;
    }
    env.isFree = true;
    env.runId = null;
    await this.saveEnvironment(env);
    this.logger.log(`Environment ${id} is free now`);
  }

  private async saveEnvironment(environment: TestEnvironment): Promise<void> {
    await this.repository.save(environment);
  }

  private async getEnvironments(): Promise<TestEnvironment[]> {
    const files = await readdir(this.basePath);
    const envs = await this.repository.find({
      where: { id: In(files) },
    });
    return envs;
  }
}
