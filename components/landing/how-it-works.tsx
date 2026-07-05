const STEPS = [
  { step: '01', title: 'Create your profile', description: 'Add your skills, preferred roles, and availability in our quick onboarding flow.' },
  { step: '02', title: 'Find a hackathon', description: 'Browse upcoming hackathons and click Interested on the ones you want to join.' },
  { step: '03', title: 'Form your team', description: 'Create a team and let AI AutoMatch suggest the best candidates — or join a team that needs your skills.' },
  { step: '04', title: 'Build with AI', description: 'Use the Project Workspace to get a roadmap, assign tasks, and ask your AI mentor anytime.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[var(--bg-primary)] px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">How LegoLink works</h2>
          <p className="mt-3 text-[var(--text-muted)]">Four steps from sign-up to submission.</p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ step, title, description }) => (
            <div key={step} className="flex flex-col gap-3">
              <span
                className="text-5xl font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #1B4FD8 0%, #3B9EFF 100%)' }}
              >
                {step}
              </span>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
