export interface ChatUser {
  _id: string;
  name: string;
  username: string;
  createdAt?: string;
  lastSeen?: string;
}

export interface ChatMessage {
  _id: string;
  from: ChatUser | string;
  to: ChatUser | string;
  content: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: ChatUser[];
  lastMessage?: ChatMessage | string;
  lastMessagePreview: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

export interface TypingUser {
  userId: string;
  username: string;
}
