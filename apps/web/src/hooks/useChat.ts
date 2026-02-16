'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const loadedConversationsRef = useRef<Set<string>>(new Set());
  const typingTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const publishedReadIdsRef = useRef<Set<string>>(new Set());

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

    if (loadedConversationsRef.current.has(selectedUserId)) return;

    let isCancelled = false;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const fetchedMessages = await chatApi.getMessages(selectedUserId);

        if (isCancelled) return;

        setMessages((prev) => ({
          ...prev,
          [selectedUserId]: fetchedMessages,
        }));

        loadedConversationsRef.current.add(selectedUserId);
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load messages:', error);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      isCancelled = true;
    };
  }, [selectedUserId]);

  useEffect(() => {
    return () => {
      typingTimersRef.current.forEach((timerId) => {
        clearTimeout(timerId);
      });
      typingTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!isConnected) {
      publishedReadIdsRef.current.clear();
    }
  }, [isConnected]);

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
        const { conversationId, messageIds } = data;
        
        if (!conversationId || !prev[conversationId]) {
          return prev;
        }
        
        const idsToMark = new Set(messageIds);
        let hasChanges = false;
        
        const updatedMessages = prev[conversationId].map((msg) => {
          if (idsToMark.has(msg._id) && !msg.read) {
            hasChanges = true;
            return { ...msg, read: true, readAt: new Date().toISOString() };
          }
          return msg;
        });
        
        if (!hasChanges) {
          return prev;
        }
        
        return {
          ...prev,
          [conversationId]: updatedMessages,
        };
      });
      
      data.messageIds.forEach(id => publishedReadIdsRef.current.delete(id));
    }, []),

    onTyping: useCallback((data: TypingPayload) => {
      const existingTimer = typingTimersRef.current.get(data.from);
      if (existingTimer) {
        clearTimeout(existingTimer);
        typingTimersRef.current.delete(data.from);
      }

      if (data.action === 'start' && data.username) {
        setTypingUsers((prev) => ({
          ...prev,
          [data.from]: data.username!,
        }));

        const timerId = setTimeout(() => {
          setTypingUsers((prev) => {
            const { [data.from]: _, ...rest } = prev;
            return rest;
          });
          typingTimersRef.current.delete(data.from);
        }, 3000);
        
        typingTimersRef.current.set(data.from, timerId);
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
        return (
          fromId === selectedUserId && 
          !msg.read && 
          !publishedReadIdsRef.current.has(msg._id)
        );
      })
      .map((msg) => msg._id);

    if (unreadMessageIds.length === 0) return;

    setMessages((prev) => {
      const conversationMessages = prev[selectedUserId] || [];
      const idsToMark = new Set(unreadMessageIds);
      
      const updatedMessages = conversationMessages.map((msg) => {
        if (idsToMark.has(msg._id) && !msg.read) {
          return { 
            ...msg, 
            read: true, 
            readAt: new Date().toISOString() 
          };
        }
        return msg;
      });
      
      return {
        ...prev,
        [selectedUserId]: updatedMessages,
      };
    });

    unreadMessageIds.forEach(id => publishedReadIdsRef.current.add(id));

    publish('chat.message.read', {
      userId: user.id,
      messageIds: unreadMessageIds,
    });
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
