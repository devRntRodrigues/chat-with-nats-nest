import { z } from 'zod';

export enum NodeEnvironment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export enum AppEnvironment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  STAGING = 'staging',
  TEST = 'test',
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

const DEFAULT_PORT = 4000;
const DEFAULT_DEVICE_BUSY_TIMEOUT = 3000;

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  APP_ENV: z
    .enum(['development', 'production', 'staging', 'test'])
    .default('development'),
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'debug', 'trace'])
    .default('debug'),
  PORT: z
    .string()
    .default(DEFAULT_PORT.toString())
    .transform((val) => parseInt(val, 10)),
  DEVICE_BUSY_TIMEOUT: z
    .string()
    .default(DEFAULT_DEVICE_BUSY_TIMEOUT.toString())
    .transform((val) => parseInt(val, 10)),
  OTEL_SERVICE_NAME: z.string().optional(),
  OTEL_URL: z.string().optional(),

  // Database
  MONGO_CONN: z.string().min(1, 'MONGO_CONN is required'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required').optional(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().optional(),

  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  REDIS_PREFIX: z.string().default('app'),

  // Broker (NATS)
  BROKER_SERVERS: z.string().min(1, 'BROKER_SERVERS is required'),
  BROKER_QUEUE: z.string().optional(),
  BROKER_AUTH_TOKEN: z.string().optional(),
  BROKER_USER_JWT: z.string().optional(),
  BROKER_USER_SEED: z.string().optional(),
});

export interface EnvConfig {
  nodeEnv: NodeEnvironment;
  appEnv: AppEnvironment;
  logLevel: LogLevel;
  port: number;
  deviceBusyTimeout: number;
  otelServiceName?: string;
  otelUrl?: string;
  db: {
    uri: string;
  };
  redis: {
    url: string;
    prefix: string;
  };
  broker: {
    servers: string[];
    queue?: string;
    authToken?: string;
    userJwt?: string;
    userSeed?: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  corsOrigin?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid environment configuration');
  }

  const env = parsed.data;

  return {
    nodeEnv: env.NODE_ENV as NodeEnvironment,
    appEnv: env.APP_ENV as AppEnvironment,
    logLevel: env.LOG_LEVEL as LogLevel,
    port: env.PORT,
    deviceBusyTimeout: env.DEVICE_BUSY_TIMEOUT,
    otelServiceName: env.OTEL_SERVICE_NAME,
    otelUrl: env.OTEL_URL,
    db: {
      uri: env.MONGO_CONN || env.MONGO_URI!,
    },
    redis: {
      url: env.REDIS_URL,
      prefix: env.REDIS_PREFIX,
    },
    broker: {
      servers: env.BROKER_SERVERS.split(',').map((s) => s.trim()),
      queue: env.BROKER_QUEUE,
      authToken: env.BROKER_AUTH_TOKEN,
      userJwt: env.BROKER_USER_JWT,
      userSeed: env.BROKER_USER_SEED,
    },
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
    },
    corsOrigin: env.CORS_ORIGIN,
  };
}
