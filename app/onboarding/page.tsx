'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { parseCommaSeparated } from '@/lib/utils';
import type {
  OnboardingFormData,
  PreferredRole,
  ExperienceLevel,
  OnboardingStep,
  ONBOARDING_STEPS,
} from '@/types/user';

const STEPS: OnboardingStep[] = [
  'Basic Information',
  'Technical Skills',
  'Availability',
  'Links',
];

const PREFERRED_ROLE_OPTIONS: { key: PreferredRole; label: string }[] = [
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'ai-ml', label: 'AI / ML' },
  { key: 'ui-ux', label: 'UI / UX' },
  { key: 'devops', label: 'DevOps' },
  { key: 'fullstack', label: 'Full Stack' },
];

const EXPERIENCE_OPTIONS: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];

const EMPTY_FORM: OnboardingFormData = {
  full_name: '',
  college: '',
  year_of_study: 1,
  skills: [],
  tech_stack: [],
  preferred_roles: [],
  experience_level: 'intermediate',
  availability_hours_per_day: 4,
  timezone: 'Asia/Kolkata',
  github_url: '',
  portfolio_url: '',
  linkedin_url: '',
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>(EMPTY_FORM);
  const [skillsInput, setSkillsInput] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/signup');
  }, [authLoading, user, router]);

  function update<K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleRole(role: PreferredRole) {
    setFormData((prev) => ({
      ...prev,
      preferred_roles: prev.preferred_roles.includes(role)
        ? prev.preferred_roles.filter((r) => r !== role)
        : [...prev.preferred_roles, role],
    }));
  }

  async function handleFinish() {
    if (!user) return;
    setSaving(true);
    setError('');

    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      ...formData,
      skills: parseCommaSeparated(skillsInput),
      tech_stack: parseCommaSeparated(techStackInput),
      looking_for_team: true,
    });

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
    } else {
      router.push('/dashboard');
    }
  }

  if (authLoading) return null;

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="flex min-h-screen items-center justify-center bg-page-alt px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Step progress indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    i < currentStep
                      ? 'bg-[var(--brand-royal)] text-white'
                      : i === currentStep
                      ? 'border-2 border-[var(--brand-royal)] text-brand'
                      : 'border-2 border-brand text-muted'
                  }`}
                >
                  {i < currentStep ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-12 ${i < currentStep ? 'bg-[var(--brand-royal)]' : 'bg-[var(--border)]'}`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm font-medium text-secondary">
            Step {currentStep + 1} of {STEPS.length} — {STEPS[currentStep]}
          </p>
        </div>

        {/* Step content */}
        <div className="rounded-xl border border-brand bg-card p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-primary">Basic Information</h2>
              <Input
                id="full-name"
                label="Full Name"
                placeholder="Navadeep"
                value={formData.full_name}
                onChange={(e) => update('full_name', e.target.value)}
                required
              />
              <Input
                id="college"
                label="College / University"
                placeholder="Raghu Engineering College"
                value={formData.college}
                onChange={(e) => update('college', e.target.value)}
                required
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-secondary">Year of Study</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => update('year_of_study', year)}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                        formData.year_of_study === year
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
          )}

          {/* Step 2: Technical Skills */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-primary">Technical Skills</h2>
              <Input
                id="skills"
                label="Skills (comma-separated)"
                placeholder="React, TypeScript, Python, Figma"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                hint="Add all skills you're comfortable with — more detail = better matching."
              />
              <Input
                id="tech-stack"
                label="Preferred Tech Stack (comma-separated)"
                placeholder="Next.js, Supabase, TailwindCSS"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
              />

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-secondary">Preferred Roles</label>
                <div className="flex flex-wrap gap-2">
                  {PREFERRED_ROLE_OPTIONS.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleRole(key)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                        formData.preferred_roles.includes(key)
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
                <label className="text-sm font-medium text-secondary">Experience Level</label>
                <div className="flex gap-2">
                  {EXPERIENCE_OPTIONS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => update('experience_level', level)}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium capitalize transition-colors ${
                        formData.experience_level === level
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
          )}

          {/* Step 3: Availability */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-primary">Availability</h2>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-secondary">
                  Hours available per day during hackathon
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={24}
                    value={formData.availability_hours_per_day}
                    onChange={(e) => update('availability_hours_per_day', Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-16 text-center text-sm font-semibold text-primary">
                    {formData.availability_hours_per_day}h / day
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="timezone" className="text-sm font-medium text-secondary">
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => update('timezone', e.target.value)}
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
          )}

          {/* Step 4: Links */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-primary">Your Links</h2>
              <p className="text-sm text-muted">
                Optional but recommended — teams often want to see your work before inviting you.
              </p>
              <Input
                id="github"
                label="GitHub URL"
                placeholder="https://github.com/yourusername"
                type="url"
                value={formData.github_url}
                onChange={(e) => update('github_url', e.target.value)}
              />
              <Input
                id="portfolio"
                label="Portfolio URL"
                placeholder="https://yourportfolio.dev"
                type="url"
                value={formData.portfolio_url}
                onChange={(e) => update('portfolio_url', e.target.value)}
              />
              <Input
                id="linkedin"
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/yourname"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => update('linkedin_url', e.target.value)}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((s) => s - 1)}
              disabled={currentStep === 0}
            >
              Back
            </Button>

            {isLastStep ? (
              <Button onClick={handleFinish} isLoading={saving}>
                Finish & Go to Dashboard
              </Button>
            ) : (
              <Button onClick={() => setCurrentStep((s) => s + 1)}>Next Step</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
