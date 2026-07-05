'use client';

import { useState } from 'react';
import { Bot, Send, SaveAll } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAI } from '@/hooks/useAI';
import { supabase } from '@/lib/supabaseClient';
import type { AIRequestType, IdeaStructureResponse } from '@/types/ai';
import type { TeamWithMembers, Task } from '@/types/team';

interface AIMentorProps {
  team: TeamWithMembers;
  currentUserId: string;
}

type MentorMode = 'mentor-chat' | 'idea-structure' | 'task-assignment' | 'roadmap';

const MENTOR_MODES: { key: MentorMode; label: string; placeholder: string }[] = [
  {
    key: 'mentor-chat',
    label: 'Ask Mentor',
    placeholder: 'Ask anything — architecture, debugging, best practices...',
  },
  {
    key: 'idea-structure',
    label: 'Structure Idea',
    placeholder: "Describe your project idea and I'll break it into problem, features, tech stack, and MVP...",
  },
  {
    key: 'task-assignment',
    label: 'Assign Tasks',
    placeholder: "Describe what needs to be built and I'll assign tasks to each team member based on their skills...",
  },
  {
    key: 'roadmap',
    label: 'Roadmap',
    placeholder: 'Tell me your hackathon duration (e.g. 24 hours) and project idea...',
  },
];

interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  structuredTasks?: Task[];
  structuredIdea?: IdeaStructureResponse;
}

