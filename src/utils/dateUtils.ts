export function formatDateTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diff / 60000);
  const diffHours = Math.floor(diff / 3600000);
  const diffDays = Math.floor(diff / 86400000);

  // If less than 24 hours ago, show relative time
  if (diffDays < 1) {
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }
    return `${diffHours}h ago`;
  }

  // If this year, show date without year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  // If different year, show with year
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}