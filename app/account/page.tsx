'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-base font-black text-[#0D1B2A]">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-slate-500">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#0D1B2A] outline-none focus:border-[#0D1B2A] focus:bg-white transition-colors';

export default function AccountPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState(session?.user?.name ?? '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState('');

  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (!session?.user) {
    return null;
  }

  const saveName = async () => {
    setNameLoading(true);
    setNameMsg('');
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) { setNameMsg(json.error ?? '오류가 발생했습니다.'); return; }
      await update({ name });
      setNameMsg('저장되었습니다.');
    } finally {
      setNameLoading(false);
    }
  };

  const savePassword = async () => {
    setPwLoading(true);
    setPwMsg('');
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) { setPwMsg(json.error ?? '오류가 발생했습니다.'); return; }
      setCurPw('');
      setNewPw('');
      setPwMsg('비밀번호가 변경되었습니다.');
    } finally {
      setPwLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== '탈퇴') { setDeleteError('"탈퇴"를 정확히 입력해주세요.'); return; }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (!res.ok) { const j = await res.json() as { error?: string }; setDeleteError(j.error ?? '오류가 발생했습니다.'); return; }
      router.replace('/');
    } finally {
      setDeleteLoading(false);
    }
  };

  const planLabel: Record<string, string> = {
    free: '무료 체험',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <header className="mb-8">
          <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-[#0D1B2A]">
            ← 대시보드
          </Link>
          <h1 className="mt-3 text-3xl font-black text-[#0D1B2A]">내 계정</h1>
          <p className="mt-1 text-sm text-slate-500">프로필 정보 및 보안 설정을 관리합니다.</p>
        </header>

        <div className="space-y-5">
          {/* 계정 정보 */}
          <Section title="계정 정보">
            <div className="space-y-4">
              <Field label="이메일">
                <input className={`${inputCls} cursor-not-allowed opacity-60`} value={session.user.email ?? ''} disabled />
              </Field>
              <Field label="플랜">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#0D1B2A] px-3 py-1 text-xs font-black text-white">
                    {planLabel[session.user.plan ?? 'free'] ?? session.user.plan}
                  </span>
                  <Link href="/billing" className="text-xs font-bold text-[#EA580C] hover:underline">
                    플랜 변경 →
                  </Link>
                </div>
              </Field>
            </div>
          </Section>

          {/* 프로필 수정 */}
          <Section title="프로필 수정">
            <div className="space-y-4">
              <Field label="이름">
                <input
                  className={inputCls}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                />
              </Field>
              {nameMsg && (
                <p className={`text-xs font-bold ${nameMsg.includes('저장') ? 'text-emerald-600' : 'text-red-500'}`}>
                  {nameMsg}
                </p>
              )}
              <button
                type="button"
                onClick={saveName}
                disabled={nameLoading || !name.trim()}
                className="rounded-xl bg-[#0D1B2A] px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {nameLoading ? '저장 중...' : '저장'}
              </button>
            </div>
          </Section>

          {/* 비밀번호 변경 */}
          <Section title="비밀번호 변경">
            <div className="space-y-4">
              <Field label="현재 비밀번호">
                <input
                  className={inputCls}
                  type="password"
                  value={curPw}
                  onChange={(e) => setCurPw(e.target.value)}
                  placeholder="현재 비밀번호"
                />
              </Field>
              <Field label="새 비밀번호">
                <input
                  className={inputCls}
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="8자 이상"
                />
              </Field>
              {pwMsg && (
                <p className={`text-xs font-bold ${pwMsg.includes('변경') ? 'text-emerald-600' : 'text-red-500'}`}>
                  {pwMsg}
                </p>
              )}
              <button
                type="button"
                onClick={savePassword}
                disabled={pwLoading || !curPw || !newPw}
                className="rounded-xl bg-[#0D1B2A] px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {pwLoading ? '변경 중...' : '비밀번호 변경'}
              </button>
            </div>
          </Section>
          {/* 회원 탈퇴 */}
          <Section title="회원 탈퇴">
            <p className="mb-4 text-sm text-slate-500">
              계정과 검색 데이터는 영구 삭제되며 복구할 수 없습니다. 법령상 보존이 필요한 결제 참조 기록은
              계정과의 연결을 제거한 뒤 5년간 보관됩니다.
            </p>
            <div className="space-y-3">
              <Field label={`탈퇴하려면 아래에 "탈퇴"를 입력하세요`}>
                <input
                  className={inputCls}
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder='탈퇴'
                />
              </Field>
              {deleteError && <p className="text-xs font-bold text-red-500">{deleteError}</p>}
              <button
                type="button"
                onClick={deleteAccount}
                disabled={deleteLoading || deleteConfirm !== '탈퇴'}
                className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700 hover:bg-red-100 disabled:opacity-40"
              >
                {deleteLoading ? '삭제 중...' : '계정 영구 삭제'}
              </button>
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}
