import type { ChatMessage } from './chat';

export enum ChatEventType {
  MESSAGE_NEW = 'message.new',
  MESSAGE_READ = 'message.read',
  TYPING = 'typing',
  PRESENCE = 'presence',
  NOTIFICATION = 'notification',
}

export interface MessageNewPayload {
  message: ChatMessage;
}

export interface MessageReadPayload {
  messageIds: string[];
  conversationId: string;
}

export interface TypingPayload {
  action: 'start' | 'stop';
  from: string;
  username?: string;
}

export interface PresencePayload {
  userIds: string[];
  timestamp: number;
}

export interface NotificationPayload {
  id: string;
  type: string;
  from: {
    id: string;
    name: string;
    username: string;
  };
  message: string;
  preview: string;
  conversationId: string;
  timestamp: Date;
}

export type MessageNewHandler = (payload: MessageNewPayload) => void;
export type MessageReadHandler = (payload: MessageReadPayload) => void;
export type TypingHandler = (payload: TypingPayload) => void;
export type PresenceHandler = (payload: PresencePayload) => void;
export type NotificationHandler = (payload: NotificationPayload) => void;

export interface ChatEventHandlers {
  onMessageNew?: MessageNewHandler;
  onMessageRead?: MessageReadHandler;
  onTyping?: TypingHandler;
  onPresence?: PresenceHandler;
  onNotification?: NotificationHandler;
}
