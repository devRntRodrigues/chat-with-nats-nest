import {
  Span as ApiSpan,
  SpanOptions,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';
import { copyMetadataFromFunctionToFunction } from '@/config/otel/otel.utils';
import { OTEL_SERVICE_NAME } from '../otel.constants';
import { safeStringify } from '@/config/utils';

type SpanDecoratorOptions = SpanOptions & { args: false | boolean[] };

const recordException = (span: ApiSpan, error: any) => {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
};

const parseArgs = (args: any[], options: SpanDecoratorOptions) => {
  if (!options.args) {
    return {};
  }

  const attributes: any = {};
  const maxIter = Math.max(args.length, options.args.length);

  for (let i = 0; i < maxIter; i++) {
    if (!options.args[i]) {
      continue;
    }

    switch (typeof args[i]) {
      case 'function': {
        attributes[`args.${i}`] = `[Function: ${args[i].name}]`;
        break;
      }
      case 'object': {
        if (args[i] === undefined) {
          attributes[`args.${i}`] = 'undefined';
          break;
        }
        try {
          attributes[`args.${i}`] = safeStringify(args[i]);
        } catch {}
        break;
      }
      default: {
        attributes[`args.${i}`] = args[i];
      }
    }
  }

  return attributes;
};

export function OtelSpan(
  name?: string | null,
  options: SpanDecoratorOptions = { args: false },
) {
  return (
    target: any,
    propertyKey: PropertyKey,
    propertyDescriptor: PropertyDescriptor,
  ) => {
    const originalFunction = propertyDescriptor.value;

    const wrappedFunction = function PropertyDescriptor(...args: any[]) {
      const tracer = trace.getTracer(OTEL_SERVICE_NAME);
      const spanName =
        name || `${target.constructor.name}.${propertyKey.toString()}`;

      if (args.length && options.args !== false) {
        if (!options.attributes) {
          options.attributes = {};
        }
        options.attributes = {
          ...options.attributes,
          ...parseArgs(args, options),
        };
      }

      return tracer.startActiveSpan(spanName, options, (span) => {
        if (originalFunction.constructor.name === 'AsyncFunction') {
          return originalFunction
            .apply(this, args)
            .catch((error: any) => {
              recordException(span, error);
              throw error;
            })
            .finally(() => {
              span.end();
            });
        }

        try {
          return originalFunction.apply(this, args);
        } catch (error) {
          recordException(span, error);
          throw error;
        } finally {
          span.end();
        }
      });
    };

    propertyDescriptor.value = wrappedFunction;

    copyMetadataFromFunctionToFunction(originalFunction, wrappedFunction);
  };
}
