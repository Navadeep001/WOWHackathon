'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AppNavbar } from '@/components/layout/app-navbar';
import { CreateTeamForm, CreateTeamFormData } from '@/components/teams/create-team-form';
import { AutomatchResults } from '@/components/teams/automatch-results';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import type { TeammateMatch } from '@/types/team';

type PageState = 'form' | 'matching';

export default function CreateTeamPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const hackathonId = searchParams.get('hackathonId') || '';
  const maxTeamSize = Number(searchParams.get('maxTeamSize') || 4);

  const [pageState, setPageState] = useState<PageState>('form');
  const [createdTeamId, setCreatedTeamId] = useState<string | null>(null);
  const [matches, setMatches] = useState<TeammateMatch[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  async function handleCreateTeam(formData: CreateTeamFormData) {
    if (!user) return;
    setSubmitting(true);
    setError('');

    try {
      // Insert the new team into Supabase
      const { data: team, error: insertError } = await supabase
        .from('teams')
        .insert({
          hackathon_id: hackathonId,
          name: formData.name,
          description: formData.description,
          required_skills: formData.required_skills,
          max_members: formData.max_members,
          owner_id: user.id,
          current_member_ids: [user.id],
          is_open: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setCreatedTeamId(team.id);

      // Run AutoMatch against the new team
      setLoadingMatches(true);
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'automatch',
          teamId: team.id,
          userId: user.id,
          requiredSkills: formData.required_skills,
          hackathonDurationHours: 24,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Matching failed');

      setMatches(data.matches);
      setPageState('matching');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
      setLoadingMatches(false);
    }
  }

  async function handleInvite(profileId: string) {
    if (!createdTeamId) return;
    setInvitingId(profileId);

    // Insert an invite record — extend schema as needed for accept/reject flow
    await supabase.from('team_invites').insert({
      team_id: createdTeamId,
      invited_user_id: profileId,
      invited_by: user?.id,
      status: 'pending',
    });

    setInvitingId(null);
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
          <span className="text-secondary">Create Team</span>
        </p>

        {pageState === 'form' && (
          <div className="rounded-xl border border-brand bg-card p-6">
            <h1 className="text-xl font-bold text-primary">Create Your Team</h1>
            <p className="mt-1 text-sm text-muted">
              Fill in your team details and we&apos;ll AutoMatch the best candidates for you.
            </p>

            <div className="mt-6">
              <CreateTeamForm
                hackathonId={hackathonId}
                maxAllowedMembers={maxTeamSize}
                onSubmit={handleCreateTeam}
                isSubmitting={submitting}
              />
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            {/* Also offer the join path */}
            <div className="mt-6 border-t border-brand pt-5 text-center">
              <p className="text-sm text-muted">
                Rather join an existing team?{' '}
                <Link
                  href={`/teams/join?hackathonId=${hackathonId}`}
                  className="font-medium text-brand hover:underline"
                >
                  Find a team to join
                </Link>
              </p>
            </div>
          </div>
        )}

        {pageState === 'matching' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-primary">Suggested Teammates</h1>
                <p className="mt-1 text-sm text-muted">
                  Ranked by how well they fill your team&apos;s skill gaps.
                </p>
              </div>
              {createdTeamId && (
                <Link href={`/teams/${createdTeamId}/workspace`}>
                  <span className="text-sm font-medium text-brand hover:underline">
                    Go to Workspace →
                  </span>
                </Link>
              )}
            </div>

            <AutomatchResults
              matches={matches}
              onInvite={handleInvite}
              invitingId={invitingId}
              isLoading={loadingMatches}
            />
          </div>
        )}
      </main>
    </div>
  );
}
