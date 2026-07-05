'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, fullWidth = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-royal)] disabled:cursor-not-allowed disabled:opacity-50',

          // Primary — brand royal blue with cyan hover
          variant === 'primary' && [
            'bg-[var(--brand-royal)] text-white',
            'hover:bg-[var(--brand-cyan)]',
            'shadow-sm shadow-[var(--brand-royal)]/30',
          ],

          // Secondary — card background
          variant === 'secondary' && [
            'bg-[var(--bg-card)] text-[var(--text-primary)]',
            'border border-[var(--border)]',
            'hover:border-[var(--brand-royal)] hover:text-[var(--brand-royal)]',
          ],

          // Ghost — transparent
          variant === 'ghost' && [
            'bg-transparent text-[var(--text-secondary)]',
            'hover:bg-[var(--bg-secondary)] hover:text-[var(--brand-royal)]',
          ],

          // Danger — red
          variant === 'danger' && [
            'bg-red-600 text-white',
            'hover:bg-red-500',
          ],

          // Outline — border only
          variant === 'outline' && [
            'border border-[var(--border)] bg-transparent',
            'text-[var(--text-secondary)]',
            'hover:border-[var(--brand-royal)] hover:text-[var(--brand-royal)]',
          ],

          size === 'sm' && 'rounded-lg px-3 py-1.5 text-sm',
          size === 'md' && 'rounded-lg px-4 py-2 text-sm',
          size === 'lg' && 'rounded-xl px-6 py-3 text-base',

          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
