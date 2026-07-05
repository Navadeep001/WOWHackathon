'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { ChatMessage } from '@/types/team';

interface TeamChatProps {
  messages: ChatMessage[];
  currentUserId: string;
  currentUserName: string;
  onSendMessage: (content: string) => Promise<void>;
}

export function TeamChat({
  messages,
  currentUserId,
  currentUserName,
  onSendMessage,
}: TeamChatProps) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      await onSendMessage(input.trim());
      setInput('');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted">
            No messages yet. Say hello to your team!
          </p>
        )}
        <ul className="flex flex-col gap-4">
          {messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUserId;
            return (
              <li
                key={message.id}
                className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
              >
                <Avatar name={message.sender_name} size="sm" />
                <div className={`flex max-w-sm flex-col gap-1 ${isCurrentUser ? 'items-end' : ''}`}>
                  <p className="text-xs text-muted">{message.sender_name}</p>
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm ${
                      message.is_ai_message
                        ? 'border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-brand'
                        : isCurrentUser
                        ? 'bg-[var(--brand-royal)] text-white'
                        : 'bg-[var(--bg-secondary)] text-primary'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-brand p-4"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message your team... (press Enter to send)"
          className="flex-1 rounded-lg border border-brand bg-card px-3 py-2 text-sm text-primary placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal)]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <Button type="submit" size="sm" isLoading={sending} disabled={!input.trim()}>
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
}
