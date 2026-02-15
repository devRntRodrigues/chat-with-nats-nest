import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { HealthModule } from './health/health.module';
import { PresenceModule } from './presence/presence.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { validateEnv, EnvConfig } from './config/app-config';
import { getMongooseConfig } from './config/db';
import { BrokerModule } from './broker/broker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => validateEnv(config as Record<string, unknown>),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<EnvConfig, true>) => {
        const uri = configService.get('db.uri', { infer: true });
        return getMongooseConfig(uri);
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    MessagesModule,
    HealthModule,
    PresenceModule,
    BrokerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
