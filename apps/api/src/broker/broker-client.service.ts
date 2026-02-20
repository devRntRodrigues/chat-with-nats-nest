import {
  Codec,
  ConsumerConfig,
  headers,
  JetStreamPublishOptions,
  JSONCodec,
  Msg,
  type NatsConnection,
  PublishOptions,
  Sub,
  SubscriptionOptions,
} from 'nats';
import { Inject, Injectable, Logger } from '@nestjs/common';

export type MqttHandler = (topic: string, payload: any, message: Msg) => void;

@Injectable()
export class BrokerClientService {
  private readonly logger = new Logger(BrokerClientService.name);
  public jc: Codec<unknown>;

  constructor(@Inject('NATS_CONNECTION') private readonly nc: NatsConnection) {
    this.jc = JSONCodec();
  }

  public async disconnect(graceful = true): Promise<void> {
    try {
      if (this.nc && !this.nc.isClosed()) {
        if (graceful) {
          await this.nc.drain();
        }

        await this.nc.close();

        const error = await this.nc.closed();
        const m = 'connection closed';
        if (error) {
          this.logger.error(error, `${m} ${error ? error.message : ''}`);
        } else {
          this.logger.log(m);
        }
      }
    } catch {
      // Ignore errors on try to disconnect
    }
  }

  async consumer(stream: string, options: Partial<ConsumerConfig>) {
    const jsm = await this.nc.jetstreamManager();

    try {
      await jsm.consumers.add(stream, options);
    } catch (err: any) {
      // consumer already exists
      if (!(err.api_error?.err_code === 10148)) {
        throw err;
      }

      await jsm.consumers.update(stream, options.durable_name!, options);
    }

    this.logger.log(`JetStream ${stream} started`);
    const js = this.nc.jetstream();
    const consumer = await js.consumers.get(stream, options.durable_name);

    return consumer;
  }

  public subscribe(
    topic: string,
    handler: MqttHandler,
    opts?: SubscriptionOptions,
  ): Sub<Msg> {
    this.logger.debug(`subscription to topic ${topic}`);
    const subscription = this.nc.subscribe(topic, opts);

    (async () => {
      for await (const message of subscription) {
        try {
          const processedMessage: any = this.jc.decode(message.data);
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
    })();

    return subscription;
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
    this.nc.publish(topic, this.jc.encode(payload), opts);
  }

  public publish(topic: string, payload: any) {
    this.nc.publish(topic, this.jc.encode(payload));
  }

  public async jsPublish(
    subject: string,
    payload: any,
    opts?: Partial<JetStreamPublishOptions>,
  ): Promise<boolean> {
    const js = this.nc.jetstream();

    const acknowledged = await js.publish(
      subject,
      this.jc.encode(payload),
      opts,
    );

    return !!acknowledged;
  }

  public async request<
    T = {
      error?: Record<string, any>;
      data?: any;
    },
  >(
    topic: string,
    payload: Record<string, any> = {},
    options?: {
      timeout?: number;
      headers?: Record<string, string>;
    },
  ): Promise<T> {
    const hdrs = headers();
    if (options?.headers) {
      for (const [k, v] of Object.entries(options.headers)) {
        hdrs.append(k, v);
      }
    }

    const msg = await this.nc.request(topic, this.jc.encode(payload), {
      timeout: options?.timeout ?? 5000,
      headers: hdrs,
    });

    return this.jc.decode(msg.data) as T;
  }
}
