'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CancelPolarButton({ subscriptionId }: { subscriptionId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/cancel-polar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        alert(json.error ?? 'Failed to cancel subscription. Please email hello@glosource.ai for help.');
        return;
      }
      setIsOpen(false);
      router.refresh();
    } catch {
      alert('An error occurred. Please email hello@glosource.ai for help.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}
        className="rounded-xl border border-red-200 px-4 py-3 text-sm font-black text-red-700 hover:bg-red-50 transition-colors">
        Cancel subscription
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1B2A]/50 px-6">
          <section className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#0D1B2A]">Cancel subscription?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Auto-renewal will stop after the current billing period ends. You keep full access until then.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-[#0D1B2A] hover:bg-slate-50">
                Keep plan
              </button>
              <button type="button" onClick={handleCancel} disabled={loading}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-700 disabled:opacity-60">
                {loading ? 'Cancelling...' : 'Confirm cancel'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
