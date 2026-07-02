'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function CancelPolarButton({ subscriptionId }: { subscriptionId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !loading) setIsOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [isOpen, loading]);

  const handleCancel = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/billing/cancel-polar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        setError(json.error ?? 'Failed to cancel subscription. Please email hello@glosourceai.com for help.');
        return;
      }
      setIsOpen(false);
      router.refresh();
    } catch {
      setError('An error occurred. Please email hello@glosourceai.com for help.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => { setError(''); setIsOpen(true); }}
        className="rounded-xl border border-red-200 px-4 py-3 text-sm font-black text-red-700 hover:bg-red-50 transition-colors">
        Cancel subscription
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1B2A]/50 px-6"
          onClick={() => { if (!loading) setIsOpen(false); }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-sub-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 id="cancel-sub-title" className="text-lg font-black text-[#0D1B2A]">Cancel subscription?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Auto-renewal will stop after the current billing period ends. You keep full access until then.
            </p>
            {error && (
              <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setIsOpen(false)} disabled={loading}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-black text-[#0D1B2A] hover:bg-slate-50 disabled:opacity-60">
                Keep plan
              </button>
              <button type="button" onClick={handleCancel} disabled={loading}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-700 disabled:opacity-60">
                {loading ? 'Cancelling…' : 'Confirm cancel'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
