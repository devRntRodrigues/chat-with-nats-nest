import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Message, MessageSchema } from '@/models/Message';
import { Conversation, ConversationSchema } from '@/models/Conversation';
import { User, UserSchema } from '@/models/User';
import { MessagesController } from './messages.controller';
import { MessageService } from '@/messages/message.service';
import { MessageHandlerService } from '@/messages/handlers/message-handler.service';
import { JwtStrategy } from '@/config/passport';
import { BrokerModule } from '@/broker/broker.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    BrokerModule,
  ],
  controllers: [MessagesController],
  providers: [MessageService, MessageHandlerService, JwtStrategy],
  exports: [MessageService, MessageHandlerService],
})
export class MessagesModule {}
