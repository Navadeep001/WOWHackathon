'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="
        flex h-9 w-9 items-center justify-center rounded-lg
        border border-[var(--border)]
        bg-[var(--bg-card)]
        text-[var(--text-muted)]
        transition-colors duration-150
        hover:border-[var(--brand-royal)]
        hover:text-[var(--brand-royal)]
      "
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
