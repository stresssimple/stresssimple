import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TestDefinitions } from '../dto/TestDefinitions';

@Injectable()
export class TestsService {
  private readonly TESTS_FOLDER = process.env['TESTS_FOLDER']; // 'tmp/tests';
  constructor(private logger: Logger) {
    this.logger.log(`Tests folder: ${this.TESTS_FOLDER}`);
    if (!fs.existsSync(this.TESTS_FOLDER)) {
      fs.mkdirSync(this.TESTS_FOLDER, { recursive: true });
      this.logger.log(`Created tests folder: ${this.TESTS_FOLDER}`);
    }
  }

  public getTests(): TestDefinitions[] {
    const tests: TestDefinitions[] = [];
    const files = fs.readdirSync(this.TESTS_FOLDER);
    files.forEach((file) => {
      const filePath = path.join(this.TESTS_FOLDER, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const test = JSON.parse(content);
      tests.push({ modules: [], ...test });
    });
    return tests;
  }

  public getTest(id: string): TestDefinitions | undefined {
    if (!id) {
      throw new Error('Invalid test id');
    }
    const filePath = path.join(this.TESTS_FOLDER, id);
    try {
      const content = fs.readFileSync(filePath + '.json', 'utf8');
      const test = JSON.parse(content);
      return { modules: [], ...test };
    } catch (e) {
      return undefined;
    }
  }

  public saveTest(test: TestDefinitions) {
    const filePath = path.join(this.TESTS_FOLDER, test.id);
    const content = JSON.stringify(test, null, 2);
    fs.writeFileSync(filePath + '.json', content);
  }

  public deleteTest(id: string) {
    this.logger.log(`Deleting test ${id}`);
    const filePath = path.join(this.TESTS_FOLDER, id);
    fs.rmSync(filePath + '.json');
  }
}
