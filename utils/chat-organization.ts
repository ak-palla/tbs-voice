// Chat organization utilities for Claude-style interface
export interface ChatInstance {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
}

interface GroupedChats {
  today: ChatInstance[];
  yesterday: ChatInstance[];
  thisWeek: ChatInstance[];
  thisMonth: ChatInstance[];
  older: ChatInstance[];
}

export type TimeGroupKey = 'today' | 'yesterday' | 'pastWeek' | 'pastMonth' | 'older';

export interface TimeGroup {
  key: TimeGroupKey;
  label: string;
  chats: ChatInstance[];
}

/**
 * Group chat instances by time period
 */
export function groupChatsByTime(chats: ChatInstance[]): GroupedChats {
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = subDays(today, 1);
  const thisWeek = subDays(today, 7);
  const thisMonth = subDays(today, 30);

  const grouped: GroupedChats = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: []
  };

  chats.forEach(chat => {
    const chatDate = new Date(chat.updated_at);

    if (isAfter(chatDate, today)) {
      grouped.today.push(chat);
    } else if (isAfter(chatDate, yesterday)) {
      grouped.yesterday.push(chat);
    } else if (isAfter(chatDate, thisWeek)) {
      grouped.thisWeek.push(chat);
    } else if (isAfter(chatDate, thisMonth)) {
      grouped.thisMonth.push(chat);
    } else {
      grouped.older.push(chat);
    }
  });

  return grouped;
}

/**
 * Format a date relative to now (e.g. "2 hours ago", "Yesterday", etc.)
 */
export function formatRelativeTime(date: string): string {
  const now = new Date();
  const chatDate = new Date(date);
  
  if (isToday(chatDate)) {
    return formatDistanceToNow(chatDate, { addSuffix: true });
  } else if (isYesterday(chatDate)) {
    return 'Yesterday';
  } else if (isThisWeek(chatDate, now)) {
    return format(chatDate, 'EEEE'); // Day name
  } else if (isThisYear(chatDate)) {
    return format(chatDate, 'MMM d'); // Month + Day
  } else {
    return format(chatDate, 'MMM d, yyyy'); // Full date
  }
}

// Helper functions
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function isAfter(date: Date, compareDate: Date): boolean {
  return date >= compareDate;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
}

function isThisWeek(date: Date, now: Date): boolean {
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  return date > weekStart;
}

function isThisYear(date: Date): boolean {
  return date.getFullYear() === new Date().getFullYear();
}

/**
 * Get time groups with labels for display
 */
export function getTimeGroupsForDisplay(groupedChats: GroupedChats): TimeGroup[] {
  const timeGroups: TimeGroup[] = [
    { key: 'today', label: 'TODAY', chats: groupedChats.today },
    { key: 'yesterday', label: 'YESTERDAY', chats: groupedChats.yesterday },
    { key: 'pastWeek', label: 'PAST WEEK', chats: groupedChats.thisWeek },
    { key: 'pastMonth', label: 'PAST MONTH', chats: groupedChats.thisMonth },
    { key: 'older', label: 'OLDER', chats: groupedChats.older }
  ];

  // Filter out empty groups
  return timeGroups.filter(group => group.chats.length > 0);
}

/**
 * Check if a user can star more chats (5 max limit)
 */
export function canStarMoreChats(starredChats: ChatInstance[]): boolean {
  return starredChats.length < 5;
}

/**
 * Get the count display for starred section
 */
export function getStarredCountDisplay(starredChats: ChatInstance[]): string {
  return `(${starredChats.length}/5)`;
} 