import { Module } from '@nestjs/common';
import { InfluxModule } from '../../../../../libs/infrastructure/src/influxdb/influx.module';

@Module({
  imports: [InfluxModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class HttpModule {}
