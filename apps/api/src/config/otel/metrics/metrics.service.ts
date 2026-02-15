import { Injectable } from "@nestjs/common";
import { getOrCreateCounter } from "./metrics";
import { MetricOptions } from "@opentelemetry/api";

@Injectable()
export class OtelMetricService {
  getCounter(name: string, options?: MetricOptions) {
    return getOrCreateCounter(name, options);
  }
}
