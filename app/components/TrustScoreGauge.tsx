import type { CSSProperties } from 'react';

interface TrustScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md';
  muted?: boolean;
  lang?: 'ko' | 'en';
}

function getGaugeColor(score: number, muted: boolean): string {
  if (muted) return 'bg-slate-400';
  if (score <= 49) return 'bg-red-500';
  if (score <= 74) return 'bg-yellow-500';
  return 'bg-green-500';
}

export default function TrustScoreGauge({ score, size = 'md', muted = false, lang = 'en' }: TrustScoreGaugeProps) {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const unit = lang === 'en' ? ' pts' : '점';
  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2.5';
  const textClass = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="min-w-[88px]">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className={`${textClass} font-bold tabular-nums ${muted ? 'text-slate-400' : 'text-slate-700'}`}>
          {/* The counter is drawn in ::after content, which assistive tech reads unreliably. */}
          <span className="sr-only">{normalizedScore}{unit}</span>
          <span aria-hidden="true" className="gs-countup" style={{ '--gs-target': normalizedScore } as CSSProperties} />
          <span aria-hidden="true">{unit}</span>
        </span>
        <span className="text-[10px] font-medium text-slate-400">Trust</span>
      </div>
      <div className={`${heightClass} overflow-hidden rounded-full bg-slate-200`}>
        <div
          className={`gs-gauge-fill ${heightClass} rounded-full ${getGaugeColor(normalizedScore, muted)}`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  );
}
