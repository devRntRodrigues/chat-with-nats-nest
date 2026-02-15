import type { ChatMessage } from '@/types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showSender?: boolean;
}

export function MessageBubble({ message, isOwnMessage, showSender = true }: MessageBubbleProps) {
  const from = typeof message.from === 'string' ? null : message.from;
  const createdAt = new Date(message.createdAt);
  const timeStr = createdAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {!isOwnMessage && showSender && from && (
          <div className="text-xs text-gray-500 mb-1 px-2">{from.name}</div>
        )}
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-gradient-purple text-white rounded-br-none'
              : 'bg-gray-200 text-gray-900 rounded-bl-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          <div
            className={`text-xs mt-1 flex items-center justify-end space-x-1 ${
              isOwnMessage ? 'text-purple-100' : 'text-gray-500'
            }`}
          >
            <span>{timeStr}</span>
            {isOwnMessage && (
              <span>
                {message.read ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7M5 13l4 4L19 7"
                      transform="translate(2, 0)"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
