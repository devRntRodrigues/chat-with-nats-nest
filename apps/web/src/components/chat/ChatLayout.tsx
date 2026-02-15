'use client';

import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { ChatHeader } from './ChatHeader';
import { ToastContainer } from '@/components/notifications/ToastContainer';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useState, useEffect } from 'react';
import { chatApi } from '@/lib/chatApi';
import type { ChatUser } from '@/types/chat';

export function ChatLayout() {
  const { user } = useAuth();
  const {
    selectedUserId,
    setSelectedUserId,
    messages,
    loading,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    typingUsername,
    onlineUsers,
    getUnreadCount,
  } = useChat();

  const { notifications, removeNotification } = useNotifications();

  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [users, setUsers] = useState<ChatUser[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await chatApi.getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      const user = users.find((u) => u._id === selectedUserId);
      setSelectedUser(user || null);
    } else {
      setSelectedUser(null);
    }
  }, [selectedUserId, users]);

  const handleToastClick = (conversationId: string) => {
    setSelectedUserId(conversationId);
  };

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
          onlineUsers={onlineUsers}
          getUnreadCount={getUnreadCount}
        />
        <ChatArea
          selectedUser={selectedUser}
          messages={messages}
          currentUserId={user?.id || ''}
          onSendMessage={sendMessage}
          onTypingStart={sendTypingStart}
          onTypingStop={sendTypingStop}
          typingUsername={typingUsername}
          loading={loading}
        />
      </div>
      <ToastContainer
        toasts={notifications}
        onDismiss={removeNotification}
        onToastClick={handleToastClick}
      />
    </div>
  );
}
