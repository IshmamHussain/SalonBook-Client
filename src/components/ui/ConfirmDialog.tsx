'use client';

import { AlertTriangle, X } from 'lucide-react';
import React, { useEffect } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Keep',
  tone = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#16261F]/65 p-4 backdrop-blur-xs"
    >
      <div className="maison-card w-full max-w-md p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center border ${
                tone === 'danger'
                  ? 'border-rose-800/35 bg-rose-100 text-rose-900'
                  : 'border-[#B5893D]/50 bg-[#F4EFE6] text-[#1E3A2F]'
              }`}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            </div>
            <h2 id="confirm-dialog-title" className="font-display text-lg font-bold text-[#16261F]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close dialog"
            className="cursor-pointer p-1 text-[#495A52] transition-colors hover:text-[#16261F]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[#495A52]">{description}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-limestone cursor-pointer px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`cursor-pointer px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors disabled:opacity-50 ${
              tone === 'danger'
                ? 'border border-rose-900 bg-rose-800 text-white hover:bg-rose-900'
                : 'btn-emerald'
            }`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
