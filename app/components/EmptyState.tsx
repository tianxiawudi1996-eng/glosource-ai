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
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
          {isInitial ? '🔍' : isNoResults ? '📭' : '⚠️'}
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
