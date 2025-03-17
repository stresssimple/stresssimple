import { Controller, Get, Param } from '@nestjs/common';
import { getAuditLogRecords, getAuditLogRecord } from './helpers';

@Controller('audit')
export class HttpAuditController {
  @Get(':testId/:runId')
  async aditLogRecords(
    @Param('testId') testId: string,
    @Param('runId') runId: string,
  ) {
    return getAuditLogRecords(testId, runId);
  }

  @Get(':testId/:runId/:filename')
  async auditLogRecord(
    @Param('testId') testId: string,
    @Param('runId') runId: string,
    @Param('filename') filename: string,
  ) {
    return getAuditLogRecord(testId, runId, filename);
  }
}
