'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TeamMatch } from '@/types/team';

interface JoinTeamResultsProps {
  matches: TeamMatch[];
  onRequestJoin: (teamId: string) => void;
  requestingId: string | null;
  isLoading: boolean;
}

export function JoinTeamResults({
  matches,
  onRequestJoin,
  requestingId,
  isLoading,
}: JoinTeamResultsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-[var(--bg-secondary)]" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <p className="text-sm text-muted">
        No open teams found for this hackathon yet. Be the first to create one!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {matches.map(({ team, match_score, match_reasons }) => (
        <div
          key={team.id}
          className="rounded-xl border border-brand bg-card p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-primary">{team.name}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    match_score >= 80
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {match_score}% Match
                </span>
              </div>
              <p className="mt-1 text-xs text-muted line-clamp-2">{team.description}</p>
            </div>

            <div className="flex shrink-0 items-center gap-1 text-xs text-muted">
              <Users size={13} />
              {team.current_member_ids.length}/{team.max_members}
            </div>
          </div>

          {/* Required skills */}
          {team.required_skills.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs text-muted">Looking for:</p>
              <div className="flex flex-wrap gap-1">
                {team.required_skills.map((skill) => (
                  <Badge key={skill} variant="info">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Why this match */}
          <ul className="mt-3 flex flex-col gap-0.5">
            {match_reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-muted">
                <span className="mt-0.5 text-green-500">✓</span>
                {reason}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => onRequestJoin(team.id)}
              isLoading={requestingId === team.id}
            >
              Request to Join
            </Button>
            <Link href={`/teams/${team.id}/workspace`}>
              <Button size="sm" variant="ghost">View Team</Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
