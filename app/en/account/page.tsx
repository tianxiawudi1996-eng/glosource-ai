'use client';

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

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-500">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-[#0D1B2A] outline-none focus:border-[#0D1B2A] focus:bg-white transition-colors';

export default function EnAccountPage() {
  const { data: session, status, update } = useSession();
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

  if (status === 'loading') {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50"><p className="text-sm font-bold text-slate-500">Loading account…</p></main>;
  }

  if (!session?.user) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50"><Link href="/en/login?callbackUrl=/en/account" className="font-bold text-[#EA580C]">Sign in to manage your account</Link></main>;
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
      await res.json().catch(() => null);
      if (!res.ok) { setNameMsg('Could not save your name. Please check it and try again.'); return; }
      await update({ name });
      setNameMsg('Saved.');
    } catch {
      setNameMsg('Could not save your name. Please try again.');
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
      await res.json().catch(() => null);
      if (!res.ok) { setPwMsg('Your current password is incorrect, or the new password is invalid.'); return; }
      setCurPw('');
      setNewPw('');
      setPwMsg('Password changed.');
    } catch {
      setPwMsg('Could not change your password. Please try again.');
    } finally {
      setPwLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { setDeleteError('Please type "DELETE" to confirm.'); return; }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (!res.ok) { await res.json().catch(() => null); setDeleteError('Could not delete your account. Please try again or contact support.'); return; }
      router.replace('/en');
    } catch {
      setDeleteError('Could not delete your account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const planLabel: Record<string, string> = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Business',
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <header className="mb-8">
          <Link href="/en/dashboard" className="text-xs font-bold text-slate-400 hover:text-[#0D1B2A]">
            ← Dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-black text-[#0D1B2A]">My account</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your profile and security settings.</p>
        </header>

        <div className="space-y-5">
          <Section title="Account">
            <div className="space-y-4">
              <Field id="account-email" label="Email">
                <input id="account-email" name="email" className={`${inputCls} cursor-not-allowed opacity-60`} value={session.user.email ?? ''} disabled />
              </Field>
              <Field id="account-plan" label="Plan">
                <div id="account-plan" className="flex items-center gap-2">
                  <span className="rounded-full bg-[#0D1B2A] px-3 py-1 text-xs font-black text-white">
                    {planLabel[session.user.plans?.en ?? 'free'] ?? session.user.plans?.en}
                  </span>
                  <Link href="/en/billing" className="text-xs font-bold text-[#EA580C] hover:underline">
                    Change plan →
                  </Link>
                </div>
              </Field>
            </div>
          </Section>

          <Section title="Profile">
            <div className="space-y-4">
              <Field id="account-name" label="Name">
                <input
                  id="account-name"
                  name="name"
                  autoComplete="name"
                  className={inputCls}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </Field>
              {nameMsg && (
                <p role="status" className={`text-xs font-bold ${nameMsg === 'Saved.' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {nameMsg}
                </p>
              )}
              <button
                type="button"
                onClick={saveName}
                disabled={nameLoading || !name.trim()}
                className="rounded-xl bg-[#0D1B2A] px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {nameLoading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </Section>

          <Section title="Change password">
            <div className="space-y-4">
              <Field id="current-password" label="Current password">
                <input
                  id="current-password"
                  name="currentPassword"
                  className={inputCls}
                  type="password"
                  value={curPw}
                  onChange={(e) => setCurPw(e.target.value)}
                  placeholder="Current password"
                  autoComplete="current-password"
                />
              </Field>
              <Field id="new-password" label="New password">
                <input
                  id="new-password"
                  name="newPassword"
                  className={inputCls}
                  type="password"
                  minLength={8}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </Field>
              {pwMsg && (
                <p role="status" className={`text-xs font-bold ${pwMsg === 'Password changed.' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {pwMsg}
                </p>
              )}
              <button
                type="button"
                onClick={savePassword}
                disabled={pwLoading || !curPw || !newPw}
                className="rounded-xl bg-[#0D1B2A] px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {pwLoading ? 'Changing…' : 'Change password'}
              </button>
            </div>
          </Section>

          <Section title="Delete account">
            <p className="mb-4 text-sm text-slate-500">Deleting your account permanently removes all your data. This cannot be undone.</p>
            <div className="space-y-3">
              <Field id="delete-confirm" label={`Type "DELETE" to confirm`}>
                <input
                  id="delete-confirm"
                  name="deleteConfirm"
                  className={inputCls}
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                />
              </Field>
              {deleteError && <p role="alert" className="text-xs font-bold text-red-500">{deleteError}</p>}
              <button
                type="button"
                onClick={deleteAccount}
                disabled={deleteLoading || deleteConfirm !== 'DELETE'}
                className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700 hover:bg-red-100 disabled:opacity-40"
              >
                {deleteLoading ? 'Deleting…' : 'Permanently delete account'}
              </button>
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}
