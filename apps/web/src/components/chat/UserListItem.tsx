import type { ChatUser } from '@/types/chat';
import { OnlineStatus } from './OnlineStatus';
import { UnreadBadge } from '@/components/notifications/UnreadBadge';
import { formatLastSeen } from '@/utils/formatLastSeen';

interface UserListItemProps {
  user: ChatUser;
  isOnline: boolean;
  isSelected: boolean;
  unreadCount?: number;
  onClick: () => void;
}

export function UserListItem({
  user,
  isOnline,
  isSelected,
  unreadCount = 0,
  onClick,
}: UserListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-purple-50 border-l-4 border-primary-start' : ''
      }`}
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-purple flex items-center justify-center text-white font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute bottom-0 right-0">
          <OnlineStatus isOnline={isOnline} />
        </div>
        {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
      </div>

      {/* User info */}
      <div className="flex-1 text-left min-w-0">
        <div className="font-medium text-gray-900 truncate">{user.name}</div>
        <div className="text-xs text-gray-500 truncate">@{user.username}</div>
        <div className={`text-xs truncate ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>
          {formatLastSeen(user.lastSeen, isOnline)}
        </div>
      </div>
    </button>
  );
}
