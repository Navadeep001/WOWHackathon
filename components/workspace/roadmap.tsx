'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAI } from '@/hooks/useAI';
import type { RoadmapPhase } from '@/types/team';
import type { TeamWithMembers } from '@/types/team';

interface RoadmapProps {
  team: TeamWithMembers;
  hackathonDurationHours?: number;
}

export function Roadmap({ team, hackathonDurationHours = 24 }: RoadmapProps) {
  const [phases, setPhases] = useState<RoadmapPhase[]>([]);
  const [ideaInput, setIdeaInput] = useState('');
  const [durationInput, setDurationInput] = useState(String(hackathonDurationHours));
  const { callAI, loading, error } = useAI();

  async function generateRoadmap() {
    if (!ideaInput.trim()) return;

    const response = await callAI(
      'roadmap',
      `Project idea: ${ideaInput}\nHackathon duration: ${durationInput} hours`,
      { hackathon_duration_hours: Number(durationInput) }
    );

    if (response?.structured?.roadmap) {
      setPhases(response.structured.roadmap);
    } else if (response?.raw_text) {
      // Fallback: show as plain text if structured parse failed
      setPhases([
        {
          phase_number: 1,
          time_range: 'Full hackathon',
          title: 'AI-Generated Roadmap',
          tasks: [response.raw_text],
        },
      ]);
    }
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      {/* Input section */}
      {phases.length === 0 && (
        <div className="flex flex-col gap-4 rounded-xl border border-brand bg-card p-5">
          <h3 className="text-sm font-semibold text-primary">Generate your hackathon roadmap</h3>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-secondary">Project Idea</label>
            <textarea
              rows={3}
              placeholder="e.g. An AI-powered study assistant that personalizes learning paths for students..."
              value={ideaInput}
              onChange={(e) => setIdeaInput(e.target.value)}
              className="w-full rounded-lg border border-brand px-3 py-2 text-sm text-primary placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal)]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-secondary">Hackathon Duration (hours)</label>
              <input
                type="number"
                min={6}
                max={72}
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                className="w-28 rounded-lg border border-brand px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal)]"
              />
            </div>
          </div>

          <Button onClick={generateRoadmap} isLoading={loading} disabled={!ideaInput.trim()}>
            Generate Roadmap
          </Button>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      {/* Roadmap timeline */}
      {phases.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-primary">Your Roadmap</h3>
            <Button variant="ghost" size="sm" onClick={() => setPhases([])}>
              Regenerate
            </Button>
          </div>

          <div className="relative mt-4 flex flex-col gap-0">
            {phases.map((phase, index) => (
              <div key={phase.phase_number} className="flex gap-4">
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-royal)] text-xs font-bold text-white">
                    {phase.phase_number}
                  </div>
                  {index < phases.length - 1 && (
                    <div className="w-0.5 flex-1 bg-blue-100 dark:bg-blue-900/30" />
                  )}
                </div>

                {/* Phase content */}
                <div className="mb-6 flex-1 rounded-xl border border-brand bg-card p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-primary">{phase.title}</h4>
                    <span className="text-xs font-medium text-brand">{phase.time_range}</span>
                  </div>
                  <ul className="mt-2 flex flex-col gap-1">
                    {phase.tasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-secondary">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400 dark:bg-[var(--brand-cyan)]" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
