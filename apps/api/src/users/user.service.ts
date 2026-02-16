import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/User';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getCurrentUserById(userId: string) {
    const user = await this.userModel.findById(userId).lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getAllUsersExcept(currentUserId: string) {
    const users = await this.userModel
      .find({
        _id: { $ne: currentUserId },
      })
      .select('_id name username createdAt lastSeen')
      .sort({ name: 1 })
      .lean();

    return users;
  }
}
