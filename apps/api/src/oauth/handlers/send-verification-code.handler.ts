import { AppErrors } from '@/app.errors';
import { CacheKeys } from '@/common/cache';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { OtelSpan } from '@/common/otel/traces/span.decorator';
import { generateSMSCode } from '@/common/utils';
import { FindUserByPhoneHandler } from '@/users/handlers/find-user-by-phone.handler';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { SendVerificationCodeDto } from '../dto/send-verification-code.dto';

export interface SendVerificationCodeHandlerOutput {
  message: string;
  user: {
    _id: string;
    phone: string;
    externalId: string;
  };
}

@Injectable()
export class SendVerificationCodeHandler
  implements
    ICommandHandler<
      SendVerificationCodeDto,
      SendVerificationCodeHandlerOutput
    >
{
  private readonly logger = new Logger(SendVerificationCodeHandler.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly findUserByPhoneHandler: FindUserByPhoneHandler,
  ) {}

  @OtelSpan(SendVerificationCodeHandler.name)
  async execute(
    command: SendVerificationCodeDto,
  ): Promise<SendVerificationCodeHandlerOutput> {
    const { phone } = command;

    const user = await this.findUserByPhoneHandler.execute({ phone });

    if (!user) {
      this.logger.error('User not found');
      throw AppErrors.userNotFound({ phone });
    }

    const code = generateSMSCode(6);

    const key = user._id.toString();
    const value = {
      code,
      attempts: 0,
    };
    const ttl = 2 * 60 * 1000; // 2 minutes

    await this.cacheManager.set(
      `${CacheKeys.VERIFICATION_CODE}:${key}`,
      value,
      ttl,
    );

    this.logger.debug(`Verification code stored for user ${key}`);

    return {
      message: 'Verification code generated',
      user: {
        _id: user._id.toString(),
        phone: user.phone,
        externalId: user.externalId,
      },
    };
  }
}
