'use client';
import { useState } from 'react';

interface ShareButtonProps {
  keyword: string;
  supplierCount: number;
}

export default function ShareButton({ keyword, supplierCount }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `GloSource AI로 "${keyword}" 공급자 후보 ${supplierCount}개 발굴 완료! 🔍\n신뢰도 점수·가격·RFQ 초안 자동 작성\n👉 https://glosource-ai.vercel.app`;
  const encodedText = encodeURIComponent(shareText);

  function handleCopy() {
    navigator.clipboard.writeText(`https://glosource-ai.vercel.app?q=${encodeURIComponent(keyword)}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  function handleKakao() {
    // 카카오 공유 — kakao SDK 없이 링크 공유 방식
    const url = `https://story.kakao.com/share?url=${encodeURIComponent('https://glosource-ai.vercel.app')}&text=${encodedText}`;
    window.open(url, '_blank', 'width=600,height=500');
  }

  function handleX() {
    window.open(`https://x.com/intent/tweet?text=${encodedText}`, '_blank', 'width=600,height=400');
  }

  function handleLinkedIn() {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://glosource-ai.vercel.app')}`, '_blank', 'width=600,height=500');
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 font-medium">공유</span>
      <button
        onClick={handleCopy}
        title="링크 복사"
        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
      >
        {copied ? (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
      <button
        onClick={handleX}
        title="X(트위터) 공유"
        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>
      <button
        onClick={handleLinkedIn}
        title="LinkedIn 공유"
        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </button>
      <button
        onClick={handleKakao}
        title="카카오스토리 공유"
        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#3A1D1D">
          <path d="M12 3C6.477 3 2 6.59 2 11c0 2.743 1.608 5.159 4.064 6.679-.161.576-.609 2.116-.697 2.443-.108.41.15.404.315.294.13-.087 2.038-1.37 2.836-1.917C9.307 18.814 10.62 19 12 19c5.523 0 10-3.59 10-8s-4.477-8-10-8z"/>
        </svg>
      </button>
    </div>
  );
}
