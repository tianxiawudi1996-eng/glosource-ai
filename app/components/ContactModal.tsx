'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { Icon } from './icons';

interface ContactModalProps {
  plan: string;
  onClose: () => void;
}

export default function ContactModal({ plan, onClose }: ContactModalProps) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) {
      setError('이름과 연락처를 입력해주세요.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, name, company, contact, message }),
      });
      const json = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? '문의 접수에 실패했습니다.');
      }
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : '문의 접수에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0D1B2A]">
              <Icon.Mail className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-[#0D1B2A]">도입 문의</h2>
            <p className="mt-1 text-sm text-slate-500">{plan} 플랜 상담 요청을 남겨주세요.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50"
          >
            닫기
          </button>
        </div>

        {status === 'sent' ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-bold text-emerald-800">문의가 접수되었습니다.</p>
            <p className="mt-1 text-xs leading-5 text-emerald-700">입력하신 연락처로 플랜과 적용 범위를 확인해드리겠습니다.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-xl bg-[#0D1B2A] py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              확인
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-600">이름</span>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition-colors focus:border-[#0D1B2A]"
                  placeholder="홍길동"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-600">회사명</span>
                <input
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition-colors focus:border-[#0D1B2A]"
                  placeholder="회사명"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">연락처</span>
              <input
                value={contact}
                onChange={e => setContact(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition-colors focus:border-[#0D1B2A]"
                placeholder="휴대폰 또는 이메일"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">문의 내용</span>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="min-h-28 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition-colors focus:border-[#0D1B2A]"
                placeholder="소싱하려는 품목, 월 예상 문의량, 원하는 지원 범위를 적어주세요."
              />
            </label>
            {status === 'error' && <p className="text-xs font-medium text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#EA580C] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-900/20 transition-colors hover:bg-[#DC4C00] disabled:opacity-60"
            >
              <Icon.Mail className="h-4 w-4" />
              {status === 'sending' ? '접수 중...' : '문의 접수하기'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
