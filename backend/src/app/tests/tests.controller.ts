import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { TestDefinitions } from '../dto/TestDefinitions';

@Controller('tests')
export class TestsController {
  constructor(private testService: TestsService) {}

  @Get()
  public getTests() {
    return this.testService.getTests();
  }

  @Get(':id')
  public getTest(id: string) {
    return this.testService.getTest(id);
  }

  @Post()
  public async addTest(@Body() body: TestDefinitions) {
    if (await this.testService.getTest(body.id)) {
      throw new Error('Test already exists');
    }
    return this.testService.saveTest(body);
  }

  @Put()
  public async updateTest(@Body() body: TestDefinitions) {
    if (!this.testService.getTest(body.id)) {
      throw new Error('Test does not exist');
    }
    return this.testService.saveTest(body);
  }

  @Delete(':id')
  public async deleteTest(@Param('id') id: string) {
    if (!id) {
      throw new Error('Invalid test id');
    }
    if (!this.testService.getTest(id)) {
      throw new Error(`Test ${id} does not exist`);
    }
    this.testService.deleteTest(id);
  }
}
