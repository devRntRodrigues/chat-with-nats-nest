import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from '@/models/Message';
import { Conversation } from '@/models/Conversation';
import { User } from '../../users/user.schema';
import { BrokerClientService } from '@/broker/broker-client.service';
import type { Msg } from '@nats-io/nats-core';

interface SendMessagePayload {
  from: string;
  to: string;
  content: string;
}

interface MarkReadPayload {
  userId: string;
  messageIds: string[];
}

interface TypingPayload {
  from: string;
  to: string;
  username: string;
}

@Injectable()
export class MessageHandlerService implements OnModuleInit {
  private readonly logger = new Logger(MessageHandlerService.name);

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly brokerClient: BrokerClientService,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing NATS message handlers...');

    this.brokerClient.subscribe(
      'chat.message.send',
      this.handleSendMessage.bind(this),
    );

    this.brokerClient.subscribe(
      'chat.message.read',
      this.handleMarkRead.bind(this),
    );

    this.brokerClient.subscribe(
      'chat.typing.start',
      this.handleTypingStart.bind(this),
    );

    this.brokerClient.subscribe(
      'chat.typing.stop',
      this.handleTypingStop.bind(this),
    );

    this.logger.log('NATS message handlers initialized');
  }

  private async handleSendMessage(
    _subject: string,
    payload: SendMessagePayload,
    msg: Msg,
  ): Promise<void> {
    try {
      const { from, to, content } = payload;

      if (!Types.ObjectId.isValid(from) || !Types.ObjectId.isValid(to)) {
        if (msg.reply) {
          msg.respond(
            JSON.stringify({
              success: false,
              error: 'Invalid user IDs',
            }),
          );
        }
        return;
      }

      const [fromUser, toUser] = await Promise.all([
        this.userModel.findById(from),
        this.userModel.findById(to),
      ]);

      if (!fromUser || !toUser) {
        if (msg.reply) {
          msg.respond(
            JSON.stringify({
              success: false,
              error: 'User not found',
            }),
          );
        }
        return;
      }

      const message = await this.messageModel.create({
        from: new Types.ObjectId(from),
        to: new Types.ObjectId(to),
        content: content.trim(),
        read: false,
      });

      const participants = [
        new Types.ObjectId(from),
        new Types.ObjectId(to),
      ].sort((a, b) => a.toString().localeCompare(b.toString()));

      await this.conversationModel.findOneAndUpdate(
        { participants },
        {
          lastMessage: message._id,
          lastMessagePreview: content.substring(0, 100),
          lastMessageAt: new Date(),
        },
        { upsert: true, new: true },
      );

      const populatedMessage = await this.messageModel
        .findById(message._id)
        .populate('from', 'name username')
        .populate('to', 'name username')
        .lean();

      if (msg.reply) {
        msg.respond(
          JSON.stringify({
            success: true,
            message: populatedMessage,
          }),
        );
      }

      this.brokerClient.publish(`chat.user.${to}.message.new`, {
        message: populatedMessage,
      });

      this.brokerClient.publish(`chat.user.${to}.notification`, {
        id: message._id.toString(),
        type: 'message',
        from: {
          id: fromUser._id.toString(),
          name: fromUser.name,
          username: fromUser.username,
        },
        message: 'New message',
        preview: content.substring(0, 100),
        conversationId: from,
        timestamp: message.createdAt,
      });

      this.logger.log(`Message sent from ${from} to ${to}`);
    } catch (error) {
      this.logger.error('Error handling send message', error);
      if (msg.reply) {
        msg.respond(
          JSON.stringify({
            success: false,
            error: 'Failed to send message',
          }),
        );
      }
    }
  }

  private async handleMarkRead(
    _subject: string,
    payload: MarkReadPayload,
  ): Promise<void> {
    try {
      const { userId, messageIds } = payload;

      if (!messageIds || messageIds.length === 0) {
        return;
      }

      const validMessageIds = messageIds.filter((id) =>
        Types.ObjectId.isValid(id),
      );

      if (validMessageIds.length === 0) {
        return;
      }

      const result = await this.messageModel.updateMany(
        {
          _id: { $in: validMessageIds.map((id) => new Types.ObjectId(id)) },
          to: new Types.ObjectId(userId),
          read: false,
        },
        {
          read: true,
          readAt: new Date(),
        },
      );

      if (result.modifiedCount > 0) {
        const messages = await this.messageModel
          .find({
            _id: { $in: validMessageIds.map((id) => new Types.ObjectId(id)) },
          })
          .lean();

        const senderIds = new Set(messages.map((m) => m.from.toString()));

        for (const senderId of senderIds) {
          const senderMessageIds = messages
            .filter((m) => m.from.toString() === senderId)
            .map((m) => m._id.toString());

          this.brokerClient.publish(`chat.user.${senderId}.message.read`, {
            messageIds: senderMessageIds,
            conversationId: userId, // userId de quem marcou como lida
          });
        }

        this.logger.log(
          `Marked ${result.modifiedCount} messages as read for user ${userId}`,
        );
      }
    } catch (error) {
      this.logger.error('Error handling mark read', error);
    }
  }

  private handleTypingStart(_subject: string, payload: TypingPayload): void {
    try {
      const { from, to, username } = payload;

      this.brokerClient.publish(`chat.user.${to}.typing`, {
        action: 'start',
        from,
        username,
      });

      this.logger.debug(`User ${from} started typing to ${to}`);
    } catch (error) {
      this.logger.error('Error handling typing start', error);
    }
  }

  private handleTypingStop(_subject: string, payload: TypingPayload): void {
    try {
      const { from, to } = payload;

      this.brokerClient.publish(`chat.user.${to}.typing`, {
        action: 'stop',
        from,
      });

      this.logger.debug(`User ${from} stopped typing to ${to}`);
    } catch (error) {
      this.logger.error('Error handling typing stop', error);
    }
  }
}
