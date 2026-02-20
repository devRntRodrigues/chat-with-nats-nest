import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtAuthenticator, tokenAuthenticator } from '@nats-io/nats-core';
import { connect } from '@nats-io/transport-node';
import { BrokerClientService } from './broker-client.service';
import { AppConfig } from '@/config/env';

const brokerConnectionProvider = {
  provide: 'NATS_CONNECTION',
  useFactory: async (configService: ConfigService<AppConfig, true>) => {
    const servers = configService.get('broker.servers', { infer: true });
    const authToken = configService.get('broker.authToken', { infer: true });
    const userJwt = configService.get('broker.userJwt', { infer: true });
    const userSeed = new TextEncoder().encode(
      configService.get('broker.userSeed', { infer: true }),
    );
    const nodeEnv = configService.get('nodeEnv', { infer: true });
    const appEnv = configService.get('appEnv', { infer: true });
    const clientId = `chat-api-${appEnv}-${process.env.NODE_APP_INSTANCE}`;
    const logger = new Logger('Nats');

    let authenticator;
    if (authToken) {
      authenticator = tokenAuthenticator(authToken as string);
    } else if (userJwt && userSeed) {
      authenticator = jwtAuthenticator(userJwt as string, userSeed);
    } else {
      throw new Error(
        'NATS authentication failed: Either BROKER_AUTH_TOKEN or both BROKER_USER_JWT and BROKER_USER_SEED must be provided',
      );
    }

    const brokerConnection = await connect({
      name: clientId,
      servers: servers,
      authenticator: authenticator,
      inboxPrefix: ` chat-api._INBOX`,
      debug: false,
      noEcho: nodeEnv !== 'test',
      maxReconnectAttempts: -1,
      reconnectTimeWait: 2000,
    });

    void (async () => {
      logger.debug(
        { clientId, servers },
        `Broker connected to Nats servers: ${brokerConnection.getServer()} with name ${clientId}`,
      );
      for await (const s of brokerConnection.status()) {
        logger.debug(`Broker ${s.type}: ${servers}`);
      }
    })().then();

    return brokerConnection;
  },
  inject: [ConfigService],
};

@Module({
  imports: [],
  providers: [brokerConnectionProvider, BrokerClientService],
  exports: [brokerConnectionProvider, BrokerClientService],
})
export class BrokerModule {}
