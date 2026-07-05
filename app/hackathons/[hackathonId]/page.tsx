'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Trophy, Users, MapPin, ExternalLink } from 'lucide-react';
import { AppNavbar } from '@/components/layout/app-navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { getHackathonById } from '@/data/hackathons';
import { formatDate } from '@/lib/utils';
import type { Hackathon } from '@/types/hackathon';

export default function HackathonDetailPage() {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const hackathon: Hackathon | undefined = getHackathonById(hackathonId);

  const [isInterested, setIsInterested] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  // Check if the user already clicked Interested for this hackathon
  useEffect(() => {
    if (!user || !hackathon) return;
    supabase
      .from('user_hackathons')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('hackathon_id', hackathon.id)
      .single()
      .then(({ data }) => {
        if (data) setIsInterested(true);
      });
  }, [user, hackathon]);

  async function handleInterested() {
    if (!user || !hackathon) return;
    setRegistering(true);

    if (!isInterested) {
      // Register interest
      await supabase.from('user_hackathons').insert({
        user_id: user.id,
        hackathon_id: hackathon.id,
        registered_at: new Date().toISOString(),
      });
      setIsInterested(true);
    }

    // Navigate to create/join team selection
    router.push(
      `/teams/create?hackathonId=${hackathon.id}&maxTeamSize=${hackathon.max_team_size}`
    );
    setRegistering(false);
  }

  if (authLoading) return null;

  if (!hackathon) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppNavbar />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted">Hackathon not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-page-alt">
      <AppNavbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        {/* Breadcrumb */}
        <p className="mb-4 text-sm text-muted">
          <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
          {' / '}
          <span className="text-secondary">{hackathon.title}</span>
        </p>

        {/* Header card */}
        <div className="rounded-xl border border-brand bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-primary">{hackathon.title}</h1>
                <Badge variant={hackathon.status === 'ongoing' ? 'success' : 'default'}>
                  {hackathon.status}
                </Badge>
              </div>
              <p className="mt-1 text-muted">by {hackathon.organizer}</p>
            </div>

            {/* CTA */}
            <Button
              onClick={handleInterested}
              isLoading={registering}
              variant={isInterested ? 'secondary' : 'primary'}
              size="lg"
            >
              {isInterested ? '✓ Interested — Find Team' : 'Interested'}
            </Button>
          </div>

          {/* Key details */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Calendar size={16} className="text-muted" />
              <div>
                <p className="text-xs text-muted">Registration Deadline</p>
                <p className="font-medium text-primary">
                  {formatDate(hackathon.registration_deadline)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Trophy size={16} className="text-muted" />
              <div>
                <p className="text-xs text-muted">Prize Pool</p>
                <p className="font-medium text-primary">{hackathon.prize_pool}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary">
              <Users size={16} className="text-muted" />
              <div>
                <p className="text-xs text-muted">Team Size</p>
                <p className="font-medium text-primary">
                  {hackathon.min_team_size}–{hackathon.max_team_size} members
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary">
              <MapPin size={16} className="text-muted" />
              <div>
                <p className="text-xs text-muted">Mode</p>
                <p className="font-medium capitalize text-primary">
                  {hackathon.mode}
                  {hackathon.location ? ` · ${hackathon.location}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {hackathon.tags.map((tag) => (
              <Badge key={tag} variant="info">{tag}</Badge>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 rounded-xl border border-brand bg-card p-6">
          <h2 className="text-base font-semibold text-primary">About this hackathon</h2>
          <p className="mt-2 text-sm leading-relaxed text-secondary">{hackathon.description}</p>

          {hackathon.external_url && (
            <a
              href={hackathon.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
            >
              View on official site <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Dates */}
        <div className="mt-4 rounded-xl border border-brand bg-card p-6">
          <h2 className="text-base font-semibold text-primary">Important Dates</h2>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Registration Deadline</span>
              <span className="font-medium text-primary">
                {formatDate(hackathon.registration_deadline)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Hackathon Start</span>
              <span className="font-medium text-primary">{formatDate(hackathon.start_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Hackathon End</span>
              <span className="font-medium text-primary">{formatDate(hackathon.end_date)}</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 flex justify-center">
          <Button size="lg" onClick={handleInterested} isLoading={registering}>
            {isInterested ? 'Find or Create Your Team' : 'I\'m Interested — Find My Team'}
          </Button>
        </div>
      </main>
    </div>
  );
}
