'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Chrome } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoadingEmail(true);
    try {
      await signInWithEmail(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
      // Google OAuth redirects to /dashboard automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed.');
      setLoadingGoogle(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page-alt px-4">
      <div className="w-full max-w-sm rounded-xl border border-brand bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-primary">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Log in to continue to LegoLink.</p>

        {/* Google OAuth */}
        <Button
          variant="outline"
          fullWidth
          className="mt-6"
          onClick={handleGoogleLogin}
          isLoading={loadingGoogle}
        >
          <Chrome size={18} />
          Continue with Google
        </Button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs text-muted">or</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        {/* Email/password form */}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" fullWidth isLoading={loadingEmail}>
            Log in
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-brand hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
