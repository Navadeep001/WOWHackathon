'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppNavbar } from '@/components/layout/app-navbar';
import { JoinTeamResults } from '@/components/teams/join-team-results';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import type { TeamMatch } from '@/types/team';

export default function JoinTeamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const hackathonId = searchParams.get('hackathonId') || '';

  const [matches, setMatches] = useState<TeamMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    async function loadTeamRecommendations() {
      setLoading(true);
      try {
        const res = await fetch('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'join',
            userId: user!.id,
            hackathonId,
            hackathonDurationHours: 24,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load recommendations');
        setMatches(data.matches);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    loadTeamRecommendations();
  }, [user, hackathonId]);

  async function handleRequestJoin(teamId: string) {
    if (!user) return;
    setRequestingId(teamId);

    await supabase.from('team_join_requests').insert({
      team_id: teamId,
      requesting_user_id: user.id,
      status: 'pending',
      requested_at: new Date().toISOString(),
    });

    setRequestingId(null);
  }

  if (authLoading) return null;

  return (
    <div className="flex min-h-screen flex-col bg-page-alt">
      <AppNavbar />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        {/* Breadcrumb */}
        <p className="mb-6 text-sm text-muted">
          <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
          {hackathonId && (
            <>
              {' / '}
              <Link href={`/hackathons/${hackathonId}`} className="hover:text-primary">
                Hackathon
              </Link>
            </>
          )}
          {' / '}
          <span className="text-secondary">Join a Team</span>
        </p>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">Find a Team to Join</h1>
            <p className="mt-1 text-sm text-muted">
              Ranked by how well your profile fits each team&apos;s needs.
            </p>
          </div>

          {/* Offer the create path too */}
          <Link
            href={`/teams/create?hackathonId=${hackathonId}`}
            className="text-sm font-medium text-brand hover:underline"
          >
            Create instead →
          </Link>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <JoinTeamResults
          matches={matches}
          onRequestJoin={handleRequestJoin}
          requestingId={requestingId}
          isLoading={loading}
        />
      </main>
    </div>
  );
}
