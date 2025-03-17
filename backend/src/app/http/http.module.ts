import { Module } from '@nestjs/common';
import { InfluxModule } from '../influxdb/influx.module';
import { HttpAuditController } from './http.audit.controller';

@Module({
  imports: [InfluxModule],
  controllers: [HttpAuditController],
  providers: [],
  exports: [],
})
export class HttpModule {}
