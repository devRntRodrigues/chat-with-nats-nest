import { Logger, Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtAuthenticator, tokenAuthenticator } from '@nats-io/nats-core';
import { connect } from '@nats-io/transport-node';
import BrokerAuthenticatorsService from '@/broker/broker-authenticators.service';
import { BrokerClientService } from './broker-client.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppConfig, NodeEnvironment } from '@/config/app-config';

const brokerConnectionProvider = {
  provide: 'NATS_CONNECTION',
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService<AppConfig, true>) => {
    const servers = configService.get('broker.servers', { infer: true });
    const authToken = configService.get('broker.authToken', { infer: true });
    const userJwt = configService.get('broker.userJwt', { infer: true });
    const userSeed = new TextEncoder().encode(
      configService.get('broker.userSeed', { infer: true }),
    );
    const nodeEnv = configService.get('nodeEnv', { infer: true });
    const appEnv = configService.get('appEnv', { infer: true });
    const clientId = `iot-partner-server-${appEnv}-${process.env.NODE_APP_INSTANCE}`;
    const logger = new Logger('Nats');
    const isDevOrTest =
      nodeEnv === NodeEnvironment.DEVELOPMENT ||
      nodeEnv === NodeEnvironment.TEST;

    logger.debug(`connecting to ${servers.join(', ')}`);

    let authenticator: any;
    if (authToken) {
      authenticator = tokenAuthenticator(authToken);
    } else {
      authenticator = jwtAuthenticator(userJwt ?? '', userSeed);
    }

    const brokerConnection = await connect({
      name: clientId,
      servers: servers.join(','),
      authenticator: authenticator,
      inboxPrefix: `iot-partner-server._INBOX`,
      debug: false,
      noEcho: !isDevOrTest,
      maxReconnectAttempts: -1,
      reconnectTimeWait: 2000,
    });

    (async () => {
      logger.debug(`connected ${brokerConnection.getServer()}`);
      for await (const s of brokerConnection.status()) {
        const statusData = 'data' in s ? (s as { type: string; data?: unknown }).data : s;
        logger.debug(`${s.type}: ${JSON.stringify(statusData)}`);
      }
    })().then();

    return brokerConnection;
  },
};

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [],
  providers: [
    brokerConnectionProvider,
    BrokerAuthenticatorsService,
    BrokerClientService,
  ],
  exports: [
    brokerConnectionProvider,
    BrokerAuthenticatorsService,
    BrokerClientService,
  ],
})
export class BrokerModule {}
