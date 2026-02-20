import * as crypto from 'node:crypto';
import { promisify } from 'node:util';

export const generateKeyPair = promisify(crypto.generateKeyPair);

export const generateClientSecret = (): string =>
  crypto.randomBytes(32).toString('hex');

export const generateClientCredentials = () => {
  const prefix = 'WeChat.oa2-client';
  const seed = crypto.randomBytes(16).toString('hex');

  const clientId = `${prefix}.${seed}`;
  const clientSecret = generateClientSecret();

  return {
    clientId,
    clientSecret,
  };
};
