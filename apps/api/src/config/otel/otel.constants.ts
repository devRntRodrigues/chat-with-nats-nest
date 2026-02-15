export const OTEL_SERVICE_NAME = process.env.OTEL_SERVICE_NAME || 'nestjs_otel';

export enum Metric {
  NATS_IN_REQ_ERR_RATE = 'nats_incoming_request_error_rate',
}
