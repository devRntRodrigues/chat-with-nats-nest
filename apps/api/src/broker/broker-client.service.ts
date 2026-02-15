import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  Msg,
  SubscriptionOptions,
  Subscription,
  PublishOptions,
  TimeoutError,
} from '@nats-io/nats-core';
import { omit } from 'lodash';
import type { NatsConnection } from '@nats-io/nats-core';

export type MqttHandler = (topic: string, payload: any, message: Msg) => void;

@Injectable()
export class BrokerClientService {
  private readonly logger = new Logger(BrokerClientService.name);

  constructor(
    @Inject('NATS_CONNECTION')
    public readonly connection: NatsConnection,
  ) {
    this.logger.log(
      { host: connection.getServer() },
      `connected ${connection.getServer()}`,
    );
  }

  public async disconnect(graceful: boolean = true): Promise<void> {
    try {
      if (graceful) {
        await this.connection.drain();
      }

      await this.connection.close();

      void this.connection.closed().then((error) => {
        const m = `connection closed`;
        this.logger.error(error, `${m} ${error ? error.message : ''}`);
      });
    } catch {
      // Ignore errors on try to disconnect
    }
  }

  public subscribe(
    topic: string,
    handler: MqttHandler,
    options?: SubscriptionOptions & {
      onTimeout?: (topic: string, error: Error) => void;
    },
  ): Subscription {
    this.logger.debug(
      `subscription to topic ${topic} ${options?.queue ? `in queue group ${options.queue}` : ''}`,
    );
    const subscription = this.connection.subscribe(
      topic,
      omit(options, ['onTimeout']),
    );

    (async () => {
      for await (const message of subscription) {
        try {
          const processedMessage: any = message.json();

          this.logger.debug(
            { payload: processedMessage },
            `receive subscription from topic ${message.subject}`,
          );
          void handler(message.subject, processedMessage, message);
        } catch (error) {
          this.logger.error(
            error,
            `error processing message from subscription to topic ${message.subject}`,
          );
        }
      }
    })().catch((error) => {
      if (error instanceof TimeoutError) {
        this.logger.error(
          error,
          `Timeout error on subscription to topic ${topic}`,
        );
        options?.onTimeout?.(topic, error);
      } else {
        this.logger.error(error, `Error on subscription to topic ${topic}`);
      }
    });

    return subscription;
  }

  public publish(
    topic: string,
    payload: any,
    opts?: Partial<PublishOptions>,
  ): void {
    this.logger.debug({ topic, payload }, `publish to topic ${topic}`);
    this.connection.publish(topic, JSON.stringify(payload), opts);
  }

  public async request(topic: string, payload: any): Promise<any> {
    this.logger.debug({ topic, payload }, `send request to topic ${topic}`);

    try {
      const reply = await this.connection.request(
        topic,
        JSON.stringify(payload),
        {
          timeout: 10000,
        },
      );

      const data = reply.json();

      this.logger.debug(
        { topic, payload: data },
        `receive reply from topic ${topic}`,
      );

      return data;
    } catch (error) {
      this.logger.error(error, `problem with request`);
    }
  }

  public reply(
    requestTopic: string,
    topic: string,
    payload: any,
    opts?: Partial<PublishOptions>,
  ): void {
    this.logger.debug(
      { requestTopic, topic, payload },
      `publish reply to topic ${requestTopic} with topic ${topic}`,
    );
    this.connection.publish(topic, JSON.stringify(payload), opts);
  }
}
