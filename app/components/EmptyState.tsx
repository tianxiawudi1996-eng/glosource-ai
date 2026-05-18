'use client';

type EmptyStateType = 'initial' | 'no_results' | 'error';

interface EmptyStateProps {
  type: EmptyStateType;
  errorMessage?: string;
  onRetry?: () => void;
  lang?: 'ko' | 'en';
  region?: 'korea' | 'china';
}

const COPY = {
  ko: {
    initial: {
      title: '제품명을 입력하면 AI가 공급자를 자동 탐색합니다',
      desc: (region?: string) => region === 'korea'
        ? 'EC21 · BuyKorea · tradeKorea 동시 분석'
        : '1688.com · Alibaba · WeChat 동시 분석',
    },
    no_results: {
      title: '공급자를 찾지 못했습니다',
      desc: '더 구체적인 제품명이나 중문 키워드로 검색해보세요',
      tags: ['알루미늄 창호 프레임', '6063-T5 铝型材', 'SS400 강판 6T'],
    },
    error: {
      desc: '입력값을 확인한 뒤 다시 시도해보세요',
      retry: '재시도',
    },
  },
  en: {
    initial: {
      title: 'Enter a product to find AI-ranked supplier candidates',
      desc: (region?: string) => region === 'china'
        ? 'AI searches 1688 · Alibaba · WeChat and prepares an English RFQ draft'
        : 'AI searches EC21 · BuyKorea (KOTRA) · tradeKorea and returns a ranked shortlist',
    },
    no_results: {
      title: 'No suppliers found',
      desc: 'Try a more specific product name or a Chinese keyword',
      tags: ['Korean collagen serum OEM', 'HACCP food manufacturer', 'K-beauty private label'],
    },
    error: {
      desc: 'Check your input and try again',
      retry: 'Retry',
    },
  },
};

export default function EmptyState({ type, errorMessage, onRetry, lang = 'en', region }: EmptyStateProps) {
  const c = COPY[lang];
  const isInitial = type === 'initial';
  const isNoResults = type === 'no_results';
  const isError = type === 'error';

  return (
    <div className="flex h-full min-h-[480px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="max-w-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
          {isInitial && (
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          )}
          {isNoResults && (
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0H4" />
            </svg>
          )}
          {isError && (
            <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          )}
        </div>

        <h3 className="mb-2 text-lg font-bold text-[#0D1B2A]">
          {isInitial && c.initial.title}
          {isNoResults && c.no_results.title}
          {isError && (errorMessage || (lang === 'en' ? 'Something went wrong' : '오류가 발생했습니다'))}
        </h3>

        <p className="text-sm leading-relaxed text-slate-400">
          {isInitial && c.initial.desc(region)}
          {isNoResults && c.no_results.desc}
          {isError && c.error.desc}
        </p>

        {isNoResults && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {c.no_results.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                {tag}
              </span>
            ))}
          </div>
        )}

        {isError && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 rounded-lg bg-[#EA580C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#DC4C00]"
          >
            {c.error.retry}
          </button>
        )}
      </div>
    </div>
  );
}
