// import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
// import { TemplateRunnerSvcFactory } from '../template-runner/TemplateRunnerFactory';
// import { RunsService } from './runs.service';
// import { TestsService } from '../tests/tests.service';
// import { ApiBody } from '@nestjs/swagger';

// @Controller('template-runner')
// export class TemplateRunnerController {
//   constructor(
//     private readonly factory: TemplateRunnerSvcFactory,
//     private readonly runsService: RunsService,
//     private readonly testService: TestsService,
//     private readonly logger: Logger,
//   ) {}
//   @Post(':testId/:runId/init')
//   async initTestRun(
//     @Param('testId') testId: string,
//     @Param('runId') runId: string,
//   ) {
//     this.logger.log(`Init test run ${testId} ${runId}`);
//     const svc = this.factory.getRunnerSvc(
//       testId,
//       runId,
//       this.runsService.getFolder(testId, runId),
//     );
//     return await svc.initDirectory();
//   }

//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         modules: {
//           type: 'array',
//           items: {
//             type: 'string',
//           },
//         },
//       },
//     },
//   })
//   @Post(':testId/:runId/dependencies')
//   async installDependencies(
//     @Param('testId') testId: string,
//     @Param('runId') runId: string,
//     @Body() body: { modules: string[] },
//   ) {
//     this.logger.log(`Install dependencies ${testId} ${runId}`);
//     const svc = this.factory.getRunnerSvc(
//       testId,
//       runId,
//       this.runsService.getFolder(testId, runId),
//     );
//     return await svc.npmInstall(body.modules);
//   }

//   @Post(':testId/:runId/compile')
//   async compile(
//     @Param('testId') testId: string,
//     @Param('runId') runId: string,
//   ) {
//     const test = await this.testService.getTest(testId);
//     const svc = this.factory.getRunnerSvc(
//       testId,
//       runId,
//       this.runsService.getFolder(testId, runId),
//     );
//     return await svc.compileTemplate(test.source);
//   }
// }
