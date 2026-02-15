import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/User';
import { BrokerClientService } from '@/broker/broker-client.service';

interface OnlineUser {
  userId: string;
  lastHeartbeat: number;
}

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private readonly onlineUsers = new Map<string, OnlineUser>();
  private readonly HEARTBEAT_TIMEOUT = 60000; // 60 seconds
  private readonly CLEANUP_INTERVAL = 10000; // 10 seconds

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly brokerClient: BrokerClientService,
  ) {
    // Start cleanup interval
    this.startCleanupInterval();
  }

  async handleHeartbeat(userId: string): Promise<void> {
    const now = Date.now();
    const wasOffline = !this.onlineUsers.has(userId);

    this.onlineUsers.set(userId, {
      userId,
      lastHeartbeat: now,
    });

    // Update last seen in database
    await this.userModel.findByIdAndUpdate(userId, {
      lastSeen: new Date(now),
    });

    if (wasOffline) {
      this.logger.log(`User ${userId} is now online`);
      await this.broadcastOnlineUsers();
    }
  }

  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.keys());
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupOfflineUsers();
    }, this.CLEANUP_INTERVAL);
  }

  private async cleanupOfflineUsers(): Promise<void> {
    const now = Date.now();
    const offlineUserIds: string[] = [];

    for (const [userId, userData] of this.onlineUsers.entries()) {
      if (now - userData.lastHeartbeat > this.HEARTBEAT_TIMEOUT) {
        offlineUserIds.push(userId);
        this.onlineUsers.delete(userId);
      }
    }

    if (offlineUserIds.length > 0) {
      this.logger.log(
        `Marking ${offlineUserIds.length} users as offline: ${offlineUserIds.join(', ')}`,
      );
      await this.broadcastOnlineUsers();
    }
  }

  private async broadcastOnlineUsers(): Promise<void> {
    const onlineUserIds = this.getOnlineUsers();
    
    this.brokerClient.publish('chat.presence.online', {
      userIds: onlineUserIds,
      timestamp: Date.now(),
    });

    this.logger.debug(
      `Broadcasted online users: ${onlineUserIds.length} users`,
    );
  }

  async removeUser(userId: string): Promise<void> {
    if (this.onlineUsers.has(userId)) {
      this.onlineUsers.delete(userId);
      this.logger.log(`User ${userId} explicitly disconnected`);
      await this.broadcastOnlineUsers();
    }
  }
}
