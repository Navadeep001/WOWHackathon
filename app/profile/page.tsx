'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppNavbar } from '@/components/layout/app-navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { parseCommaSeparated } from '@/lib/utils';
import type { Profile, PreferredRole, ExperienceLevel } from '@/types/user';

const PREFERRED_ROLE_OPTIONS: { key: PreferredRole; label: string }[] = [
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'ai-ml', label: 'AI / ML' },
  { key: 'ui-ux', label: 'UI / UX' },
  { key: 'devops', label: 'DevOps' },
  { key: 'fullstack', label: 'Full Stack' },
];

const EXPERIENCE_OPTIONS: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [skillsInput, setSkillsInput] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  // Load existing profile
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data as Profile);
          setSkillsInput((data.skills || []).join(', '));
          setTechStackInput((data.tech_stack || []).join(', '));
        }
      });
  }, [user]);

  function updateProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function toggleRole(role: PreferredRole) {
    if (!profile) return;
    const current = profile.preferred_roles || [];
    updateProfile(
      'preferred_roles',
      current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !profile) return;
    setSaving(true);
    setError('');
    setSuccess(false);

    const { error: upsertError } = await supabase.from('profiles').upsert({
      ...profile,
      id: user.id,
      skills: parseCommaSeparated(skillsInput),
      tech_stack: parseCommaSeparated(techStackInput),
    });

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setSuccess(true);
    }
    setSaving(false);
  }

  if (authLoading || !profile) return null;

  return (
    <div className="flex min-h-screen flex-col bg-page-alt">
      <AppNavbar />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <h1 className="mb-6 text-xl font-bold text-primary">Edit Profile</h1>

        <form onSubmit={handleSave} className="flex flex-col gap-6">

          {/* ── Basic Information ──────────────────────────────── */}
          <section className="rounded-xl border border-brand bg-card p-6">
            <h2 className="mb-4 text-base font-semibold text-primary">
              Basic Information
            </h2>
            <div className="flex flex-col gap-4">
              <Input
                id="full-name"
                label="Full Name"
                value={profile.full_name}
                onChange={(e) => updateProfile('full_name', e.target.value)}
                required
              />
              <Input
                id="college"
                label="College / University"
                value={profile.college}
                onChange={(e) => updateProfile('college', e.target.value)}
                required
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-secondary">
                  Year of Study
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => updateProfile('year_of_study', year)}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                        profile.year_of_study === year
                          ? 'border-[var(--brand-royal)] bg-blue-50 dark:bg-blue-900/20 text-brand'
                          : 'border-brand text-secondary hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      Year {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Technical Skills ───────────────────────────────── */}
          <section className="rounded-xl border border-brand bg-card p-6">
            <h2 className="mb-4 text-base font-semibold text-primary">
              Technical Skills
            </h2>
            <div className="flex flex-col gap-4">
              <Input
                id="skills"
                label="Skills (comma-separated)"
                placeholder="React, TypeScript, Python, Figma"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                hint="More detail = better matching results"
              />
              <Input
                id="tech-stack"
                label="Tech Stack (comma-separated)"
                placeholder="Next.js, Supabase, TailwindCSS"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-secondary">
                  Preferred Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREFERRED_ROLE_OPTIONS.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleRole(key)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                        (profile.preferred_roles || []).includes(key)
                          ? 'border-[var(--brand-royal)] bg-blue-50 dark:bg-blue-900/20 text-brand'
                          : 'border-brand text-secondary hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-secondary">
                  Experience Level
                </label>
                <div className="flex gap-2">
                  {EXPERIENCE_OPTIONS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => updateProfile('experience_level', level)}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition-colors ${
                        profile.experience_level === level
                          ? 'border-[var(--brand-royal)] bg-blue-50 dark:bg-blue-900/20 text-brand'
                          : 'border-brand text-secondary hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Availability ───────────────────────────────────── */}
          <section className="rounded-xl border border-brand bg-card p-6">
            <h2 className="mb-4 text-base font-semibold text-primary">
              Availability
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-secondary">
                  Hours available per day during hackathon
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={24}
                    value={profile.availability_hours_per_day}
                    onChange={(e) =>
                      updateProfile('availability_hours_per_day', Number(e.target.value))
                    }
                    className="flex-1"
                  />
                  <span className="w-16 text-center text-sm font-semibold text-primary">
                    {profile.availability_hours_per_day}h / day
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="timezone" className="text-sm font-medium text-secondary">
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={profile.timezone}
                  onChange={(e) => updateProfile('timezone', e.target.value)}
                  className="w-full rounded-lg border border-brand bg-card px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[var(--brand-royal)]"
                >
                  <option value="Asia/Kolkata">IST — India Standard Time</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">EST — Eastern US</option>
                  <option value="America/Los_Angeles">PST — Pacific US</option>
                  <option value="Europe/London">GMT — London</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── Links ──────────────────────────────────────────── */}
          <section className="rounded-xl border border-brand bg-card p-6">
            <h2 className="mb-4 text-base font-semibold text-primary">Links</h2>
            <div className="flex flex-col gap-4">
              <Input
                id="github"
                label="GitHub URL"
                type="url"
                placeholder="https://github.com/yourusername"
                value={profile.github_url || ''}
                onChange={(e) => updateProfile('github_url', e.target.value)}
              />
              <Input
                id="portfolio"
                label="Portfolio URL"
                type="url"
                placeholder="https://yourportfolio.dev"
                value={profile.portfolio_url || ''}
                onChange={(e) => updateProfile('portfolio_url', e.target.value)}
              />
              <Input
                id="linkedin"
                label="LinkedIn URL"
                type="url"
                placeholder="https://linkedin.com/in/yourname"
                value={profile.linkedin_url || ''}
                onChange={(e) => updateProfile('linkedin_url', e.target.value)}
              />
            </div>
          </section>

          {/* ── Team Matching Toggle ────────────────────────────── */}
          <section className="rounded-xl border border-brand bg-card p-6">
            <h2 className="mb-2 text-base font-semibold text-primary">
              Team Matching
            </h2>
            <p className="mb-4 text-sm text-muted">
              When turned on, your profile appears in AutoMatch results for other teams.
              Turn it off once you have a team.
            </p>
            <label className="flex cursor-pointer items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={profile.looking_for_team}
                  onChange={(e) =>
                    updateProfile('looking_for_team', e.target.checked)
                  }
                />
                <div
                  className={`h-6 w-11 rounded-full transition-colors ${
                    profile.looking_for_team ? 'bg-[var(--brand-royal)]' : 'bg-[var(--border)]'
                  }`}
                />
                <div
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${
                    profile.looking_for_team ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="text-sm font-medium text-secondary">
                {profile.looking_for_team
                  ? 'Looking for a team — visible in AutoMatch'
                  : 'Not looking — hidden from AutoMatch'}
              </span>
            </label>
          </section>

          {/* ── Submit ─────────────────────────────────────────── */}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && (
            <p className="text-sm font-medium text-green-600">
              ✓ Profile saved successfully
            </p>
          )}

          <Button type="submit" isLoading={saving} fullWidth>
            Save Changes
          </Button>
        </form>
      </main>
    </div>
  );
}
