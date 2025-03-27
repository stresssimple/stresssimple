import { InfluxModule } from '@infra/infrastructure';
import { Module } from '@nestjs/common';

@Module({
  imports: [InfluxModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class HttpModule {}
