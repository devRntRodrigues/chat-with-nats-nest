import { AppErrors } from '@/app.errors';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { OtelMetricService } from '@/common/otel/metrics/metrics.service';
import { OtelSpan } from '@/common/otel/traces/span.decorator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import type { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../client.schema';
import { AccessTokensDto } from '../dto/access-tokens.dto';
import { CacheKeys } from '@/common/cache';
import { Logger } from '@/common/logger/logger';

export interface GenerateAccessTokensCommand extends AccessTokensDto {}

export interface GenerateAccessTokensHandlerOutput {
  token: string;
  scope: string;
  expiresIn: number;
  refreshToken?: string;
}

@Injectable()
export class GenerateAccessTokensHandler implements ICommandHandler<
  GenerateAccessTokensCommand,
  GenerateAccessTokensHandlerOutput
> {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly otelMetricService: OtelMetricService,
    private readonly logger: Logger,
  ) {}

  @OtelSpan(GenerateAccessTokensHandler.name, { args: [true] })
  async execute(
    command: GenerateAccessTokensCommand,
  ): Promise<GenerateAccessTokensHandlerOutput> {
    const { client_id, client_secret, grant_type, code, refresh_token, scope } =
      command;

    const client = await this.clientModel.findOne({
      clientId: client_id,
      secret: client_secret,
    });

    if (!client) {
      throw AppErrors.clientNotFound({ client_id });
    }

    switch (grant_type) {
      case 'authorization_code': {
        const codeInfo = await this.cacheManager.get<any>(
          `${CacheKeys.OAUTH_SIGN_IN_DATA}:${code}`,
        );

        await this.cacheManager.del(`${CacheKeys.OAUTH_SIGN_IN_DATA}:${code}`);

        if (!codeInfo) {
          throw AppErrors.invalidAuthorizationCode({
            code: code ?? 'Invalid code',
          });
        }

        const { clientId, userId } = codeInfo;

        if (clientId !== client_id) {
          throw AppErrors.invalidClientInformation({ client_id });
        }

        const [token, refreshToken] = await Promise.all([
          this.jwtService.signAsync(
            {
              clientId: client.id,
              userId,
              roles: client.roles,
            },
            {
              privateKey: client.privateKey,
              expiresIn: '1h',
              algorithm: 'RS256',
            },
          ),
          this.jwtService.signAsync(
            {
              clientId: client.id,
              userId,
              roles: client.roles,
            },
            {
              privateKey: client.privateKey,
              expiresIn: '30d',
              algorithm: 'RS256',
            },
          ),
        ]);

        this.otelMetricService.getCounter('login').add(1, {
          grant_type,
        });

        return {
          token,
          refreshToken,
          scope,
          expiresIn: 3600,
        };
      }

      case 'client_credentials': {
        const token = await this.jwtService.signAsync(
          {
            clientId: client_id,
            roles: client.roles,
            isAdmin: client.isAdmin,
          },
          {
            privateKey: client.privateKey,
            expiresIn: '1h',
            algorithm: 'RS256',
          },
        );

        this.otelMetricService.getCounter('login').add(1, {
          grant_type,
        });

        return {
          token,
          scope,
          expiresIn: 3600,
        };
      }

      case 'refresh_token': {
        let userId = '';
        try {
          const refreshToken = await this.jwtService.verifyAsync(
            refresh_token ?? '',
            {
              secret: client.privateKey,
              algorithms: ['RS256'],
            },
          );

          userId = refreshToken.userId;
        } catch (err) {
          this.logger.error(err);
          throw AppErrors.invalidSignature({
            refresh_token: refresh_token ?? 'Invalid refresh token',
          });
        }

        const [token, refreshToken] = await Promise.all([
          this.jwtService.signAsync(
            {
              clientId: client_id,
              userId,
              roles: client.roles,
            },
            {
              privateKey: client.privateKey,
              expiresIn: '1h',
              algorithm: 'RS256',
            },
          ),
          this.jwtService.signAsync(
            {
              clientId: client_id,
              userId,
            },
            {
              privateKey: client.privateKey,
              expiresIn: '30d',
              algorithm: 'RS256',
            },
          ),
        ]);

        return {
          token,
          refreshToken,
          scope,
          expiresIn: 3600,
        };
      }
      default: {
        throw AppErrors.invalidGrantType({ grant_type });
      }
    }
  }
}
