import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogRecord } from '../mysql/Entities/LogRecord';
import { AppLogsService } from './AppLogsService';
import { AuditRecord } from '../mysql/Entities/AuditRecord';
import { AuditService } from './AuditService';
import { AuditController } from './controller';

@Module({
  imports: [TypeOrmModule.forFeature([LogRecord, AuditRecord])],
  providers: [AppLogsService, AuditService],
  exports: [AppLogsService, AuditService],
  controllers: [AuditController],
})
export class AppLogsModule {}
