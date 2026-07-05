'use client';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { TeammateMatch } from '@/types/team';

interface AutomatchResultsProps {
  matches: TeammateMatch[];
  onInvite: (profileId: string) => void;
  invitingId: string | null;
  isLoading: boolean;
}

export function AutomatchResults({
  matches,
  onInvite,
  invitingId,
  isLoading,
}: AutomatchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-[var(--bg-secondary)]" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <p className="text-sm text-muted">
        No candidates found. Make sure other users have set their profiles to &quot;looking for team&quot;.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {matches.map(({ profile, match_score, match_reasons }) => (
        <div
          key={profile.id}
          className="flex items-start gap-4 rounded-xl border border-brand bg-card p-4"
        >
          <Avatar name={profile.full_name} src={profile.avatar_url} size="md" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <Link href={`/profile/${profile.id}`} className="text-sm font-semibold text-primary hover:text-brand hover:underline">{profile.full_name}</Link>
                <p className="text-xs capitalize text-muted">
                  {profile.preferred_roles[0]} · {profile.experience_level}
                </p>
              </div>
              {/* Match score badge */}
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm font-bold ${
                  match_score >= 80
                    ? 'bg-green-100 text-green-700'
                    : match_score >= 60
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-[var(--bg-secondary)] text-secondary'
                }`}
              >
                {match_score}% Match
              </span>
            </div>

            {/* Skills */}
            <div className="mt-2 flex flex-wrap gap-1">
              {profile.skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="default">{skill}</Badge>
              ))}
            </div>

            {/* Why this match */}
            <ul className="mt-2 flex flex-col gap-0.5">
              {match_reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-muted">
                  <span className="mt-0.5 text-green-500">✓</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <Button
            size="sm"
            variant={invitingId === profile.id ? 'secondary' : 'primary'}
            onClick={() => onInvite(profile.id)}
            isLoading={invitingId === profile.id}
          >
            Invite
          </Button>
        </div>
      ))}
    </div>
  );
}
