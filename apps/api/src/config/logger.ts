import { LoggerService, Injectable } from '@nestjs/common';
import pino, { Logger } from 'pino';

@Injectable()
export class PinoLoggerService implements LoggerService {
  private logger: Logger;

  constructor(nodeEnv: string = process.env.NODE_ENV || 'development') {
    const isDevelopment = nodeEnv === 'development';

    this.logger = pino({
      level: nodeEnv === 'test' ? 'silent' : 'info',
      transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
      formatters: {
        level: (label) => {
          return { level: label };
        },
      },
    });
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.logger.trace(message, ...optionalParams);
  }
}
