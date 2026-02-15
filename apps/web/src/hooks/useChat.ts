'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNats } from '@/contexts/NatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { chatApi } from '@/lib/chatApi';
import type { ChatMessage } from '@/types/chat';
import { usePresence } from './usePresence';
import {
  useChatEvents,
  type MessageNewPayload,
  type MessageReadPayload,
  type TypingPayload,
  type NotificationPayload,
} from './useChatEvents';

export function useChat() {
  const { isConnected, request, publish } = useNats();
  const { user } = useAuth();
  const { onlineUsers } = usePresence();
  const { addNotification, incrementUnread, markAsRead, getUnreadCount, syncUnreadCounts } =
    useNotifications();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const syncUnread = async () => {
      try {
        const counts = await chatApi.getUnreadCounts();
        syncUnreadCounts(counts);
      } catch (error) {
        console.error('Failed to sync unread counts:', error);
      }
    };

    syncUnread();
  }, [user, syncUnreadCounts]);

  useEffect(() => {
    if (!selectedUserId) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const fetchedMessages = await chatApi.getMessages(selectedUserId);
        setMessages((prev) => ({
          ...prev,
          [selectedUserId]: fetchedMessages,
        }));
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!messages[selectedUserId]) {
      loadMessages();
    }
  }, [messages, selectedUserId]);

  useChatEvents({
    onMessageNew: useCallback((data: MessageNewPayload) => {
      const message = data.message;
      const fromId = typeof message.from === 'string' ? message.from : message.from._id;
      const toId = typeof message.to === 'string' ? message.to : message.to._id;
      const conversationUserId = fromId === user?.id ? toId : fromId;

      setMessages((prev) => ({
        ...prev,
        [conversationUserId]: [...(prev[conversationUserId] || []), message],
      }));

      if (selectedUserId !== conversationUserId) {
        incrementUnread(conversationUserId);
      }
    }, [user, selectedUserId, incrementUnread]),

    onMessageRead: useCallback((data: MessageReadPayload) => {
      setMessages((prev) => {
        const newMessages = { ...prev };
        Object.keys(newMessages).forEach((userId) => {
          newMessages[userId] = newMessages[userId].map((msg) =>
            data.messageIds.includes(msg._id)
              ? { ...msg, read: true, readAt: new Date().toISOString() }
              : msg
          );
        });
        return newMessages;
      });
    }, []),

    onTyping: useCallback((data: TypingPayload) => {
      if (data.action === 'start' && data.username) {
        setTypingUsers((prev) => ({
          ...prev,
          [data.from]: data.username!,
        }));

        setTimeout(() => {
          setTypingUsers((prev) => {
            const { [data.from]: _, ...rest } = prev;
            return rest;
          });
        }, 3000);
      } else if (data.action === 'stop') {
        setTypingUsers((prev) => {
          const { [data.from]: _, ...rest } = prev;
          return rest;
        });
      }
    }, []),

    onNotification: useCallback((data: NotificationPayload) => {
      if (selectedUserId !== data.conversationId) {
        addNotification(data);
      }
    }, [selectedUserId, addNotification]),
  });

  useEffect(() => {
    if (!selectedUserId || !user || !isConnected || !publish) return;

    const conversationMessages = messages[selectedUserId] || [];
    const unreadMessageIds = conversationMessages
      .filter((msg) => {
        const fromId = typeof msg.from === 'string' ? msg.from : msg.from._id;
        return fromId === selectedUserId && !msg.read;
      })
      .map((msg) => msg._id);

    if (unreadMessageIds.length > 0) {
      publish('chat.message.read', {
        userId: user.id,
        messageIds: unreadMessageIds,
      });
    }
  }, [selectedUserId, messages, user, isConnected, publish]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!isConnected || !selectedUserId || !content.trim() || !user || !request) return;

      try {
        const response = await request('chat.message.send', {
          from: user.id,
          to: selectedUserId,
          content: content.trim(),
        });

        if (response.success && response.message) {
          setMessages((prev) => ({
            ...prev,
            [selectedUserId]: [...(prev[selectedUserId] || []), response.message],
          }));
        } else if (response.error) {
          console.error('Failed to send message:', response.error);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    },
    [isConnected, selectedUserId, user, request]
  );

  const sendTypingStart = useCallback(() => {
    if (!isConnected || !selectedUserId || !user || !publish) return;
    
    publish('chat.typing.start', {
      from: user.id,
      to: selectedUserId,
      username: user.name,
    });
  }, [isConnected, selectedUserId, user, publish]);

  const sendTypingStop = useCallback(() => {
    if (!isConnected || !selectedUserId || !user || !publish) return;
    
    publish('chat.typing.stop', {
      from: user.id,
      to: selectedUserId,
      username: user.name,
    });
  }, [isConnected, selectedUserId, user, publish]);

  const selectUser = useCallback(
    (userId: string) => {
      setSelectedUserId(userId);
      markAsRead(userId);
    },
    [markAsRead]
  );

  return {
    selectedUserId,
    setSelectedUserId: selectUser,
    messages: messages[selectedUserId || ''] || [],
    loading,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    typingUsername: selectedUserId ? typingUsers[selectedUserId] || null : null,
    onlineUsers,
    getUnreadCount,
  };
}
