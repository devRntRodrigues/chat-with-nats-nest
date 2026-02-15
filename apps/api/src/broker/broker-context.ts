import { BaseRpcContext } from '@nestjs/microservices';
import { Msg } from 'nats';
import { BrokerClientService } from './broker-client.service';

type BrokerContextArgs = [string, Msg, BrokerClientService, string];

export class BrokerContext extends BaseRpcContext<BrokerContextArgs> {
  constructor(args: BrokerContextArgs) {
    super(args);
  }

  getTopic() {
    return this.args[0];
  }

  getSubject() {
    return this.args[3];
  }

  getTopicTokens(index: number): string {
    const tokens = this.args[0].split('.');
    return tokens[index];
  }

  getMessage() {
    return this.args[1];
  }

  getClient() {
    return this.args[2];
  }

  getHeaders(): Record<string, string> | undefined {
    const msg = this.getMessage();

    if (msg.headers) {
      return Object.fromEntries(
        msg.headers.keys().map((key) => [key, msg.headers?.get(key) || '']),
      );
    }

    return undefined;
  }
}
