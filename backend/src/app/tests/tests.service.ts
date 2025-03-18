import { Injectable, Logger } from '@nestjs/common';
import { TestDefinitions } from '../dto/TestDefinitions';
import { InjectRepository } from '@nestjs/typeorm';
import { Test } from '../mysql/Test';
import { Repository } from 'typeorm';
import { generateId } from '../utils/id';

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(Test)
    private usersRepository: Repository<Test>,
    private logger: Logger,
  ) {}

  public async getTests(): Promise<TestDefinitions[]> {
    const tests = await this.usersRepository.find();
    return tests.map((test) => ({
      id: test.id,
      name: test.name,
      description: test.description,
      modules: test.modules.split(',').filter((m) => m?.length > 0),
      source: test.source,
    }));
  }

  public async getTest(id: string): Promise<TestDefinitions | undefined> {
    if (!id) {
      throw new Error('Invalid test id');
    }
    const test = await this.usersRepository.findOne({
      where: {
        id,
      },
    });
    if (!test) {
      return undefined;
    }
    return {
      id: test.id,
      name: test.name,
      description: test.description,
      modules: test.modules.split(',').filter((m) => m?.length > 0),
      source: test.source,
    };
  }

  public async addTest(test: TestDefinitions): Promise<Test> {
    const record = new Test();
    record.id = generateId();
    record.name = test.name;
    record.description = test.description;
    record.modules = test.modules.join(',');
    record.source = test.source;
    await this.usersRepository.insert({ ...record });
    return record;
  }

  public async updateTest(test: TestDefinitions) {
    const record = new Test();
    record.id = test.id;
    record.name = test.name;
    record.description = test.description;
    record.modules = test.modules.join(',');
    record.source = test.source;
    return await this.usersRepository.update({ id: test.id }, { ...record });
  }

  public deleteTest(id: string) {
    this.usersRepository.delete(id);
  }
}
