'use client';

import { useState } from 'react';
import { trackSampleReportRequest } from '@/app/lib/analytics';

const REPORTS = {
  serum: {
    label: 'Serum OEM',
    description: 'Formula, active ingredients, packaging, testing, and pilot MOQ questions.',
  },
  sunscreen: {
    label: 'Sunscreen OEM',
    description: 'Target-market compliance, SPF testing, claims, and documentation questions.',
  },
  'sheet-mask': {
    label: 'Sheet Mask OEM',
    description: 'Sheet material, essence fill, sachet packaging, testing, and MOQ questions.',
  },
} as const;

type ReportKey = keyof typeof REPORTS;
type Status = 'idle' | 'loading' | 'done' | 'error';

export default function SampleReportLeadForm() {
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<ReportKey>('serum');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [reportUrl, setReportUrl] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source: `kbeauty_sample_report:${category}`,
        }),
      });
      const data = await response.json() as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        setStatus('error');
        setMessage(data.error ?? 'We could not save your request. Please try again.');
        return;
      }

      trackSampleReportRequest(category);
      setReportUrl(`/en/sample-reports/${category}`);
      setStatus('done');
      setMessage(`Your ${REPORTS[category].label} sample report is ready — open it below.`);
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again or email hello@glosourceai.com.');
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div className="grid gap-3">
        {(Object.entries(REPORTS) as [ReportKey, (typeof REPORTS)[ReportKey]][]).map(([key, report]) => {
          const selected = category === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              aria-pressed={selected}
              className={`rounded-2xl border p-5 text-left transition-all focus:outline-none focus:ring-2 focus:ring-[#EA580C] focus:ring-offset-2 ${
                selected
                  ? 'border-[#EA580C] bg-orange-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className={`text-xs font-black uppercase tracking-[0.16em] ${selected ? 'text-[#EA580C]' : 'text-slate-400'}`}>
                Free sample
              </span>
              <span className="mt-2 block text-lg font-black text-[#0D1B2A]">{report.label}</span>
              <span className="mt-1 block text-sm leading-6 text-slate-500">{report.description}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-[#0D1B2A] p-6 text-white shadow-xl shadow-slate-900/10">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Selected report</p>
        <h3 className="mt-2 text-2xl font-black">{REPORTS[category].label}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          See the shortlist structure, evidence fields, risk questions, RFQ draft, and buyer checklist before you pay.
        </p>

        <label className="mt-6 block text-xs font-bold text-slate-200" htmlFor="sample-report-email">
          Work email
        </label>
        <input
          id="sample-report-email"
          type="email"
          name="email"
          autoComplete="email"
          spellCheck={false}
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@yourbrand.com"
          required
          className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
        />

        <button
          type="submit"
          disabled={status === 'loading'}
          className="mt-4 w-full rounded-xl bg-[#EA580C] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-[#DC4C00] focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-[#0D1B2A] disabled:cursor-wait disabled:opacity-60"
        >
          {status === 'loading' ? 'Saving request…' : 'Download a Free K-Beauty OEM Sample Report'}
        </button>

        <p className="mt-3 text-[11px] leading-5 text-slate-400">
          No supplier is presented as verified. Sample reports are research examples and require independent due diligence.
        </p>
        <p className="mt-2 text-[11px] leading-5 text-slate-400">
          We only use your email to send sourcing insights. No spam, unsubscribe anytime.
        </p>

        {message ? (
          <div className="mt-4">
            <p
              role="status"
              className={`rounded-lg px-3 py-2 text-xs leading-5 ${
                status === 'done' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-red-500/15 text-red-200'
              }`}
            >
              {message}
            </p>
            {status === 'done' && reportUrl ? (
              <a
                href={reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block w-full rounded-xl bg-white px-4 py-3 text-center text-sm font-black text-[#0D1B2A] transition-colors hover:bg-slate-100"
              >
                Open your {REPORTS[category].label} sample report →
              </a>
            ) : null}
          </div>
        ) : null}
      </form>
    </div>
  );
}
