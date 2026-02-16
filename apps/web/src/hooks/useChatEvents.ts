'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useNats } from '@/contexts/NatsContext';
import { useAuth } from '@/contexts/AuthContext';
import type { ChatMessage } from '@/types/chat';

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

export function useChatEvents(handlers: ChatEventHandlers) {
  const { isConnected, subscribe } = useNats();
  const { user } = useAuth();
  const subscriptionsRef = useRef<Map<string, any>>(new Map());
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!isConnected || !user) {
      for (const [_key, sub] of subscriptionsRef.current.entries()) {
        if (sub) {
          try {
            sub.unsubscribe();
          } catch (error) {
            console.error('[useChatEvents] Error unsubscribing:', error);
          }
        }
      }
      subscriptionsRef.current.clear();
      return;
    }

    if (!subscribe) {
      console.error('[useChatEvents] Subscribe function not available');
      return;
    }

    // Subscribe to new messages
    if (handlersRef.current.onMessageNew) {
      const topic = `chat.user.${user.id}.message.new`;
      console.log(`[useChatEvents] Subscribing to ${topic}`);
      
      const sub = subscribe(topic, (_topic: string, data: MessageNewPayload) => {
        handlersRef.current.onMessageNew?.(data);
      });
      subscriptionsRef.current.set(ChatEventType.MESSAGE_NEW, sub);
    }

    // Subscribe to message read status
    if (handlersRef.current.onMessageRead) {
      const topic = `chat.user.${user.id}.message.read`;
      console.log(`[useChatEvents] Subscribing to ${topic}`);
      
      const sub = subscribe(topic, (_topic: string, data: MessageReadPayload) => {
        handlersRef.current.onMessageRead?.(data);
      });
      subscriptionsRef.current.set(ChatEventType.MESSAGE_READ, sub);
    }

    // Subscribe to typing indicators
    if (handlersRef.current.onTyping) {
      const topic = `chat.user.${user.id}.typing`;
      console.log(`[useChatEvents] Subscribing to ${topic}`);
      
      const sub = subscribe(topic, (_topic: string, data: TypingPayload) => {
        handlersRef.current.onTyping?.(data);
      });
      subscriptionsRef.current.set(ChatEventType.TYPING, sub);
    }

    // Subscribe to presence updates
    if (handlersRef.current.onPresence) {
      const topic = 'chat.presence.online';
      console.log(`[useChatEvents] Subscribing to ${topic}`);
      
      const sub = subscribe(topic, (_topic: string, data: PresencePayload) => {
        handlersRef.current.onPresence?.(data);
      });
      subscriptionsRef.current.set(ChatEventType.PRESENCE, sub);
    }

    // Subscribe to notifications
    if (handlersRef.current.onNotification) {
      const topic = `chat.user.${user.id}.notification`;
      console.log(`[useChatEvents] Subscribing to ${topic}`);
      
      const sub = subscribe(topic, (_topic: string, data: NotificationPayload) => {
        handlersRef.current.onNotification?.(data);
      });
      subscriptionsRef.current.set(ChatEventType.NOTIFICATION, sub);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      console.log('[useChatEvents] Cleaning up subscriptions');
      for (const [key, sub] of subscriptionsRef.current.entries()) {
        if (sub) {
          try {
            console.log(`[useChatEvents] Unsubscribing from ${key}`);
            sub.unsubscribe();
          } catch (error) {
            console.error(`[useChatEvents] Error unsubscribing from ${key}:`, error);
          }
        }
      }
      subscriptionsRef.current.clear();
    };
  }, [isConnected, user, subscribe]);

  // Return a manual cleanup function if needed
  const cleanup = useCallback(() => {
    for (const [_key, sub] of subscriptionsRef.current.entries()) {
      if (sub) {
        try {
          sub.unsubscribe();
        } catch (error) {
          console.error('[useChatEvents] Error in manual cleanup:', error);
        }
      }
    }
    subscriptionsRef.current.clear();
  }, []);

  return { cleanup };
}
