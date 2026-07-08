import Image from 'next/image';
import { FOUNDER, initials } from '@/app/lib/founder';

// EN founder trust anchor: a real person + the concrete safety signals a foreign
// B2B buyer can check, shown where they decide whether to trust the tool.
export default function FounderCard() {
  const f = FOUNDER;

  const signals = [
    'Suppliers cross-checked against live Korean government registries — MFDS cosmetics, HACCP food, medical-device, and a real-time National Tax Service business-status lookup.',
    'Payments are processed by Polar as merchant of record, so your card details never touch our servers.',
    'Direct founder support, in English, at hello@glosourceai.com.',
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-5">
      <div className="flex items-center gap-4">
        {f.photo ? (
          <Image
            src={f.photo}
            alt={f.name}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0D1B2A] text-lg font-black text-white"
          >
            {initials(f.name)}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-base font-black text-[#0D1B2A]">{f.name}</p>
          <p className="text-sm text-slate-500">{f.jobTitle} · {f.location}</p>
          {f.linkedin && (
            <a
              href={f.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs font-semibold text-[#EA580C] hover:underline"
            >
              LinkedIn →
            </a>
          )}
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {signals.map((s) => (
          <li key={s} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
