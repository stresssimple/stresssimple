import { Module } from '@nestjs/common';
import { InfluxModule } from '../influxdb/influx.module';

@Module({
  imports: [InfluxModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class HttpModule {}
