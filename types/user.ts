export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type PreferredRole =
  | 'frontend'
  | 'backend'
  | 'ai-ml'
  | 'ui-ux'
  | 'devops'
  | 'fullstack';

export interface Profile {
  id: string;                     // matches supabase auth.users.id
  email: string;
  full_name: string;
  college: string;
  year_of_study: number;          // 1 | 2 | 3 | 4
  skills: string[];               // e.g. ["React", "TypeScript", "Figma"]
  tech_stack: string[];           // e.g. ["Next.js", "Supabase", "TailwindCSS"]
  preferred_roles: PreferredRole[];
  experience_level: ExperienceLevel;
  availability_hours_per_day: number;
  timezone: string;               // e.g. "Asia/Kolkata"
  github_url?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  avatar_url?: string;
  looking_for_team: boolean;
  created_at?: string;
}

// Used in the multi-step onboarding form before final submission
export interface OnboardingFormData {
  // Step 1 — Basic Information
  full_name: string;
  college: string;
  year_of_study: number;

  // Step 2 — Technical Information
  skills: string[];
  tech_stack: string[];
  preferred_roles: PreferredRole[];
  experience_level: ExperienceLevel;

  // Step 3 — Availability
  availability_hours_per_day: number;
  timezone: string;

  // Step 4 — Links
  github_url: string;
  portfolio_url: string;
  linkedin_url: string;
}

export const ONBOARDING_STEPS = [
  'Basic Information',
  'Technical Skills',
  'Availability',
  'Links',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
