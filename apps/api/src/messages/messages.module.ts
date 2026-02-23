import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '@/models/Message';
import { Conversation, ConversationSchema } from '@/models/Conversation';
import { User, UserSchema } from '@/users/user.schema';
import { MessagesController } from './messages.controller';
import { MessageService } from '@/messages/message.service';
import { MessageHandlerService } from '@/messages/handlers/message-handler.service';
import { OAuthModule } from '@/oauth/oauth.module';
import { BrokerModule } from '@/broker/broker.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    OAuthModule,
    BrokerModule,
  ],
  controllers: [MessagesController],
  providers: [MessageService, MessageHandlerService],
  exports: [MessageService, MessageHandlerService],
})
export class MessagesModule {}
