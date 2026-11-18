'use client';

import { ArrowRight, Check, Eye, EyeOff, ImagePlus, Link2, Loader2, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { uploadImageToImgBB } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { APP_URL } from '@/lib/constants';

export function SignUpClient() {
  const { user, loading: authLoading, refreshAuth } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const hasMinLen = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const passwordValid = hasMinLen && hasUppercase && hasLowercase;

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
  }, [authLoading, user, router]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploadedUrl = await uploadImageToImgBB(file);
      setImageUrl(uploadedUrl);
      toast.success('Profile photo uploaded.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Profile image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please enter your full name and email address.');
      return;
    }
    if (!passwordValid) {
      toast.error('Password must be at least 6 characters with 1 uppercase and 1 lowercase letter.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        image: imageUrl.trim() || undefined,
      });

      if (result.error) {
        toast.error(result.error.message || 'Could not complete registration.');
        setSubmitting(false);
        return;
      }

      await refreshAuth();
      toast.success('Account created! Welcome to SalonBook.');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignUp() {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${APP_URL}/`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Google authentication could not start.');
      setGoogleLoading(false);
    }
  }

  return (
    <div className="terrace-ground flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-14">
      <div className="maison-card w-full max-w-lg p-8 sm:p-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1E3A2F]">
          Create Your SalonBook Account
        </h1>
        <p className="mt-2 text-sm text-[#495A52]">
          Register as a customer to submit appointment requests, track confirmations, and pay via Stripe.
        </p>

        <form onSubmit={handleSignUp} className="mt-7 space-y-5">
          <div>
            <label htmlFor="signup-name" className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]">
              Full Name
            </label>
            <div className="relative mt-2">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B5893D]" aria-hidden="true" />
              <input
                id="signup-name"
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Camille Laurent"
                className="w-full border border-[#C9BFA9] bg-[#FFFFFF] py-3 pl-10 pr-4 text-sm text-[#16261F] placeholder:text-[#7D8A83] focus:border-[#1E3A2F] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-email" className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]">
              Email Address
            </label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B5893D]" aria-hidden="true" />
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-[#C9BFA9] bg-[#FFFFFF] py-3 pl-10 pr-4 text-sm text-[#16261F] placeholder:text-[#7D8A83] focus:border-[#1E3A2F] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-password" className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]">
              Password
            </label>
            <div className="relative mt-2">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B5893D]" aria-hidden="true" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
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

            <div className="mt-2.5 flex flex-wrap gap-3 font-mono text-[11px]">
              <span className={`inline-flex items-center gap-1 ${hasMinLen ? 'font-semibold text-emerald-800' : 'text-[#6D7B74]'}`}>
                <Check className="h-3 w-3" aria-hidden="true" /> 6+ chars
              </span>
              <span className={`inline-flex items-center gap-1 ${hasUppercase ? 'font-semibold text-emerald-800' : 'text-[#6D7B74]'}`}>
                <Check className="h-3 w-3" aria-hidden="true" /> 1 uppercase
              </span>
              <span className={`inline-flex items-center gap-1 ${hasLowercase ? 'font-semibold text-emerald-800' : 'text-[#6D7B74]'}`}>
                <Check className="h-3 w-3" aria-hidden="true" /> 1 lowercase
              </span>
            </div>
          </div>

          {/* Profile Image: Upload OR URL */}
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]">
                Profile Image (Optional)
              </span>
              <div className="flex border border-[#C9BFA9] bg-[#F4EFE6] font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`inline-flex cursor-pointer items-center gap-1 px-2.5 py-1 ${
                    imageMode === 'upload' ? 'bg-[#1E3A2F] font-semibold text-[#FBF9F5]' : 'text-[#495A52]'
                  }`}
                >
                  <ImagePlus className="h-3 w-3" aria-hidden="true" /> Upload
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`inline-flex cursor-pointer items-center gap-1 px-2.5 py-1 ${
                    imageMode === 'url' ? 'bg-[#1E3A2F] font-semibold text-[#FBF9F5]' : 'text-[#495A52]'
                  }`}
                >
                  <Link2 className="h-3 w-3" aria-hidden="true" /> Image URL
                </button>
              </div>
            </div>

            {imageMode === 'upload' ? (
              <div className="mt-2 flex items-center gap-3">
                <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 border border-dashed border-[#B5893D] bg-[#FFFFFF] px-4 py-3 text-xs font-medium text-[#495A52] transition-colors hover:border-[#1E3A2F] hover:text-[#1E3A2F]">
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#B5893D]" aria-hidden="true" />
                      Uploading to ImgBB...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-4 w-4 text-[#B5893D]" aria-hidden="true" />
                      {imageUrl ? 'Replace uploaded image' : 'Choose profile photo (JPG/PNG/WebP)'}
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploadingImage}
                    className="sr-only"
                  />
                </label>
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Profile preview"
                    className="h-11 w-11 shrink-0 rounded-full border border-[#B5893D] object-cover"
                  />
                )}
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/your-photo.jpg"
                  aria-label="Profile image URL"
                  className="flex-1 border border-[#C9BFA9] bg-[#FFFFFF] px-4 py-3 text-sm text-[#16261F] placeholder:text-[#7D8A83] focus:border-[#1E3A2F] focus:outline-none"
                />
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Profile preview"
                    className="h-11 w-11 shrink-0 rounded-full border border-[#B5893D] object-cover"
                  />
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || uploadingImage}
            className="btn-emerald inline-flex w-full cursor-pointer items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
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
          onClick={handleGoogleSignUp}
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
          Sign Up with Google
        </button>

        <p className="mt-7 text-center text-sm text-[#495A52]">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-semibold text-[#1E3A2F] underline decoration-[#B5893D]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
