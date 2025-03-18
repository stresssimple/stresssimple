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
    @Query('name') name?: string,
    @Query('baseUrl') baseUrl?: string,
    @Query('method') method?: string,
    @Query('path') path?: string,
    @Query('status') status?: string,
    @Query('success') success?: string,
  ): Promise<unknown> {
    return await this.auditService.findAuditRecords(
      runId,
      page,
      pageSize,
      name ? name.split(',') : undefined,
      baseUrl ? baseUrl.split(',') : undefined,
      method ? method.split(',') : undefined,
      path ? path.split(',') : undefined,
      status ? status.split(',') : undefined,
      success ? success.split(',') : undefined,
    );
  }

  @Get(':runId/audit/values')
  public async getAuditValues(@Param('runId') runId: string): Promise<unknown> {
    const values = await this.auditService.getAuditValues(runId);
    for (const key of Object.keys(values)) {
      values[key] = Array.from(values[key]);
    }
    return values;
  }

  @Get(':runId/audit/:recordId')
  public async getAuditRecord(
    @Param('recordId') recordId: string,
  ): Promise<unknown> {
    return await this.auditService.getAuditRecord(recordId);
  }
}
