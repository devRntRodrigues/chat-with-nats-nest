'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/Button';

export function ChatHeader() {
  const { user, logout } = useAuth();
  const { totalUnread } = useNotifications();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title with badge */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <h1 className="text-2xl font-bold gradient-text">💬 Chat</h1>
            {totalUnread > 0 && (
              <div className="absolute -top-2 -right-6 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                {totalUnread > 99 ? '99+' : totalUnread}
              </div>
            )}
          </div>
        </div>

        {/* Right side - User info and logout */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{user?.name}</div>
            <div className="text-xs text-gray-500">@{user?.username}</div>
          </div>
          <Button variant="secondary" onClick={logout} className="text-sm">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
