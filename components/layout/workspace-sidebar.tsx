'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, MessageSquare, Bot, CheckSquare, Map, Code2, Settings } from 'lucide-react';
import type { WorkspaceTab } from '@/hooks/useWorkspace';

interface SidebarItem {
  key: WorkspaceTab;
  label: string;
  icon: ReactNode;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'overview',    label: 'Overview',    icon: <LayoutDashboard size={18} /> },
  { key: 'chat',        label: 'Team Chat',   icon: <MessageSquare size={18} /> },
  { key: 'ai-mentor',   label: 'AI Mentor',   icon: <Bot size={18} /> },
  { key: 'tasks',       label: 'Tasks',       icon: <CheckSquare size={18} /> },
  { key: 'roadmap',     label: 'Roadmap',     icon: <Map size={18} /> },
  { key: 'boilerplate', label: 'Boilerplate', icon: <Code2 size={18} /> },
];

interface WorkspaceSidebarProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  teamName: string;
  teamId: string;
}

export function WorkspaceSidebar({ activeTab, onTabChange, teamName, teamId }: WorkspaceSidebarProps) {
  return (
    <aside className="flex w-56 flex-col border-r border-[var(--border)] bg-[var(--bg-primary)]">
      {/* Team name header with brand gradient */}
      <div
        className="border-b border-[var(--border)] px-4 py-4"
        style={{ background: 'linear-gradient(135deg, rgba(27,79,216,0.08) 0%, rgba(59,158,255,0.05) 100%)' }}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Workspace</p>
        <p className="mt-1 truncate text-sm font-semibold text-[var(--text-primary)]">{teamName}</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3">
        <ul className="flex flex-col gap-1">
          {SIDEBAR_ITEMS.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => onTabChange(item.key)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                  activeTab === item.key
                    ? 'text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--brand-royal)]'
                )}
                style={
                  activeTab === item.key
                    ? { background: 'linear-gradient(135deg, #1B4FD8 0%, #3B9EFF 100%)' }
                    : {}
                }
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings */}
      <div className="border-t border-[var(--border)] p-3">
        <a
          href={`/teams/${teamId}/settings`}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--brand-royal)]"
        >
          <Settings size={18} />
          Settings
        </a>
      </div>
    </aside>
  );
}
