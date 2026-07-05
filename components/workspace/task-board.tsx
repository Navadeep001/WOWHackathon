'use client';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/types/team';

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

const COLUMNS: { key: Task['status']; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const STATUS_BADGE_VARIANT: Record<Task['status'], 'default' | 'warning' | 'success'> = {
  'todo': 'default',
  'in-progress': 'warning',
  'done': 'success',
};

export function TaskBoard({ tasks, onStatusChange }: TaskBoardProps) {
  return (
    <div className="grid h-full grid-cols-3 gap-4 p-4">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.key);
        return (
          <div key={column.key} className="flex flex-col gap-3">
            {/* Column header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-secondary">{column.label}</h3>
              <span className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-xs text-muted">
                {columnTasks.length}
              </span>
            </div>

            {/* Task cards */}
            <div className="flex flex-col gap-2">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-brand bg-card p-3 shadow-sm"
                >
                  <p className="text-sm font-medium text-primary">{task.title}</p>
                  <p className="mt-1 text-xs text-muted line-clamp-2">{task.description}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Avatar name={task.assigned_to_name} size="sm" />
                      <span className="text-xs text-muted">{task.assigned_to_name}</span>
                    </div>

                    {/* Quick status changer */}
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
                      className="rounded-md border border-brand bg-card px-1.5 py-0.5 text-xs text-secondary focus:outline-none"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
              ))}

              {columnTasks.length === 0 && (
                <p className="rounded-lg border border-dashed border-brand p-4 text-center text-xs text-muted">
                  No tasks here
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
