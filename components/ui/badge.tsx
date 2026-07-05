import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-[var(--bg-secondary)] text-[var(--text-muted)]',
        variant === 'success' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        variant === 'warning' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        variant === 'danger'  && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        variant === 'info'    && 'bg-blue-100 text-brand dark:bg-blue-900/30 dark:text-[var(--brand-cyan)]',
        className
      )}
      {...props}
    />
  );
}
