'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage, ChatUser } from '@/types/chat';

interface ChatAreaProps {
  selectedUser: ChatUser | null;
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  typingUsername: string | null;
  loading: boolean;
}

export function ChatArea({
  selectedUser,
  messages,
  currentUserId,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  typingUsername,
  loading,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="w-24 h-24 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a chat</h3>
          <p className="text-gray-500">Choose a user from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-purple flex items-center justify-center text-white font-semibold">
            {selectedUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{selectedUser.name}</div>
            <div className="text-sm text-gray-500">@{selectedUser.username}</div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p>No messages yet</p>
              <p className="text-sm mt-1">Send a message to start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const fromId = typeof message.from === 'string' ? message.from : message.from._id;
              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwnMessage={fromId === currentUserId}
                  showSender={false}
                />
              );
            })}
            {typingUsername && <TypingIndicator username={typingUsername} />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <MessageInput
        onSend={onSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        disabled={!selectedUser}
      />
    </div>
  );
}
