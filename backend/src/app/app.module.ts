import { Module } from '@nestjs/common';
import { HttpModule } from './http/http.module';
import { TestsModule } from './tests/tests.module';
import { RunsModule } from './runs/runs.module';
import { TemplateRunnerModule } from './template-runner/templateRunner.module';
import { InfraModule } from './infra.module';

@Module({
  imports: [
    InfraModule,
    HttpModule,
    TestsModule,
    RunsModule,
    TemplateRunnerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
