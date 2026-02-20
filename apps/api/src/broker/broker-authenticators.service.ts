import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';
import * as nkeys from '@nats-io/nkeys';
import { AppConfig } from '@/config/app-config';
import { CreateUserCredentialInput } from './broker.types';

/** Internal claim shape for NATS user JWT. */
interface NatsUserClaim {
  iat: number;
  iss: string;
  exp: number;
  jti: string;
  name: string;
  nats: {
    issuer_account: string;
    pub?: Record<string, unknown>;
    sub?: Record<string, unknown>;
    type: string;
    version: number;
    tags?: string[];
  };
  sub: string;
}

@Injectable()
export default class BrokerAuthenticatorsService {
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();

  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  async createUserCredential(
    input: CreateUserCredentialInput,
  ): Promise<string> {
    const accountId = this.configService.get('broker.accountId', {
      infer: true,
    });
    const accountSeed = this.configService.get('broker.accountSeed', {
      infer: true,
    });
    if (!accountId || !accountSeed) {
      throw new Error(
        'BrokerAuthenticatorsService requires broker.accountId and broker.accountSeed to be set',
      );
    }

    const accountSigningKey = nkeys.fromSeed(this.encoder.encode(accountSeed));
    const accountSigningKeyPub = accountSigningKey.getPublicKey();

    const userKeyPair = nkeys.createUser();
    const userKeyPub = userKeyPair.getPublicKey();

    const claim = await this.createClaim(
      {
        name: input.name,
        exp: input.exp ?? 0,
        team: '*',
      },
      accountSigningKeyPub,
      userKeyPub,
      accountId,
    );

    const header = {
      typ: 'JWT',
      alg: 'ed25519-nkey',
    };

    const jwt = this.createJwt(header, claim, accountSigningKey);

    if (input.type === 'jwt') {
      return jwt;
    }

    const seedBytes = userKeyPair.getSeed();
    const seedStr = this.decoder.decode(seedBytes);

    return this.fmtCred(jwt, seedStr);
  }

  private createJwt(
    header: Record<string, unknown>,
    claim: NatsUserClaim,
    akp: nkeys.KeyPair,
  ): string {
    const headerBytes = this.encoder.encode(JSON.stringify(header));
    const claimBytes = this.encoder.encode(JSON.stringify(claim));

    const encHeader = this.toBase64Url(headerBytes);
    const encBody = this.toBase64Url(claimBytes);

    const signature = `${encHeader}.${encBody}`;
    const signatureBytes = this.encoder.encode(signature);

    const encSig = this.toBase64Url(akp.sign(signatureBytes));

    return `${encHeader}.${encBody}.${encSig}`;
  }

  private async createClaim(
    data: { name: string; exp: number; team: string },
    akp: string,
    ukp: string,
    issuerAccount: string,
  ): Promise<NatsUserClaim> {
    const iat = Math.floor(Date.now() / 1000);
    const exp = data.exp ? iat + data.exp : 0;

    const claim: NatsUserClaim = {
      iat,
      iss: akp,
      jti: '',
      exp,
      sub: ukp,
      name: data.name,
      nats: {
        issuer_account: issuerAccount,
        pub: {},
        sub: {},
        type: 'user',
        version: 2,
        tags: [`team:${data.team}`],
      },
    };

    const jti = await this.generateJti(claim);
    return { ...claim, jti };
  }

  private async generateJti(claim: object): Promise<string> {
    const data = this.encoder.encode(JSON.stringify(claim));
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hash));
    return this.base32Encode(hashArray);
  }

  private base32Encode(bytes: number[]): string {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let base32String = '';
    let buffer = 0;
    let bufferBitsLeft = 0;

    for (let i = 0; i < bytes.length; i++) {
      buffer = (buffer << 8) | bytes[i];
      bufferBitsLeft += 8;

      while (bufferBitsLeft >= 5) {
        base32String += base32Chars[(buffer >> (bufferBitsLeft - 5)) & 31];
        bufferBitsLeft -= 5;
      }
    }

    if (bufferBitsLeft > 0) {
      base32String += base32Chars[(buffer << (5 - bufferBitsLeft)) & 31];
    }

    return base32String;
  }

  private toBase64Url(input: Uint8Array): string {
    const chars = Array.from(input);
    const base64 = btoa(String.fromCharCode(...chars));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private fmtCred(jwt: string, seed: string): string {
    return `-----BEGIN NATS USER JWT-----
${jwt}
------END NATS USER JWT------

************************* IMPORTANT *************************
NKEY Seed printed below can be used sign and prove identity.
NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
${seed}
------END USER NKEY SEED------
*************************************************************`;
  }
}
