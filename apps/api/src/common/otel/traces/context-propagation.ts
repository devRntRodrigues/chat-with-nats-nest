import { Context, context, propagation } from '@opentelemetry/api';
import { isPlainObject } from 'lodash';

export type Carrier = {
  traceparent?: string;
  tracestate?: string;
};

/**
 * Will create a new context with the parent context information.
 *
 * Use this function to set a parent to a new span.
 */
export function useContextPropagation(carrier?: Carrier): Context {
  if (carrier !== undefined && Object.keys(carrier).length > 0) {
    return propagation.extract(context.active(), carrier);
  }
  return context.active();
}

/**
 * Will return the carrier object of the current span context to be propagated
 * in a subsequent request.
 *
 * Use this function to get the carrier object and pass it to a request.
 */
export function getContextPropagation(): Carrier {
  const carrier: Carrier = {};
  propagation.inject(context.active(), carrier);
  return carrier;
}

/**
 * Will add the carrier object properties to an object. e.g. headers object for http
 *
 * Use this function when you have an object and want to add the carrier properties to it.
 */
export function setContextPropagation(obj: any) {
  if (isPlainObject(obj)) {
    const carrier = getContextPropagation();
    obj['traceparent'] = carrier.traceparent;
    obj['tracestate'] = carrier.tracestate;
  }
}
