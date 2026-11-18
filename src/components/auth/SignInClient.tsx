'use client';

import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { authClient } from '@/lib/auth-client';
import { APP_URL } from '@/lib/constants';

export function SignInClient() {
  const { user, loading: authLoading, blockedMessage, refreshAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (callbackUrl && callbackUrl.startsWith('/')) {
        router.replace(callbackUrl);
      } else {
        router.replace(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/customer');
      }
    }
  }, [authLoading, user, callbackUrl, router]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.error) {
        toast.error(result.error.message || 'Invalid email or password.');
        setSubmitting(false);
        return;
      }

      const authedUser = await refreshAuth();
      if (!authedUser) {
        toast.error('Unable to activate your session. Your account may be blocked.');
        setSubmitting(false);
        return;
      }

      toast.success(`Welcome back, ${authedUser.name}!`);
      if (callbackUrl && callbackUrl.startsWith('/')) {
        router.push(callbackUrl);
      } else {
        router.push(authedUser.role === 'admin' ? '/dashboard/admin' : '/dashboard/customer');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const destination =
        callbackUrl && callbackUrl.startsWith('/') ? `${APP_URL}${callbackUrl}` : `${APP_URL}/dashboard`;
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: destination,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Google sign-in could not be started.');
      setGoogleLoading(false);
    }
  }

  return (
    <div className="terrace-ground flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-14">
      <div className="maison-card w-full max-w-md p-8 sm:p-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1E3A2F]">
          Sign In to SalonBook
        </h1>
        <p className="mt-2 text-sm text-[#495A52]">
          Access your appointments, protected service details, or salon administration console.
        </p>

        {blockedMessage && (
          <div
            className="mt-5 border border-rose-800/35 bg-rose-50 p-4 text-sm text-rose-900"
            role="alert"
          >
            {blockedMessage}
          </div>
        )}

        <form onSubmit={handleSignIn} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="signin-email"
              className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]"
            >
              Email Address
            </label>
            <div className="relative mt-2">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B5893D]"
                aria-hidden="true"
              />
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-[#C9BFA9] bg-[#FFFFFF] py-3 pl-10 pr-4 text-sm text-[#16261F] placeholder:text-[#7D8A83] focus:border-[#1E3A2F] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="signin-password"
              className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]"
            >
              Password
            </label>
            <div className="relative mt-2">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B5893D]"
                aria-hidden="true"
              />
              <input
                id="signin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-[#C9BFA9] bg-[#FFFFFF] py-3 pl-10 pr-11 text-sm text-[#16261F] placeholder:text-[#7D8A83] focus:border-[#1E3A2F] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-[#6D7B74] hover:text-[#1E3A2F]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-emerald inline-flex w-full cursor-pointer items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#D5C9B4]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#6D7B74]">or</span>
          <div className="h-px flex-1 bg-[#D5C9B4]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="btn-limestone inline-flex w-full cursor-pointer items-center justify-center gap-3 px-5 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.8-5.4 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12S6.7 21.6 12 21.6c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.3H12z" />
            </svg>
          )}
          Continue with Google
        </button>

        <p className="mt-7 text-center text-sm text-[#495A52]">
          New to SalonBook?{' '}
          <Link href="/sign-up" className="font-semibold text-[#1E3A2F] underline decoration-[#B5893D]">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
