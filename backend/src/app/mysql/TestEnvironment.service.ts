import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TestEnvironment } from './Entities/TestEnvironment';
import { Repository } from 'typeorm';

@Injectable()
export class TestEnvironmentService {
  constructor(
    @InjectRepository(TestEnvironment)
    private readonly repository: Repository<TestEnvironment>,
  ) {}

  public async getFreeEnvironment(
    language: string,
    modules: string[],
  ): Promise<TestEnvironment> {
    let environment = await this.repository
      .createQueryBuilder('testEnvironment')
      .where('testEnvironment.language = :language', { language })
      .andWhere('testEnvironment.isFree = :isFree', { isFree: true })
      .getOne();

    if (!environment) {
      environment = new TestEnvironment();
      environment.language = language;
      environment.isFree = false;
      environment.modules = modules.join(',');

      await this.repository.save(environment);
    } else {
      environment.isFree = false;
      await this.repository.save(environment);
    }

    return environment;
  }

  public async setEnvironmentFree(id: string): Promise<void> {
    await this.repository.update({ id }, { isFree: true });
  }

  public async removeEnvironment(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
