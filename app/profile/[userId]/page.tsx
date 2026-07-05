'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Github,
  Linkedin,
  Globe,
  MapPin,
  BookOpen,
  Clock,
  Star,
} from 'lucide-react';
import { AppNavbar } from '@/components/layout/app-navbar';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import type { Profile } from '@/types/user';

const ROLE_LABELS: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  'ai-ml': 'AI / ML',
  'ui-ux': 'UI / UX',
  devops: 'DevOps',
  fullstack: 'Full Stack',
};

const EXPERIENCE_COLORS: Record<string, string> = {
  beginner: 'default',
  intermediate: 'info',
  advanced: 'success',
};

export default function ProfileViewPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!userId) return;

    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProfile(data as Profile);
      }
      setLoading(false);
    }

    loadProfile();
  }, [userId]);

  const isOwnProfile = user?.id === userId;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppNavbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand-royal)] border-t-transparent" />
        </main>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppNavbar />
        <main className="flex flex-1 flex-col items-center justify-center gap-3">
          <p className="text-lg font-semibold text-secondary">Profile not found</p>
          <p className="text-sm text-muted">
            This user may not have completed onboarding yet.
          </p>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">Back to Dashboard</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-page-alt">
      <AppNavbar />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">

        {/* Profile header card */}
        <div className="rounded-xl border border-brand bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={profile.full_name} src={profile.avatar_url} size="lg" />
              <div>
                <h1 className="text-xl font-bold text-primary">{profile.full_name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {profile.preferred_roles.map((role) => (
                    <Badge key={role} variant="info">
                      {ROLE_LABELS[role] || role}
                    </Badge>
                  ))}
                  <Badge variant={EXPERIENCE_COLORS[profile.experience_level] as any}>
                    {profile.experience_level}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Edit button if viewing own profile */}
            {isOwnProfile && (
              <Link href="/profile">
                <Button variant="outline" size="sm">Edit Profile</Button>
              </Link>
            )}
          </div>

          {/* College + availability */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
            {profile.college && (
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} />
                {profile.college}
                {profile.year_of_study && ` · Year ${profile.year_of_study}`}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {profile.availability_hours_per_day}h available per day
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {profile.timezone}
            </span>
          </div>

          {/* Looking for team status */}
          <div className="mt-4">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                profile.looking_for_team
                  ? 'bg-green-100 text-green-700'
                  : 'bg-[var(--bg-secondary)] text-muted'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  profile.looking_for_team ? 'bg-green-500' : 'bg-[var(--text-muted)]'
                }`}
              />
              {profile.looking_for_team
                ? 'Open to joining a team'
                : 'Not looking for a team'}
            </span>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-4 rounded-xl border border-brand bg-card p-6">
          <h2 className="mb-3 text-base font-semibold text-primary">Skills</h2>
          {profile.skills.length === 0 ? (
            <p className="text-sm text-muted">No skills listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border border-brand bg-page-alt px-3 py-1 text-sm text-secondary"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tech Stack */}
        <div className="mt-4 rounded-xl border border-brand bg-card p-6">
          <h2 className="mb-3 text-base font-semibold text-primary">Tech Stack</h2>
          {profile.tech_stack.length === 0 ? (
            <p className="text-sm text-muted">No tech stack listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-lg border border-blue-100 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-sm text-brand"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Links */}
        {(profile.github_url || profile.portfolio_url || profile.linkedin_url) && (
          <div className="mt-4 rounded-xl border border-brand bg-card p-6">
            <h2 className="mb-3 text-base font-semibold text-primary">Links</h2>
            <div className="flex flex-col gap-2">
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-secondary hover:text-brand"
                >
                  <Github size={16} />
                  {profile.github_url.replace('https://', '')}
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-secondary hover:text-brand"
                >
                  <Linkedin size={16} />
                  {profile.linkedin_url.replace('https://', '')}
                </a>
              )}
              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-secondary hover:text-brand"
                >
                  <Globe size={16} />
                  {profile.portfolio_url.replace('https://', '')}
                </a>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
