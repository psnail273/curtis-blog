/**
 * Get initials from a name (e.g., "Curtis Israel" → "CI")
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Get a consistent color for an avatar based on user ID
 */
export function getAvatarColor(userId: string): string {
  // Hash the user ID to get a consistent number
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Map to one of the chart colors defined in globals.css
  const colors = [
    'var(--chart-1)', // oklch orange-ish
    'var(--chart-2)', // oklch teal-ish
    'var(--chart-3)', // oklch blue-ish
    'var(--chart-4)', // oklch yellow-ish
    'var(--chart-5)', // oklch green-ish
  ];

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Format a timestamp as relative time
 * < 1 min: "Just now"
 * < 60 min: "X minutes ago"
 * < 24 hrs: "X hours ago"
 * < 7 days: "X days ago"
 * > 7 days: "MMM D, YYYY"
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;

    // More than 7 days: format as "Jan 15, 2026"
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
