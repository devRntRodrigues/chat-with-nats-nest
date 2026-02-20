import { AppErrors } from '@/app.errors';
import { BrokerClientService } from '@/broker/broker-client.service';
import { runInDBTransaction } from '@/common/database.utils';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { OtelMethodCounter } from '@/common/otel/metrics/method-counter.decorator';
import { OtelSpan } from '@/common/otel/traces/span.decorator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { Cache } from 'cache-manager';
import { Connection, Model } from 'mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import { User, UserDocument } from '../user.schema';
import { CacheKeys } from '@/common/cache';
import { getContextPropagation } from '@/common/otel/traces/context-propagation';

export interface CreateUserHandlerCommand {
  token: string;
  createUserData: CreateUserDto;
}

export interface CreateUserHandlerOutput {
  user: Partial<UserDocument> | null;
  brokerCredential: Record<string, unknown> | null;
}

@Injectable()
export class CreateUserHandler implements ICommandHandler<
  CreateUserHandlerCommand,
  CreateUserHandlerOutput
> {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly brokerClientService: BrokerClientService,
  ) {}

  @OtelMethodCounter()
  @OtelSpan(CreateUserHandler.name, { args: [true] })
  async execute(
    command: CreateUserHandlerCommand,
  ): Promise<CreateUserHandlerOutput> {
    const { token, createUserData } = command;

    const isBirthdateValid = (birthdate: Date) => {
      const currentDate = new Date();
      const minDate = new Date().setFullYear(currentDate.getFullYear() - 100);

      return birthdate <= currentDate && birthdate > new Date(minDate);
    };

    if (
      createUserData.birthdate &&
      !isBirthdateValid(createUserData.birthdate)
    ) {
      throw AppErrors.userInvalidBirthdate({
        birthdate: createUserData.birthdate,
      });
    }

    const cache = await this.cacheManager.get<{ code: string; phone: string }>(
      `${CacheKeys.VERIFICATION_CODE}:${token}`,
    );

    if (!cache || cache.code !== createUserData.code) {
      throw AppErrors.invalidCache({ token });
    }

    const result = {
      user: null,
      brokerCredential: null,
    };

    await runInDBTransaction(this.connection, async (session) => {
      const user = await this.userModel.create([createUserData], { session });

      let responseChatApi: {
        data: any;
        error: any;
      } = {
        data: null,
        error: null,
      };
      const errorFromChatApi = 'Error from chat-api';

      responseChatApi = await this.brokerClientService.request(
        `chat-api.users.create`,
        {
          data: createUserData,
        },
        {
          headers: getContextPropagation(),
        },
      );
      if (responseChatApi.error) {
        throw AppErrors.internalServerError({
          message: errorFromChatApi,
        });
      }

      await this.userModel.updateOne(
        {
          _id: user[0]._id,
        },
        {
          externalId: responseChatApi.data.user._id,
        },
        {
          session,
        },
      );

      result.user = responseChatApi.data.user;
      result.brokerCredential = responseChatApi.data;
    });

    return result;
  }
}
