import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { AppLogsService } from './AppLogsService';
import { AuditService } from './AuditService';

@Controller('audit')
export class AuditController {
  constructor(
    private readonly appLogService: AppLogsService,
    private readonly auditService: AuditService,
    private readonly logger: Logger,
  ) {}

  @Get(':runId/logs')
  public async getRunLogs(
    @Param('runId') runId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 100,
  ): Promise<unknown> {
    return await this.appLogService.findLogRecords(runId, page, pageSize);
  }

  @Get(':runId/audit')
  public async getRunAudit(
    @Param('runId') runId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 100,
  ): Promise<unknown> {
    return await this.auditService.findAuditRecords(runId, page, pageSize);
  }

  @Get(':runId/audit/:recordId')
  public async getAuditRecord(
    @Param('recordId') recordId: string,
  ): Promise<unknown> {
    return await this.auditService.getAuditRecord(recordId);
  }
}
