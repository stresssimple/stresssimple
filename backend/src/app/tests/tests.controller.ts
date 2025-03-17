import { Body, Controller, Get, Logger, Post, Put } from '@nestjs/common';
import { TestsService } from './tests.service';
import { TestDefinitions } from '../dto/TestDefinitions';

@Controller('tests')
export class TestsController {
  constructor(
    private service: TestsService,
    private logger: Logger,
  ) {}

  @Get()
  public getTests() {
    return this.service.getTests();
  }

  @Get(':id')
  public getTest(id: string) {
    return this.service.getTest(id);
  }

  @Post()
  public async addTest(@Body() body: TestDefinitions) {
    if (await this.service.getTest(body.id)) {
      throw new Error('Test already exists');
    }
    return this.service.saveTest(body);
  }

  @Put()
  public updateTest(@Body() body: TestDefinitions) {
    if (!this.service.getTest(body.id)) {
      throw new Error('Test does not exist');
    }
    return this.service.saveTest(body);
  }
}
