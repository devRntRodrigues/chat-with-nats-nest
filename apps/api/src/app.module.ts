import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
// import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OAuthModule } from './oauth/oauth.module';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { HealthModule } from './health/health.module';
import { PresenceModule } from './presence/presence.module';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { LoggerModule } from '@/common/logger/logger.module';
import { OtelModule } from '@/common/otel/otel.module';
import { validateEnv, AppConfig } from './config/app-config';
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
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const uri = configService.get('db.uri', { infer: true });
        return getMongooseConfig(uri);
      },
      inject: [ConfigService],
    }),
    CacheModule.register({ isGlobal: true }),
    LoggerModule,
    OtelModule,
    OAuthModule,
    UsersModule,
    MessagesModule,
    HealthModule,
    PresenceModule,
    BrokerModule,
  ],
  controllers: [],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