export function AIMentor({ team, currentUserId }: AIMentorProps) {
  const [activeMode, setActiveMode] = useState<MentorMode>('mentor-chat');
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [savingTasks, setSavingTasks] = useState(false);
  const [savedTaskIds, setSavedTaskIds] = useState<Set<number>>(new Set());
  const { callAI, loading, error } = useAI();

  const activeModeConfig = MENTOR_MODES.find((m) => m.key === activeMode)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setConversation((prev) => [...prev, { role: 'user', content: userMessage }]);

    const context = {
      team_members: team.members.map((m) => ({
        full_name: m.full_name,
        skills: m.skills,
        preferred_roles: m.preferred_roles,
      })),
      tech_stack: [...new Set(team.members.flatMap((m) => m.tech_stack))],
      project_idea: userMessage,
    };

    const response = await callAI(activeMode as AIRequestType, userMessage, context);

    if (response) {
      const entry: ConversationEntry = {
        role: 'assistant',
        content: response.raw_text,
      };

      // Attach structured data if present so we can render save buttons
      if (response.structured?.tasks) {
        entry.structuredTasks = response.structured.tasks.map((t) => ({
          ...t,
          team_id: team.id,
        }));
      }
      if (response.structured?.idea) {
        entry.structuredIdea = response.structured.idea;
      }

      setConversation((prev) => [...prev, entry]);
    }
  }

  // Save AI-generated tasks to the tasks table in Supabase
  async function handleSaveTasks(tasks: Task[], entryIndex: number) {
    setSavingTasks(true);
    try {
      const tasksToInsert = tasks.map((t) => ({
        team_id: team.id,
        title: t.title,
        description: t.description,
        assigned_to_id: t.assigned_to_id || currentUserId,
        assigned_to_name: t.assigned_to_name || 'Unassigned',
        status: 'todo' as const,
      }));

      const { error: insertError } = await supabase
        .from('tasks')
        .insert(tasksToInsert);

      if (insertError) throw insertError;

      // Mark this entry's tasks as saved so we hide the save button
      setSavedTaskIds((prev) => new Set([...prev, entryIndex]));
    } catch (err) {
      console.error('Failed to save tasks:', err);
    } finally {
      setSavingTasks(false);
    }
  }

  function handleModeChange(mode: MentorMode) {
    setActiveMode(mode);
    setConversation([]);
    setInput('');
  }

  return (
    <div className="flex h-full flex-col">
      {/* Mode switcher */}
      <div className="flex gap-1 overflow-x-auto border-b border-brand p-3">
        {MENTOR_MODES.map((mode) => (
          <button
            key={mode.key}
            onClick={() => handleModeChange(mode.key)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeMode === mode.key
                ? 'bg-[var(--brand-royal)] text-white'
                : 'text-secondary hover:bg-[var(--bg-secondary)]'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Conversation area */}
      <div className="flex-1 overflow-y-auto p-4">
        {conversation.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-brand">
              <Bot size={24} />
            </div>
            <p className="text-sm font-medium text-secondary">
              AI Mentor — {activeModeConfig.label}
            </p>
            <p className="max-w-sm text-xs text-muted">
              {activeModeConfig.placeholder}
            </p>
          </div>
        )}

        <ul className="flex flex-col gap-4">
          {conversation.map((entry, i) => (
            <li
              key={i}
              className={`flex gap-3 ${entry.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {entry.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-brand">
                  <Bot size={16} />
                </div>
              )}

              <div className="flex max-w-2xl flex-col gap-2">
                <div
                  className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                    entry.role === 'user'
                      ? 'bg-[var(--brand-royal)] text-white'
                      : 'border border-brand bg-card text-primary'
                  }`}
                >
                  {/* For idea-structure, render it as structured sections */}
                  {entry.structuredIdea && entry.role === 'assistant' ? (
                    <div className="flex flex-col gap-3">
                      <p><strong>Problem:</strong> {entry.structuredIdea.problem_statement}</p>
                      <p><strong>Target Users:</strong> {entry.structuredIdea.target_users}</p>
                      <div>
                        <strong>Core Features:</strong>
                        <ul className="mt-1 list-inside list-disc">
                          {entry.structuredIdea.core_features.map((f, fi) => (
                            <li key={fi}>{f}</li>
                          ))}
                        </ul>
                      </div>
                      <p><strong>Tech Stack:</strong> {entry.structuredIdea.suggested_tech_stack.join(', ')}</p>
                      <p><strong>Architecture:</strong> {entry.structuredIdea.architecture_overview}</p>
                      <div>
                        <strong>MVP Scope:</strong>
                        <ul className="mt-1 list-inside list-disc">
                          {entry.structuredIdea.mvp_scope.map((m, mi) => (
                            <li key={mi}>{m}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Stretch Goals:</strong>
                        <ul className="mt-1 list-inside list-disc">
                          {entry.structuredIdea.stretch_goals.map((g, gi) => (
                            <li key={gi}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    entry.content
                  )}
                </div>

                {/* Save Tasks button — only shows for task-assignment responses */}
                {entry.structuredTasks && entry.structuredTasks.length > 0 && (
                  <div className="flex items-center gap-2">
                    {savedTaskIds.has(i) ? (
                      <span className="text-xs font-medium text-green-600">
                        ✓ {entry.structuredTasks.length} tasks saved to board
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSaveTasks(entry.structuredTasks!, i)}
                        isLoading={savingTasks}
                      >
                        <SaveAll size={14} />
                        Save {entry.structuredTasks.length} tasks to board
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}

          {/* Loading dots */}
          {loading && (
            <li className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-brand">
                <Bot size={16} />
              </div>
              <div className="flex items-center gap-1 rounded-2xl border border-brand bg-card px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)]" />
              </div>
            </li>
          )}
        </ul>

        {error && (
          <div className="mx-4 mb-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-medium text-red-600">AI Error</p>
            <p className="mt-0.5 text-xs text-red-500">{error}</p>
            {(error.includes("quota") || error.includes("429") || error.includes("wait")) && (
              <p className="mt-1 text-xs text-orange-500">
                Wait 30 seconds then try again. If it keeps failing, get a new API key at aistudio.google.com
              </p>
            )}
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-brand p-4"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={activeModeConfig.placeholder}
          className="flex-1 rounded-lg border border-brand bg-card px-3 py-2 text-sm text-primary placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal)]"
        />
        <Button type="submit" size="sm" isLoading={loading} disabled={!input.trim()}>
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
}
