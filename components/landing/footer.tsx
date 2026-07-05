import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer id="about" className="border-t border-[var(--border)] bg-[var(--bg-primary)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <Link href="/" className="text-lg font-bold">
          <span className="text-[var(--brand-royal)]">Lego</span>
          <span className="text-[var(--text-primary)]">Link</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
          <Link href="/#about"   className="hover:text-[var(--brand-royal)]">About</Link>
          <Link href="/privacy"  className="hover:text-[var(--brand-royal)]">Privacy</Link>
          <Link href="/contact"  className="hover:text-[var(--brand-royal)]">Contact</Link>
        </nav>

        <div className="flex items-center gap-4 text-[var(--text-muted)]">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-[var(--brand-royal)]">
            <Github size={20} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-[var(--brand-royal)]">
            <Linkedin size={20} />
          </a>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} LegoLink. Built for WOW Hackathon @ GITAM University.
      </p>
    </footer>
  );
}
