import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { User } from '../users/user.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getUnreadCounts(userId: string): Promise<Record<string, number>> {
    const unreadMessages = await this.messageModel.aggregate([
      {
        $match: {
          to: new Types.ObjectId(userId),
          read: false,
        },
      },
      {
        $group: {
          _id: { $toString: '$from' },
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadCounts: Record<string, number> = {};
    unreadMessages.forEach((item: { _id: Types.ObjectId; count: number }) => {
      unreadCounts[item._id.toString()] = item.count;
    });

    return unreadCounts;
  }

  async getConversationsWithUnread(userId: string) {
    const conversations = await this.conversationModel
      .find({
        participants: userId,
      })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'name username')
      .populate('lastMessage')
      .lean();

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant = conv.participants.find(
          (p: { _id: Types.ObjectId }) =>
            p._id.toString() !== userId.toString(),
        );

        const unreadCount = await this.messageModel.countDocuments({
          from: otherParticipant?._id,
          to: userId,
          read: false,
        });

        return {
          ...conv,
          unreadCount,
        };
      }),
    );

    return conversationsWithUnread;
  }

  async getMessagesBetweenUsers(
    currentUserId: string,
    otherUserId: string,
    limit: number = 20,
    cursor?: string,
  ) {
    if (!otherUserId || !Types.ObjectId.isValid(otherUserId)) {
      throw new NotFoundException('User ID is required');
    }

    const otherUser = await this.userModel.findById(otherUserId);
    if (!otherUser) {
      throw new NotFoundException('User not found');
    }

    const query: Record<string, unknown> = {
      $or: [
        { from: currentUserId, to: otherUserId },
        { from: otherUserId, to: currentUserId },
      ],
    };

    if (cursor && Types.ObjectId.isValid(cursor)) {
      query._id = { $gt: new Types.ObjectId(cursor) };
    }

    const messages = await this.messageModel
      .find(query)
      .sort({ _id: 1 })
      .limit(limit)
      .populate('from', 'name username')
      .populate('to', 'name username')
      .lean();

    const last = messages.at(-1) as { _id: Types.ObjectId } | undefined;
    const nextCursor =
      messages.length === limit && last ? last._id.toString() : null;

    return { messages, nextCursor };
  }
}
