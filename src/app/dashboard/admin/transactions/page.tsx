'use client';

import { Copy, ShieldCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { apiRequest } from '@/lib/api';
import type { TransactionRecord } from '@/types';

function shortenSessionId(id: string) {
  if (!id || id.length <= 18) return id;
  return `${id.slice(0, 10)}...${id.slice(-6)}`;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest<{ success: boolean; transactions: TransactionRecord[] }>(
          '/api/admin/transactions',
          { auth: true }
        );
        if (!active) return;
        setTransactions(res.transactions || []);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load payment transactions.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function copySessionRef(sessionId: string) {
    try {
      await navigator.clipboard.writeText(sessionId);
      toast.success('Stripe session reference copied.');
    } catch {
      toast.error('Unable to copy session ID.');
    }
  }

  if (loading) return <LoadingSpinner label="Loading Stripe transactions..." />;

  if (error) {
    return <div className="atelier-surface p-8 text-center text-sm text-rose-300">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#F4F6F8]">
            Payment Transactions
          </h1>
          <p className="mt-1.5 text-sm text-[#B4C2CF]">
            Immutable Stripe payment ledger populated exclusively by verified Stripe webhook events.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 border border-teal-400/35 bg-teal-400/10 px-3.5 py-2 font-mono text-xs uppercase tracking-[0.12em] text-teal-200">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Read-Only Audit Log
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="atelier-surface p-12 text-center">
          <p className="font-display text-xl font-bold text-[#F4F6F8]">No transactions recorded yet</p>
          <p className="mt-2 text-sm text-[#B4C2CF]">
            Completed Stripe Checkout payments will appear here once verified by the webhook.
          </p>
        </div>
      ) : (
        <div className="atelier-surface overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/12 bg-[#121922] font-mono text-[11px] uppercase tracking-[0.14em] text-[#8DB4D4]">
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Related Service</th>
                <th className="px-5 py-3.5">Appointment Date</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Stripe Session</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Transaction Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {transactions.map((tx) => (
                <tr key={tx.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#F4F6F8]">{tx.customerName}</p>
                    <p className="text-xs text-[#7F92A4]">{tx.customerEmail}</p>
                  </td>
                  <td className="px-5 py-4 text-[#D0DCE7]">{tx.serviceName}</td>
                  <td className="px-5 py-4 font-mono text-xs tabular-nums text-[#B4C2CF]">
                    {tx.appointmentDate || '—'}
                    {tx.timeSlot ? ` · ${tx.timeSlot}` : ''}
                  </td>
                  <td className="px-5 py-4 font-mono font-semibold tabular-nums text-[#E08A5E]">
                    ${Number(tx.amount).toFixed(2)} {tx.currency}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => copySessionRef(tx.stripeSessionId)}
                      title={tx.stripeSessionId}
                      className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs text-[#8DB4D4] hover:text-[#F4F6F8]"
                    >
                      <span>{shortenSessionId(tx.stripeSessionId)}</span>
                      <Copy className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge variant={tx.status} />
                  </td>
                  <td className="px-5 py-4 font-mono text-xs tabular-nums text-[#7F92A4]">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
