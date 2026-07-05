import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg-primary)] px-6 py-24 text-center">

      {/* Brand gradient glow behind the headline */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #3B9EFF 0%, #1B4FD8 60%, transparent 100%)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-3xl">
        {/* Pill badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-1.5 text-xs font-medium text-[var(--text-muted)]">
          🚀 Built for WOW Hackathon · GITAM University
        </span>

        {/* Headline */}
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
          Find the right teammates.{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #1B4FD8 0%, #3B9EFF 100%)' }}
          >
            Build winning projects.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--text-muted)]">
          Discover hackathons, form balanced teams, and let AI guide your project
          from idea to submission — all in one place.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/signup">
            <Button size="lg">
              Get Started <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              Explore Hackathons
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-14 flex items-center justify-center gap-12">
          {[
            { value: '1,200+', label: 'Teams Formed' },
            { value: '400+',   label: 'Projects Built' },
            { value: '50+',    label: 'Hackathons Listed' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p
                className="text-3xl font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #1B4FD8 0%, #3B9EFF 100%)' }}
              >
                {value}
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
