import { Users, Search, Map, Bot } from 'lucide-react';

const FEATURES = [
  {
    icon: Users,
    title: 'AI Team Matching',
    description: 'Finds teammates based on skill gaps, experience diversity, and role requirements — not just who is available.',
  },
  {
    icon: Search,
    title: 'Hackathon Discovery',
    description: 'Browse upcoming hackathons across AI, Web3, HealthTech, FinTech, and more in one unified dashboard.',
  },
  {
    icon: Map,
    title: 'AI Project Manager',
    description: 'Generates a time-boxed roadmap and assigns tasks to the right person based on their actual skills.',
  },
  {
    icon: Bot,
    title: 'AI Mentor',
    description: 'Structures ideas, generates boilerplates, and answers your 3am questions with full team context.',
  },
];

export function Features() {
  return (
    <section id="features" className="bg-[var(--bg-secondary)] px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">
            Everything your team needs to win
          </h2>
          <p className="mt-3 text-[var(--text-muted)]">
            From finding your team to submitting your project — all in one place.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-200 hover:border-[var(--brand-royal)] hover:shadow-lg"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg, #1B4FD8 0%, #3B9EFF 100%)' }}
              >
                <Icon size={22} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">{title}</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
