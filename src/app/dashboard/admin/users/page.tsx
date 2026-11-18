'use client';

import { Ban, CheckCircle2, Eye, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { apiRequest } from '@/lib/api';
import type { UserProfile } from '@/types';

export default function AdminManageUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsUser, setDetailsUser] = useState<UserProfile | null>(null);
  const [blockTarget, setBlockTarget] = useState<UserProfile | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<{ success: boolean; users: UserProfile[] }>('/api/admin/users', {
        auth: true,
      });
      setUsers(res.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load registered customers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleConfirmToggleBlock() {
    if (!blockTarget) return;
    const nextBlocked = !blockTarget.isBlocked;
    const previous = users;

    setUsers((curr) =>
      curr.map((u) => (u.id === blockTarget.id ? { ...u, isBlocked: nextBlocked } : u))
    );
    setUpdating(true);

    try {
      const res = await apiRequest<{ success: boolean; message: string }>(
        `/api/admin/users/${blockTarget.id}/block`,
        {
          method: 'PATCH',
          auth: true,
          body: JSON.stringify({ isBlocked: nextBlocked }),
        }
      );
      toast.success(res.message);
      setBlockTarget(null);
    } catch (err) {
      setUsers(previous);
      toast.error(err instanceof Error ? err.message : 'Unable to update user status.');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading registered customers..." />;

  if (error) {
    return <div className="maison-card p-8 text-center text-sm text-rose-800">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1E3A2F]">
          Manage Customers
        </h1>
        <p className="mt-1.5 text-sm text-[#495A52]">
          Review registered customer accounts and block or unblock access to protected booking and payment features.
        </p>
      </div>

      {users.length === 0 ? (
        <div className="maison-card p-12 text-center">
          <p className="font-display text-xl font-semibold text-[#1E3A2F]">No registered customers yet</p>
        </div>
      ) : (
        <div className="maison-card overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#D5C9B4] bg-[#EBE4D6] font-mono text-[11px] uppercase tracking-[0.14em] text-[#1E3A2F]">
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Appointments</th>
                <th className="px-5 py-3.5">Account Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D9C8]">
              {users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-[#F4EFE6]/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {u.image ? (
                        <img
                          src={u.image}
                          alt={u.name}
                          className="h-9 w-9 rounded-full border border-[#B5893D]/60 object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E3A2F] font-display text-xs font-bold text-[#E8CF9C]">
                          {u.name?.charAt(0)?.toUpperCase() || 'C'}
                        </span>
                      )}
                      <span className="font-semibold text-[#16261F]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#495A52]">{u.email}</td>
                  <td className="px-5 py-4 font-mono text-xs tabular-nums text-[#16261F]">
                    {u.appointmentCount ?? 0}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge variant={u.isBlocked ? 'blocked' : 'active'} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailsUser(u)}
                        className="inline-flex cursor-pointer items-center gap-1 border border-[#C9BFA9] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#16261F] hover:border-[#1E3A2F]"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        Details
                      </button>

                      <button
                        type="button"
                        onClick={() => setBlockTarget(u)}
                        className={`inline-flex cursor-pointer items-center gap-1 border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          u.isBlocked
                            ? 'border-emerald-800/35 bg-emerald-50 text-emerald-950 hover:bg-emerald-100'
                            : 'border-rose-800/35 bg-rose-50 text-rose-900 hover:bg-rose-100'
                        }`}
                      >
                        {u.isBlocked ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                            Block
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailsUser && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Customer details"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#16261F]/65 p-4 backdrop-blur-xs"
        >
          <div className="maison-card w-full max-w-md p-7 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#E2D9C8] pb-4">
              <div className="flex items-center gap-3">
                {detailsUser.image ? (
                  <img
                    src={detailsUser.image}
                    alt={detailsUser.name}
                    className="h-11 w-11 rounded-full border border-[#B5893D] object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1E3A2F] font-display font-bold text-[#E8CF9C]">
                    {detailsUser.name?.charAt(0)?.toUpperCase() || 'C'}
                  </span>
                )}
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#1E3A2F]">{detailsUser.name}</h2>
                  <p className="text-xs text-[#6D7B74]">{detailsUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailsUser(null)}
                aria-label="Close customer details"
                className="cursor-pointer p-1 text-[#495A52] hover:text-[#16261F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#6D7B74]">Phone</dt>
                <dd className="font-mono text-xs">{detailsUser.phone || 'Not provided'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6D7B74]">Total Bookings</dt>
                <dd className="font-mono text-xs tabular-nums">{detailsUser.appointmentCount ?? 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6D7B74]">Status</dt>
                <dd>
                  <StatusBadge variant={detailsUser.isBlocked ? 'blocked' : 'active'} />
                </dd>
              </div>
              {detailsUser.createdAt && (
                <div className="flex justify-between">
                  <dt className="text-[#6D7B74]">Joined</dt>
                  <dd className="font-mono text-xs">
                    {new Date(detailsUser.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(blockTarget)}
        title={blockTarget?.isBlocked ? 'Unblock customer account?' : 'Block customer account?'}
        description={
          blockTarget
            ? blockTarget.isBlocked
              ? `Restore protected platform access for ${blockTarget.name} (${blockTarget.email})?`
              : `Block ${blockTarget.name} (${blockTarget.email})? Blocked users are immediately denied access to all protected routes and APIs.`
            : ''
        }
        confirmLabel={blockTarget?.isBlocked ? 'Unblock User' : 'Block User'}
        cancelLabel="Cancel"
        tone={blockTarget?.isBlocked ? 'primary' : 'danger'}
        loading={updating}
        onConfirm={handleConfirmToggleBlock}
        onCancel={() => setBlockTarget(null)}
      />
    </div>
  );
}
