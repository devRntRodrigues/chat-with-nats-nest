import { Module, Global } from '@nestjs/common';
import { OtelMetricService } from './metrics/metrics.service';

@Global()
@Module({
  providers: [OtelMetricService],
  exports: [OtelMetricService],
})
export class OtelModule {}
