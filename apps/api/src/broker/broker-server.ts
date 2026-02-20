import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { Msg } from '@nats-io/nats-core';
import { BrokerContext } from './broker-context';
import { BrokerClientService } from './broker-client.service';
import { BrokerRouter } from './broker-router';
import { BrokerMicroserviceConfig } from './broker.types';
import { Logger } from '@nestjs/common';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { OTEL_SERVICE_NAME } from '@/common/otel/otel.constants';
import { useContextPropagation } from '@/common/otel/traces/context-propagation';

export class BrokerServer extends Server implements CustomTransportStrategy {
  readonly logger = new Logger(BrokerServer.name);
  private readonly brokerRouter: BrokerRouter;

  constructor(
    private readonly brokerClient: BrokerClientService,
    private readonly config: BrokerMicroserviceConfig,
  ) {
    super();
    this.brokerRouter = new BrokerRouter();
  }

  public listen(callback: (err?: unknown) => void) {
    try {
      this.registerSubscriptions();
      this.addRoutes(callback);
    } catch (err) {
      callback(err);
    }
  }

  close() {
    this.brokerClient.disconnect(true);
  }

  on() {
    throw new Error('Method not implemented.');
  }

  unwrap<T = never>(): T {
    throw new Error('Method not implemented.');
  }

  public addRoutes(callback: (err?: unknown) => void) {
    const registeredPatterns = [...this.messageHandlers.keys()];
    registeredPatterns.forEach((pattern) => {
      this.logger.log(`Register route to topic: ${pattern}`);
      this.brokerRouter.addRoute(
        pattern,
        this.getMessageHandler(pattern).bind(this),
      );
    });

    callback();
  }

  public getMessageHandler(pattern: string) {
    return (topic: string, payload: any, message: Msg) =>
      this.handleMessage(pattern, topic, payload, message);
  }

  public handleMessage(
    pattern: string,
    topic: string,
    payload: any,
    message: Msg,
  ): void {
    const context = new BrokerContext([
      topic,
      payload,
      message,
      this.brokerClient,
      pattern,
    ]);

    const handler = this.getHandlerByPattern(pattern);

    if (handler) {
      const response$ = this.transformToObservable(handler(payload, context));

      // if handler is event handler, we can't send response
      const isEventHandler = handler.isEventHandler;

      if (isEventHandler) {
        return;
      }

      const publish = this.getPublisher(message);

      if (response$) this.send(response$, publish);
    }
  }

  public getPublisher(message: Msg) {
    return (response: any) => {
      if (message.reply) {
        if (response.err) {
          return this.brokerClient.reply(message.subject, message.reply, {
            error: response.err,
          });
        }
        return this.brokerClient.reply(
          message.subject,
          message.reply,
          response.response,
        );
      }
    };
  }

  subscriptionHandler(rawTopic: string, rawPayload: any, message: Msg) {
    let topic = rawTopic;
    let payload = rawPayload;

    if (rawPayload.action) {
      topic = rawTopic + '.' + rawPayload.action;
      payload = rawPayload.data ?? payload;
      delete rawPayload.action;
    }

    const handler = this.brokerRouter.getHandler(topic);

    if (handler) {
      const tracer = trace.getTracer(OTEL_SERVICE_NAME);

      tracer.startActiveSpan(
        topic,
        {},
        useContextPropagation({
          traceparent: message.headers?.get('traceparent'),
          tracestate: message.headers?.get('tracestate'),
        }),
        (span) => {
          try {
            handler(topic, payload, message);
          } catch (err) {
            span.recordException(err);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: err?.message,
            });
            throw err;
          } finally {
            span.end();
          }
        },
      );
    }
  }

  registerSubscriptions() {
    const queue = this.config.queue;
    const boundSubscriptionHandler = this.subscriptionHandler.bind(this);
    this.config.subscriptions.forEach((topic) => {
      this.brokerClient.subscribe(topic, boundSubscriptionHandler, {
        queue,
      });
    });
  }
}
