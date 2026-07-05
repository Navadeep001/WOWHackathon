'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Chrome } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { signUpWithEmail, signInWithGoogle } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoadingEmail(true);
    try {
      await signUpWithEmail(email, password, fullName);
      // After signup, go to onboarding to fill in the profile
      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed.');
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleGoogleSignup() {
    setError('');
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
      // Google OAuth redirects to /dashboard; new users get redirected to /onboarding
      // via middleware (to be configured) if profile is incomplete
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google signup failed.');
      setLoadingGoogle(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page-alt px-4">
      <div className="w-full max-w-sm rounded-xl border border-brand bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-primary">Create your account</h1>
        <p className="mt-1 text-sm text-muted">
          Join LegoLink and find your perfect hackathon team.
        </p>

        {/* Google OAuth */}
        <Button
          variant="outline"
          fullWidth
          className="mt-6"
          onClick={handleGoogleSignup}
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

        {/* Email form */}
        <form onSubmit={handleEmailSignup} className="flex flex-col gap-4">
          <Input
            id="full-name"
            label="Full Name"
            placeholder="Navadeep"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
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
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" fullWidth isLoading={loadingEmail}>
            Create Account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
