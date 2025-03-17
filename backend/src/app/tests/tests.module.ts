import { Logger, Module } from '@nestjs/common';
import { TestsService } from './tests.service';
import { TestsController } from './tests.controller';
import { INQUIRER } from '@nestjs/core';

@Module({
  imports: [],
  controllers: [TestsController],
  providers: [
    {
      provide: Logger,
      useFactory: (context) => new Logger(context),
      inject: [INQUIRER],
    },
    TestsService,
  ],
  exports: [TestsService],
})
export class TestsModule {}
