'use client';

import { ImagePlus, Link2, Loader2, Phone, Save, ShieldCheck, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { apiRequest, uploadImageToImgBB } from '@/lib/api';
import type { UserProfile } from '@/types';

export function ProfileManager() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [image, setImage] = useState(user?.image || '');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setImage(user.image || '');
    }
  }, [user]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToImgBB(file);
      setImage(url);
      toast.success('Profile image uploaded to ImgBB.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    try {
      const res = await apiRequest<{ success: boolean; message: string; user: UserProfile }>(
        '/api/profile',
        {
          method: 'PATCH',
          auth: true,
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            image: image.trim(),
          }),
        }
      );

      setUser(res.user);
      toast.success(res.message || 'Profile updated successfully.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1E3A2F]">
          My Profile
        </h1>
        <p className="mt-1.5 text-sm text-[#495A52]">
          Update your display name, contact number, and profile photo. Role and account status are enforced strictly on the server.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="maison-card space-y-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-4 border-b border-[#E2D9C8] pb-6">
          {image ? (
            <img
              src={image}
              alt={name || user.name}
              className="h-18 w-18 rounded-full border-2 border-[#B5893D] object-cover"
            />
          ) : (
            <span className="flex h-18 w-18 items-center justify-center rounded-full border border-[#B5893D] bg-[#1E3A2F] font-display text-2xl font-bold text-[#E8CF9C]">
              {(name || user.name).charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-display text-xl font-semibold text-[#1E3A2F]">{name || user.name}</p>
            <p className="text-sm text-[#495A52]">{user.email}</p>
            <span className="mt-1.5 inline-flex items-center gap-1.5 border border-[#B5893D]/60 bg-[#F4EFE6] px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[#1E3A2F]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#B5893D]" aria-hidden="true" />
              Role: {user.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-name" className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]">
              Full Name
            </label>
            <div className="relative mt-2">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B5893D]" aria-hidden="true" />
              <input
                id="profile-name"
                type="text"
                required
                minLength={2}
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#C9BFA9] bg-[#FFFFFF] py-3 pl-10 pr-4 text-sm text-[#16261F] focus:border-[#1E3A2F] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-phone" className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]">
              Phone Number
            </label>
            <div className="relative mt-2">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B5893D]" aria-hidden="true" />
              <input
                id="profile-phone"
                type="tel"
                maxLength={30}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (212) 555-0194"
                className="w-full border border-[#C9BFA9] bg-[#FFFFFF] py-3 pl-10 pr-4 text-sm text-[#16261F] placeholder:text-[#7D8A83] focus:border-[#1E3A2F] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Profile Image (Upload or URL) */}
        <div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]">
              Profile Image
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
            <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 border border-dashed border-[#B5893D] bg-[#FFFFFF] px-4 py-4 text-xs font-medium text-[#495A52] transition-colors hover:border-[#1E3A2F] hover:text-[#1E3A2F]">
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#B5893D]" aria-hidden="true" />
                  Uploading to ImgBB...
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4 text-[#B5893D]" aria-hidden="true" />
                  Upload new profile image
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="sr-only"
              />
            </label>
          ) : (
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              aria-label="Profile image URL"
              className="mt-2 w-full border border-[#C9BFA9] bg-[#FFFFFF] px-4 py-3 text-sm text-[#16261F] placeholder:text-[#7D8A83] focus:border-[#1E3A2F] focus:outline-none"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="btn-emerald inline-flex cursor-pointer items-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Saving Profile...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}
