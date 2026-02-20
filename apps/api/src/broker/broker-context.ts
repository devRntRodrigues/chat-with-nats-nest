import { BaseRpcContext } from '@nestjs/microservices';
import { Msg } from '@nats-io/nats-core';
import { BrokerClientService } from './broker-client.service';
import {
  ActiveUser,
  ActiveUserType,
} from '@/iam/authentication/authentication.types';
import { Roles } from '@/iam/authorization/roles';
import { AppAbility } from '@/iam/authorization/ability.factory';
type BrokerContextArgs = [string, any, Msg, BrokerClientService, string];

export class BrokerContext extends BaseRpcContext<BrokerContextArgs> {
  private abilities: AppAbility;

  constructor(args: BrokerContextArgs) {
    super(args);
  }

  getTopic() {
    return this.args[0];
  }

  getPayload() {
    return this.args[1];
  }

  getSubject() {
    return this.args[4];
  }

  getTopicTokens(index: number): string {
    const tokens = this.args[0].split('.');
    return tokens[index];
  }

  getMessage() {
    return this.args[2];
  }

  getHeaders() {
    const msg = this.getMessage();
    return msg.headers;
  }

  getClient() {
    return this.args[3];
  }

  getUser(): ActiveUser | null {
    const localId = this.getTopicTokens(0);
    const userId = this.getTopicTokens(2);

    if (!userId) return null;

    const activeUser = {
      _id: userId,
      type: 'APP' as ActiveUserType,
      email: '',
      name: '',
      partner: null,
      roles: [Roles.APP_ADMIN],
      local: {
        id: localId,
        isAdmin: false,
      },
    };

    const headers = this.getHeaders();

    if (headers) {
      activeUser.name = headers.has('name')
        ? headers.get('name')
        : activeUser.name;

      if (headers.has('isAdmin') && headers.get('isAdmin') === 'true') {
        activeUser.roles = [Roles.APP_ADMIN];
        activeUser.local = {
          ...activeUser.local,
          isAdmin: true,
        };
      }

      if (headers.has('type') && headers.get('type') === 'INTERNAL') {
        activeUser.type = 'INTERNAL' as ActiveUserType;
      }

      if (headers.has('roles')) {
        activeUser.roles = headers.get('roles').split(',') as Roles[];
      }
    }

    return activeUser;
  }

  setAbilities(abilities: AppAbility) {
    this.abilities = abilities;
  }

  getAbilities() {
    return this.abilities;
  }
}
