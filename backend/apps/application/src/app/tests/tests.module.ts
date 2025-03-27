import { Logger, Module } from '@nestjs/common';
import { TestsService } from './tests.service';
import { TestsController } from './tests.controller';
import { INQUIRER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from '@infra/infrastructure';

@Module({
  imports: [TypeOrmModule.forFeature([Test])],
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
