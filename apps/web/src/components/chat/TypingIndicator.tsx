export function TypingIndicator({ username }: { username: string }) {
  return (
    <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg max-w-xs">
      <span className="text-sm text-gray-600">{username} is typing</span>
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}
