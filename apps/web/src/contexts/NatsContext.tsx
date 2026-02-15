'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  ConnectionError,
  tokenAuthenticator,
  headers,
  NatsConnection,
  PublishOptions,
  RequestOptions,
  Subscription,
  SubscriptionOptions,
  TimeoutError,
  wsconnect,
} from "@nats-io/nats-core";
import { delay } from "@/utils/delay";
import { useAuth } from "./AuthContext";

export type BrokerPayload = Record<string, any>;

export type MqttHandler<T extends BrokerPayload> = (
  topic: string,
  payload: T,
) => any;

const API_VERSION = "4";

export async function createConnection(
  clientId: string,
  userId: string,
  authenticator: string,
): Promise<BrokerClient> {
  const server = process.env.NEXT_PUBLIC_NATS_WS_URL;
  const maxAttempts = 5;
  const delayMs = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.debug(
      `BROKER [${clientId}] attempt ${attempt} of ${maxAttempts} connecting to broker`,
    );

    try {
      const connection = await wsconnect({
        name: clientId,
        servers: server,
        authenticator: tokenAuthenticator(authenticator),
        tls: null,
        debug: false,
        inboxPrefix: `${userId}._INBOX`,
        maxReconnectAttempts: maxAttempts,
        reconnectTimeWait: delayMs,
      });

      connection.closed().then((err) => {
        console.log(
          `BROKER [${clientId}] connection closed${err ? " with error: " + err.message : ""}`,
        );
      });

      (async () => {
        console.log(`BROKER [${clientId}] connected ${connection.getServer()}`);
        for await (const s of connection.status()) {
          console.log(`BROKER [${clientId}] ${s.type}: ${JSON.stringify(s)}`);
        }
      })().then();

      return new BrokerClient(clientId, connection);
    } catch (error) {
      if (error instanceof ConnectionError) {
        if (attempt >= maxAttempts) {
          break;
        }
        console.debug(
          `BROKER [${clientId}] retrying connection in ${delayMs}ms (ConnectionError)`,
        );
        await delay(delayMs);
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    `BROKER [${clientId}] failed to connect after ${maxAttempts} attempts`,
  );
}

export class BrokerClient {
  public readonly connection: NatsConnection;
  readonly clientId: string;
  readonly appName: string;

  constructor(clientId: string, connection: NatsConnection) {
    this.connection = connection;
    this.clientId = clientId;
    this.appName = "chat-web";
  }

  public async disconnect(graceful: boolean = true): Promise<void> {
    if (graceful) {
      await this.connection?.drain();
    } else {
      await this.connection?.close();
    }

    this.connection?.closed().then((err) => {
      const m = `BROKER [${this.clientId}] connection closed`;
      console.log(`${m} ${err ? err.message : ""}`);
    });
  }

  public subscribe<T extends BrokerPayload>(
    topic: string,
    handler: MqttHandler<T>,
    options?: SubscriptionOptions & {
      onTimeout?: (topic: string, error: Error) => void;
    },
  ): Subscription {
    console.log(`BROKER [${this.clientId}] subscription to topic [${topic}]`);
    const subscription = this.connection.subscribe(topic, options);

    (async () => {
      for await (const message of subscription) {
        try {
          const processedMessage: any = message.json();
          console.log(
            `BROKER [${this.clientId}] receive subscription from topic [${message.subject}] with payload`,
            processedMessage,
          );

          void handler(message.subject, processedMessage);
        } catch (error) {
          console.error(
            `BROKER [${this.clientId}] error processing message =>`,
            error,
          );
        }
      }
    })().catch((error) => {
      if (error instanceof TimeoutError) {
        options?.onTimeout?.(topic, error);
      } else {
        console.error(
          `BROKER [${this.clientId}] error on subscription iterator =>`,
          error,
        );
      }
    });

    return subscription;
  }

  public publish<T extends BrokerPayload>(
    topic: string,
    payload: T,
    opts?: Partial<PublishOptions>,
  ): void {
    const hdrs = opts?.headers || headers();
    hdrs.set("X-Origin", this.appName);
    hdrs.set("X-Api-Version", API_VERSION);

    console.log(
      `BROKER [${this.clientId}] publish to topic [${topic}] with payload`,
      Object.fromEntries(
        hdrs.keys().map((key) => [key, hdrs.values(key).join(", ")]),
      ),
      payload,
    );

    this.connection.publish(topic, JSON.stringify(payload), {
      ...opts,
      headers: hdrs,
    });
  }

  public async request<R = any>(
    topic: string,
    payload: any,
    opts?: Partial<RequestOptions>,
  ): Promise<R> {
    const hdrs = opts?.headers || headers();
    hdrs.set("X-Origin", this.appName);
    hdrs.set("X-Api-Version", API_VERSION);

    console.log(
      `BROKER [${this.clientId}] send request to topic [${topic}] with payload`,
      Object.fromEntries(
        hdrs.keys().map((key) => [key, hdrs.values(key).join(", ")]),
      ),
      payload,
    );

    try {
      const reply = await this.connection.request(
        topic,
        JSON.stringify(payload),
        { timeout: 15000, ...opts, headers: hdrs },
      );

      const data = reply.json();

      console.log(
        `BROKER [${this.clientId}] receive reply from topic [${topic}] with payload`,
        data,
      );

      return data as R;
    } catch (e) {
      console.error(e);
      console.error(`BROKER [${this.clientId}] problem with request: ${e}`);
      throw e;
    }
  }

  public isConnected(): boolean {
    return !this.connection.isClosed();
  }
}

export interface NatsContextValue {
  client: BrokerClient | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  subscribe: BrokerClient["subscribe"] | null;
  publish: BrokerClient["publish"] | null;
  request: BrokerClient["request"] | null;
}

const NatsContext = createContext<NatsContextValue | undefined>(undefined);

export function NatsProvider({ children }: { children: ReactNode }) {
  const { user, authenticator } = useAuth();
  const [client, setClient] = useState<BrokerClient | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !authenticator) {
      if (client) {
        console.log("NATS: User logged out, disconnecting...");
        client.disconnect(true).catch((err) => {
          console.error("NATS: Error disconnecting:", err);
        });
        setClient(null);
      }
      setError(null);
      setIsConnecting(false);
      return;
    }

    if (user && authenticator && !client && !isConnecting) {
      const clientId = `chat-web-${user.id}`;
      console.log("NATS: Connecting with clientId:", clientId);
      
      setIsConnecting(true);
      setError(null);

      createConnection(clientId, user.id, authenticator)
        .then((brokerClient) => {
          console.log("NATS: Connected successfully");
          setClient(brokerClient);
          setError(null);
        })
        .catch((err) => {
          console.error("NATS: Connection failed:", err);
          setError(err.message || "Failed to connect to NATS");
        })
        .finally(() => {
          setIsConnecting(false);
        });
    }

    return () => {
      if (client) {
        console.log("NATS: Component unmounting, disconnecting...");
        client.disconnect(true).catch((err) => {
          console.error("NATS: Error disconnecting on unmount:", err);
        });
      }
    };
  }, [user, authenticator]);

  const value: NatsContextValue = {
    client,
    isConnected: client?.isConnected() ?? false,
    isConnecting,
    error,
    subscribe: client?.subscribe.bind(client) ?? null,
    publish: client?.publish.bind(client) ?? null,
    request: client?.request.bind(client) ?? null,
  };

  return <NatsContext.Provider value={value}>{children}</NatsContext.Provider>;
}

export function useNats(): NatsContextValue {
  const context = useContext(NatsContext);
  if (!context) {
    throw new Error("useNats must be used within a NatsProvider");
  }
  return context;
}
