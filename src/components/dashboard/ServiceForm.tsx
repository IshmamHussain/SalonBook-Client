'use client';

import { ArrowLeft, ImagePlus, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { apiRequest, uploadImageToImgBB } from '@/lib/api';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import type { SalonService, ServiceStatus } from '@/types';

interface ServiceFormProps {
  mode: 'create' | 'edit';
  initialService?: SalonService;
}

export function ServiceForm({ mode, initialService }: ServiceFormProps) {
  const router = useRouter();

  const [serviceName, setServiceName] = useState(initialService?.serviceName || '');
  const [category, setCategory] = useState<string>(initialService?.category || SERVICE_CATEGORIES[0]);
  const [description, setDescription] = useState(initialService?.description || '');
  const [price, setPrice] = useState(initialService ? String(initialService.price) : '');
  const [duration, setDuration] = useState(initialService ? String(initialService.duration) : '');
  const [image, setImage] = useState(initialService?.image || '');
  const [status, setStatus] = useState<ServiceStatus>(initialService?.status || 'active');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadedUrl = await uploadImageToImgBB(file);
      setImage(uploadedUrl);
      toast.success('Service image uploaded successfully.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Service image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsedPrice = Number(price);
    const parsedDuration = Number(duration);

    if (!serviceName.trim() || serviceName.trim().length < 2) {
      toast.error('Please enter a valid service name.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      toast.error('Description must be at least 10 characters.');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error('Price must be a positive number.');
      return;
    }
    if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
      toast.error('Estimated duration must be a positive whole number of minutes.');
      return;
    }
    if (!image) {
      toast.error('Please upload a service image before saving.');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        serviceName: serviceName.trim(),
        category,
        description: description.trim(),
        price: parsedPrice,
        duration: parsedDuration,
        image,
        status,
      };

      if (mode === 'create') {
        await apiRequest('/api/admin/services', {
          method: 'POST',
          auth: true,
          body: JSON.stringify(body),
        });
        toast.success('Salon service created successfully.');
      } else if (initialService) {
        await apiRequest(`/api/admin/services/${initialService.id}`, {
          method: 'PATCH',
          auth: true,
          body: JSON.stringify(body),
        });
        toast.success('Salon service updated successfully.');
      }

      router.push('/dashboard/admin/services');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save salon service.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/admin/services"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[#495A52] hover:text-[#1E3A2F]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Manage Services
      </Link>

      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1E3A2F]">
          {mode === 'create' ? 'Add New Salon Service' : 'Update Salon Service'}
        </h1>
        <p className="mt-1.5 text-sm text-[#495A52]">
          Upload a high-resolution image directly to ImgBB and set pricing, duration, and active visibility.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="maison-card space-y-6 p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="service-name" className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]">
              Service Name
            </label>
            <input
              id="service-name"
              type="text"
              required
              minLength={2}
              maxLength={120}
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g., Precision Architectural Haircut & Blowout"
              className="mt-2 w-full border border-[#C9BFA9] bg-[#FFFFFF] px-4 py-3 text-sm text-[#16261F] placeholder:text-[#7D8A83] focus:border-[#1E3A2F] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="service-category" className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]">
              Service Category
            </label>
            <select
              id="service-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full cursor-pointer border border-[#C9BFA9] bg-[#FFFFFF] px-4 py-3 text-sm text-[#16261F] focus:border-[#1E3A2F] focus:outline-none"
            >
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="service-status" className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]">
              Service Status
            </label>
            <select
              id="service-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ServiceStatus)}
              className="mt-2 w-full cursor-pointer border border-[#C9BFA9] bg-[#FFFFFF] px-4 py-3 text-sm text-[#16261F] focus:border-[#1E3A2F] focus:outline-none"
            >
              <option value="active">Active (Visible &amp; Bookable)</option>
              <option value="inactive">Inactive (Hidden from Customers)</option>
            </select>
          </div>

          <div>
            <label htmlFor="service-price" className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]">
              Price (USD)
            </label>
            <input
              id="service-price"
              type="number"
              required
              min="1"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="85"
              className="mt-2 w-full border border-[#C9BFA9] bg-[#FFFFFF] px-4 py-3 font-mono text-sm tabular-nums text-[#16261F] placeholder:text-[#7D8A83] focus:border-[#1E3A2F] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="service-duration" className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]">
              Estimated Duration (Minutes)
            </label>
            <input
              id="service-duration"
              type="number"
              required
              min="5"
              step="5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
              className="mt-2 w-full border border-[#C9BFA9] bg-[#FFFFFF] px-4 py-3 font-mono text-sm tabular-nums text-[#16261F] placeholder:text-[#7D8A83] focus:border-[#1E3A2F] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="service-description" className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]">
            Description
          </label>
          <textarea
            id="service-description"
            required
            minLength={10}
            maxLength={1500}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the treatment craft, products used, and expected salon experience..."
            className="mt-2 w-full border border-[#C9BFA9] bg-[#FFFFFF] px-4 py-3 text-sm text-[#16261F] placeholder:text-[#7D8A83] focus:border-[#1E3A2F] focus:outline-none"
          />
        </div>

        {/* Service Image Upload ONLY (No Image URL input per requirements) */}
        <div>
          <span className="block font-mono text-xs uppercase tracking-[0.12em] text-[#495A52]">
            Service Image (Upload via ImgBB)
          </span>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-[#B5893D] bg-[#FFFFFF] p-6 text-center transition-colors hover:border-[#1E3A2F]">
              {uploading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-[#B5893D]" aria-hidden="true" />
                  <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#1E3A2F]">
                    Uploading to ImgBB...
                  </span>
                </>
              ) : (
                <>
                  <ImagePlus className="h-6 w-6 text-[#B5893D]" aria-hidden="true" />
                  <span className="text-sm font-medium text-[#16261F]">
                    {image ? 'Upload a replacement photo' : 'Click to upload service image'}
                  </span>
                  <span className="font-mono text-[11px] text-[#6D7B74]">
                    JPG, PNG, WebP · Max 5MB
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={uploading}
                className="sr-only"
              />
            </label>

            <div className="flex min-h-[160px] items-center justify-center overflow-hidden border border-[#D5C9B4] bg-[#F4EFE6]">
              {image ? (
                <img
                  src={image}
                  alt={serviceName || 'Uploaded service preview'}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#6D7B74]">
                  No image uploaded yet
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="btn-emerald inline-flex cursor-pointer items-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" aria-hidden="true" />
                {mode === 'create' ? 'Publish Service' : 'Save Updates'}
              </>
            )}
          </button>
          <Link
            href="/dashboard/admin/services"
            className="btn-limestone px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
