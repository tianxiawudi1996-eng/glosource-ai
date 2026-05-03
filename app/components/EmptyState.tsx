'use client';

type EmptyStateType = 'initial' | 'no_results' | 'error';

interface EmptyStateProps {
  type: EmptyStateType;
  errorMessage?: string;
  onRetry?: () => void;
}

const EXAMPLE_TAGS = ['알루미늄 창호 프레임', '6063-T5 铝型材', 'SS400 강판 6T'];

export default function EmptyState({ type, errorMessage, onRetry }: EmptyStateProps) {
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
          {isInitial && '제품명을 입력하면 AI가 중국 공급자를 자동 탐색합니다'}
          {isNoResults && '공급자를 찾지 못했습니다'}
          {isError && (errorMessage || '오류가 발생했습니다')}
        </h3>

        <p className="text-sm leading-relaxed text-slate-400">
          {isInitial && '1688.com  Alibaba  WeChat 동시 분석'}
          {isNoResults && '더 구체적인 제품명이나 중문 키워드로 검색해보세요'}
          {isError && '입력값을 확인한 뒤 다시 시도해보세요'}
        </p>

        {isNoResults && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {EXAMPLE_TAGS.map((tag) => (
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
            재시도
          </button>
        )}
      </div>
    </div>
  );
}
