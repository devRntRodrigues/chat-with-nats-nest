'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiPost } from '@/lib/http';
import { useChatEvents, type PresencePayload } from './useChatEvents';

const HEARTBEAT_INTERVAL = 30000;

export function usePresence() {
  const { isAuthenticated } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendHeartbeat = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await apiPost('/v1/presence/heartbeat', {});
    } catch (error) {
      console.error('[usePresence] Heartbeat error:', error);
    }
  }, [isAuthenticated]);

  useChatEvents({
    onPresence: useCallback((data: PresencePayload) => {
      setOnlineUsers(new Set(data.userIds));
    }, []),
  });

  useEffect(() => {
    if (!isAuthenticated) {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      setOnlineUsers(new Set());
      return;
    }

    sendHeartbeat();

    heartbeatIntervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, sendHeartbeat]);

  const isUserOnline = useCallback(
    (userId: string) => {
      return onlineUsers.has(userId);
    },
    [onlineUsers]
  );

  return {
    onlineUsers,
    isUserOnline,
  };
}
