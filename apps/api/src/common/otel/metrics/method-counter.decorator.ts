import { Counter, MetricOptions } from '@opentelemetry/api';
import { getOrCreateCounter } from './metrics';
import {
  copyMetadataFromFunctionToFunction,
  toSnakeCase,
} from '@/common/otel/otel.utils';

export const OtelMethodCounter =
  (name?: string, options?: MetricOptions) =>
  (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => any>,
  ) => {
    const className = target.constructor.name;
    const metricName =
      name ||
      `${toSnakeCase(className)}.${toSnakeCase(propertyKey.toString())}_calls`;
    const description = `Method ${className}.${propertyKey.toString()} calls counter`;
    const unit = '1';
    let counterMetric: Counter;

    const originalFunction = descriptor.value ?? (() => {});

    const wrappedFunction = function PropertyDescriptor(...args: any[]) {
      if (!counterMetric) {
        counterMetric = getOrCreateCounter(metricName, {
          description,
          unit,
          ...options,
        });
      }
      counterMetric.add(1);
      return originalFunction.apply(this, args);
    };
    descriptor.value = wrappedFunction;

    copyMetadataFromFunctionToFunction(originalFunction, wrappedFunction);
  };
