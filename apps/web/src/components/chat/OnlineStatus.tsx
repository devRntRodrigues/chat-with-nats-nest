interface OnlineStatusProps {
  isOnline: boolean;
  className?: string;
}

export function OnlineStatus({ isOnline, className = '' }: OnlineStatusProps) {
  if (!isOnline) return null;

  return (
    <div
      className={`w-3 h-3 rounded-full bg-green-500 border-2 border-white ${className}`}
      title="Online"
    />
  );
}
