import { AppConfig, NodeEnvironment } from '@/config/app-config';
import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pino, { Level } from 'pino';
import { safeStringify } from '@/common/utils';
import pretty from 'pino-pretty';

@Injectable()
export class Logger implements LoggerService {
  private logger: pino.Logger;

  constructor(configService: ConfigService<AppConfig, true>) {
    const logLevel = configService.get('logLevel', { infer: true });
    const nodeEnv = configService.get('nodeEnv', { infer: true });
    const shouldUsePretty =
      nodeEnv !== NodeEnvironment.PRODUCTION &&
      nodeEnv !== NodeEnvironment.STAGING;

    this.logger = pino(
      {
        level: logLevel,
      },
      shouldUsePretty
        ? (pretty({
            singleLine: true,
            sync: true,
            colorize: true,
            destination: 1,
            ignore: 'req,pid,hostname,err',
            messageFormat: '[{context}] {msg}',
          }) as pino.DestinationStream)
        : undefined,
    );
  }

  log(message: any, ...optionalParams: any[]) {
    this.call('info', message, ...optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]) {
    this.call('fatal', message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.call('error', message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.call('warn', message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.call('debug', message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.call('trace', message, ...optionalParams);
  }

  private call(level: Level, message: any, ...optionalParams: any[]) {
    let context: string = '';

    let params: any[] = [];
    if (optionalParams.length !== 0) {
      context = optionalParams[optionalParams.length - 1];
      params = optionalParams.slice(0, -1);
    }

    if (typeof message === 'object') {
      if (message instanceof Error) {
        this.logger[level]({ err: message, context }, ...params);
      } else {
        const data: any = {};
        if ('msg' in message) {
          data.msg = message.msg;
          delete message.msg;
        }
        if ('err' in message) {
          data.err = message.err;
          delete message.err;
        }
        data.context = context;
        data.meta = safeStringify(message);
        this.logger[level](data, ...params);
      }
    } else {
      this.logger[level]({ context }, message, ...params);
    }
  }
}
