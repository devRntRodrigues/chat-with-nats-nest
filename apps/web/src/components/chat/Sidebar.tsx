'use client';

import { useEffect, useState } from 'react';
import { chatApi } from '@/lib/chatApi';
import { UserListItem } from './UserListItem';
import type { ChatUser } from '@/types/chat';

interface SidebarProps {
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onlineUsers: Set<string>;
  getUnreadCount?: (userId: string) => number;
}

export function Sidebar({
  selectedUserId,
  onSelectUser,
  onlineUsers,
  getUnreadCount,
}: SidebarProps) {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedUsers = await chatApi.getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col items-center justify-center p-4">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadUsers}
          className="px-4 py-2 bg-gradient-purple text-white rounded-lg hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold gradient-text">Messages</h2>
        <p className="text-sm text-gray-500 mt-1">{onlineUsers.size} online</p>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto">
        {users.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No users available</div>
        ) : (
          <div>
            {users.map((user) => (
              <UserListItem
                key={user._id}
                user={user}
                isOnline={onlineUsers.has(user._id)}
                isSelected={selectedUserId === user._id}
                unreadCount={getUnreadCount ? getUnreadCount(user._id) : 0}
                onClick={() => onSelectUser(user._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
