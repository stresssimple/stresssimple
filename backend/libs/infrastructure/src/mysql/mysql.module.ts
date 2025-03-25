import * as fs from 'fs';
import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AuditRecord } from './Entities/AuditRecord';
import { LogRecord } from './Entities/LogRecord';
import { Test } from './Entities/Test';
import { TestEnvironment } from './Entities/TestEnvironment';
import { TestExecution } from './Entities/TestExecution';
import { Repository } from 'typeorm';
import * as path from 'path';
import { RunsService } from './runs.service';
import { ServerRecord } from './Entities/Server';
import { ServersService } from './servers.service';
import mysql2 from 'mysql2';
export const mySqlEntities = [
  Test,
  TestExecution,
  LogRecord,
  AuditRecord,
  TestEnvironment,
  ServerRecord,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return {
          type: 'mysql',
          host: process.env['MYSQL_HOST'] || 'localhost',
          port: process.env['MYSQL_PORT']
            ? parseInt(process.env['MYSQL_PORT'])
            : 3306,
          username: process.env['MYSQL_USER'],
          password: process.env['MYSQL_PASSWORD'],
          database: process.env['MYSQL_DATABASE'],
          entities: mySqlEntities,
          synchronize: true,
          insecureAuth: true,
          driver: mysql2,
        };
      },
    }),
    TypeOrmModule.forFeature(mySqlEntities),
  ],
  providers: [RunsService, ServersService],
  exports: [RunsService, ServersService],
})
export class MysqlModule implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Test) private testRepository: Repository<Test>,
    private readonly logger: Logger,
  ) {}
  private sourcePath = 'templates/bootstrap';
  public async onApplicationBootstrap() {
    if ((await this.testRepository.count()) > 0) {
      this.logger.log('Tests repository not empty, skipping seeding');
      return;
    }
    this.logger.log('Seeding tests');
    const dirs = fs.readdirSync(this.sourcePath);
    for (const partialDir of dirs) {
      const fullDir = `${this.sourcePath}/${partialDir}`;
      this.logger.log(`Seeding tests from ${fullDir}`);
      if (fs.lstatSync(fullDir).isDirectory()) {
        const language = partialDir;
        await this.seedTests(fullDir, language);
      }
    }
  }

  private async seedTests(dir: string, language: string) {
    const files = fs.readdirSync(dir, { recursive: true });
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file.toString()), 'utf-8');
      await this.testRepository.save(
        new Test({
          name: file.toString().replace('.ts', ''),
          source: content,
          description: 'Auto-generated test',
          language,
          modules: '',
        }),
      );
    }
  }
}
