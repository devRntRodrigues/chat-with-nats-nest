import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Counter } from '@opentelemetry/api';
import { OtelMetricService } from '../otel/metrics/metrics.service';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpLoggerMiddleware.name);
  private readonly requestCounter: Counter;
  private readonly responseCounter: Counter;

  constructor(private readonly metricsService: OtelMetricService) {
    this.requestCounter = this.metricsService.getCounter('http', {
      description: 'Total HTTP requests',
      unit: 'requests',
    });

    this.responseCounter = this.metricsService.getCounter('http', {
      description: 'Total HTTP responses',
      unit: 'responses',
    });
  }

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl, body } = request;

    const oldWrite = response.write;
    const oldEnd = response.end;
    const chunks: any[] = [];

    this.logger.log({ body }, `REQ ${method} ${originalUrl}`);
    this.requestCounter.add(1, { path: originalUrl });

    response.write = function (chunk: any) {
      chunks.push(chunk);

      return oldWrite.apply(response, arguments);
    };

    response.end = function (chunk: any) {
      if (chunk) {
        chunks.push(chunk);
      }

      return oldEnd.apply(response, arguments);
    };

    response.on('finish', () => {
      const { statusCode } = response;
      const responseBody = Buffer.concat(chunks).toString('utf8');
      this.logger.log(
        { body: responseBody },
        `RES ${method} ${originalUrl} ${statusCode}`,
      );
      this.responseCounter.add(1, { path: originalUrl, status: statusCode });
    });

    next();
  }
}
