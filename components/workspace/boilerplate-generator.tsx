'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAI } from '@/hooks/useAI';
import type { TeamWithMembers } from '@/types/team';

interface BoilerplateGeneratorProps {
  team: TeamWithMembers;
}

export function BoilerplateGenerator({ team }: BoilerplateGeneratorProps) {
  const [ideaInput, setIdeaInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { callAI, loading, error } = useAI();

  const teamTechStack = [...new Set(team.members.flatMap((m) => m.tech_stack))];

  async function handleGenerate() {
    if (!ideaInput.trim()) return;

    const response = await callAI(
      'boilerplate',
      `Project idea: ${ideaInput}`,
      { tech_stack: teamTechStack, project_idea: ideaInput }
    );

    if (response?.raw_text) {
      setGeneratedCode(response.raw_text);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* Input section */}
      <div className="rounded-xl border border-brand bg-card p-5">
        <h3 className="text-sm font-semibold text-primary">Boilerplate Generator</h3>
        <p className="mt-1 text-xs text-muted">
          Detected stack: {teamTechStack.length > 0 ? teamTechStack.join(', ') : 'None yet — update member profiles'}
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-secondary">What are you building?</label>
            <textarea
              rows={3}
              placeholder="e.g. A Next.js web app with Supabase auth and a dashboard for tracking hackathon tasks..."
              value={ideaInput}
              onChange={(e) => setIdeaInput(e.target.value)}
              className="w-full rounded-lg border border-brand px-3 py-2 text-sm text-primary placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal)]"
            />
          </div>

          <Button onClick={handleGenerate} isLoading={loading} disabled={!ideaInput.trim()}>
            Generate Boilerplate
          </Button>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>

      {/* Generated output */}
      {generatedCode && (
        <div className="flex flex-col gap-2 rounded-xl border border-brand bg-card p-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-primary">Generated Code</h4>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy all'}
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs leading-relaxed text-gray-100">
            <code>{generatedCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
