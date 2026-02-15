export function formatLastSeen(lastSeen?: string, isOnline?: boolean): string {
  if (isOnline) return 'Online';
  if (!lastSeen) return 'Offline';

  const now = new Date();
  const last = new Date(lastSeen);
  const diffMs = now.getTime() - last.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Last seen just now';
  if (diffMins < 60) return `Last seen ${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Last seen yesterday';
  if (diffDays < 7) return `Last seen ${diffDays} days ago`;

  return `Last seen ${last.toLocaleDateString()}`;
}
