'use client';

import { useEffect } from 'react';

interface ToastProps {
  id: string;
  from: {
    id: string;
    name: string;
    username: string;
  };
  message: string;
  preview: string;
  onDismiss: () => void;
  onClick: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function Toast({
  from,
  preview,
  onDismiss,
  onClick,
  autoClose = true,
  autoCloseDelay = 5000,
}: ToastProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onDismiss]);

  return (
    <div
      className="bg-gradient-purple text-white rounded-lg shadow-lg p-4 mb-3 w-80 cursor-pointer transform transition-all duration-300 hover:scale-105 animate-slide-in"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center font-semibold">
            {from.name.charAt(0).toUpperCase()}
          </div>

          {/* Name */}
          <div>
            <div className="font-semibold">{from.name}</div>
            <div className="text-xs opacity-75">@{from.username}</div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="text-white opacity-75 hover:opacity-100 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Message preview */}
      <div className="text-sm opacity-90 truncate">{preview}</div>

      {/* Click hint */}
      <div className="text-xs opacity-75 mt-2">Click to open conversation</div>
    </div>
  );
}
