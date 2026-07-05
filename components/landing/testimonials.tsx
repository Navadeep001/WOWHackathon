const TESTIMONIALS = [
  {
    quote: 'LegoLink matched me with a backend dev and a UI designer in under 5 minutes. We went on to win second place at SIH.',
    name: 'Ananya Sharma',
    role: 'Frontend Developer, VIT Vellore',
    initial: 'A',
  },
  {
    quote: 'The AI Mentor generated our entire project architecture and the boilerplate at 2am when we were completely stuck.',
    name: 'Rahul Menon',
    role: 'Full Stack Dev, NIT Trichy',
    initial: 'R',
  },
  {
    quote: 'I had never been to a hackathon before. The roadmap feature told us exactly what to do hour by hour — we actually finished on time.',
    name: 'Priya Nair',
    role: 'AI/ML Engineer, BITS Pilani',
    initial: 'P',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-[var(--bg-secondary)] px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">What students say</h2>
          <p className="mt-3 text-[var(--text-muted)]">Real teams. Real wins.</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role, initial }) => (
            <div
              key={name}
              className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-200 hover:border-[var(--brand-royal)] hover:shadow-lg"
            >
              {/* Quote mark */}
              <span
                className="text-4xl font-bold leading-none bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #1B4FD8 0%, #3B9EFF 100%)' }}
              >
                "
              </span>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{quote}</p>
              <div className="mt-auto flex items-center gap-3">
                {/* Avatar with brand gradient */}
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #1B4FD8 0%, #3B9EFF 100%)' }}
                >
                  {initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
