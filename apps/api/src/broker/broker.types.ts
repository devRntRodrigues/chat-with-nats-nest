export interface BrokerMicroserviceConfig {
  queue: string;
  subscriptions: string[];
}

/** Input for creating a NATS user credential (JWT or creds file). */
export interface CreateUserCredentialInput {
  /** User display name (e.g. user id or username). */
  name: string;
  /** Return format: JWT only or full creds file (default). */
  type?: 'jwt' | 'creds';
  /** Expiration in seconds from now; 0 or omit = no expiration. */
  exp?: number;
}
