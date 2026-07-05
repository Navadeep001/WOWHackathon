'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { signOut } from '@/lib/auth';

export function AppNavbar() {
  const { user } = useAuth();
  const router = useRouter();
  const { totalPending } = useNotifications(user?.id);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-primary)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">

        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold">
          <span className="text-[var(--brand-royal)]">Lego</span>
          <span className="text-[var(--text-primary)]">Link</span>
        </Link>

        {/* Search bar */}
        <div className="relative mx-8 hidden max-w-sm flex-1 md:flex">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="search"
            placeholder="Search hackathons, teams, skills..."
            className="
              w-full rounded-lg border border-[var(--border)]
              bg-[var(--bg-secondary)]
              py-2 pl-9 pr-4 text-sm
              text-[var(--text-primary)]
              placeholder:text-[var(--text-muted)]
              focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal)]
            "
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Notifications bell */}
          <Link
            href="/notifications"
            className="relative rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--brand-royal)]"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {totalPending > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {totalPending > 9 ? '9+' : totalPending}
              </span>
            )}
          </Link>

          {/* Avatar dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-[var(--bg-secondary)]"
            >
              <Avatar name={displayName} src={user?.user_metadata?.avatar_url} size="sm" />
              <span className="hidden text-sm font-medium text-[var(--text-primary)] md:block">
                {displayName}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-1 shadow-lg">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--brand-royal)]"
                >
                  <User size={16} />
                  Edit Profile
                </Link>
                <div className="my-1 border-t border-[var(--border)]" />
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
