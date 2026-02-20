import {
  Counter,
  UpDownCounter,
  Histogram,
  ObservableGauge,
  ObservableCounter,
  ObservableUpDownCounter,
  metrics,
  MetricOptions,
} from '@opentelemetry/api';
import { OTEL_SERVICE_NAME } from '../otel.constants';

export type GenericMetric =
  | Counter
  | UpDownCounter
  | Histogram
  | ObservableGauge
  | ObservableCounter
  | ObservableUpDownCounter;

export const meterData: Map<string, GenericMetric> = new Map();

export function getOrCreateCounter(
  name: string,
  options?: MetricOptions,
): Counter {
  let metric = meterData.get(name);
  if (metric === undefined) {
    const meter = metrics.getMeterProvider().getMeter(OTEL_SERVICE_NAME);
    metric = meter.createCounter(name, options);
    meterData.set(name, metric);
  }
  return metric as Counter;
}
