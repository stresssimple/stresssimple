import { Injectable, Logger } from '@nestjs/common';
import { TestDefinitions } from '../dto/TestDefinitions';
import { InjectRepository } from '@nestjs/typeorm';
import { Test } from '../../../../../libs/infrastructure/src/mysql/Entities/Test';
import { Repository } from 'typeorm';
import { generateId } from '../../../../../libs/infrastructure/src/utils/id';

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(Test)
    private usersRepository: Repository<Test>,
    private logger: Logger,
  ) {}

  public async getTests(): Promise<any[]> {
    const tests = await this.usersRepository.find({
      select: ['id', 'name', 'language'],
    });
    return tests.map((test) => ({
      id: test.id,
      name: test.name,
      language: test.language,
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
      language: test.language,
    };
  }

  public async addTest(test: TestDefinitions): Promise<Test> {
    const record = new Test();
    record.id = generateId();
    record.name = test.name;
    record.description = test.description;
    record.modules = test.modules.join(',');
    record.source = test.source;
    record.language = test.language;
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

  public async cloneTest(id: string) {
    const test = await this.getTest(id);
    if (!test) {
      throw new Error('Test not found');
    }
    const record = new Test();
    record.id = generateId();
    record.name = test.name + ' (clone)';
    record.description = test.description;
    record.modules = test.modules.join(',');
    record.source = test.source;
    await this.usersRepository.insert({ ...record });
    return record;
  }

  public deleteTest(id: string) {
    this.usersRepository.delete(id);
  }
}
