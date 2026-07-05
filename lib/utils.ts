import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merges Tailwind classes safely — handles conflicts like "p-2 p-4" → "p-4"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Converts "2025-12-31" → "Dec 31, 2025"
export function formatDate(isoDateString: string): string {
  return new Date(isoDateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Converts "2025-12-31" → "3 days left" or "2 days ago"
export function timeFromNow(isoDateString: string): string {
  const now = new Date();
  const target = new Date(isoDateString);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? '' : 's'} left`;
  if (diffDays === 0) return 'Today';
  return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} ago`;
}

// Converts array to comma-separated tag string — used in cards
export function tagsToString(tags: string[]): string {
  return tags.join(', ');
}

// Splits a comma-separated string input into a trimmed array
export function parseCommaSeparated(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
