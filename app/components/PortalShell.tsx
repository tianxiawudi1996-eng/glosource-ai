import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from './icons';

interface PortalShellProps {
  active: 'dashboard' | 'billing' | 'admin' | 'emails';
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
}

const navItems = [
  { key: 'dashboard', href: '/dashboard', label: '대시보드', icon: Icon.Search },
  { key: 'billing', href: '/billing', label: '구독 관리', icon: Icon.Download },
  { key: 'admin', href: '/admin', label: '어드민', icon: Icon.Shield },
  { key: 'emails', href: '/emails', label: '이메일 템플릿', icon: Icon.Mail },
] as const;

export default function PortalShell({ active, title, subtitle, children, action }: PortalShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D1B2A]">
              <Icon.Globe className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-[#0D1B2A]">GloSource AI</p>
              <p className="text-[11px] font-medium text-slate-400">운영 포털</p>
            </div>
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Pro 활성</span>
            <Link href="/auth/login" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
              계정 전환
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-6 lg:h-fit">
          <nav className="grid gap-1">
            {navItems.map((item) => {
              const NavIcon = item.icon;
              const isActive = item.key === active;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${isActive ? 'bg-[#0D1B2A] text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-[#0D1B2A]'}`}
                >
                  <NavIcon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-black text-amber-800">서비스 범위</p>
            <p className="mt-1 text-[11px] leading-5 text-amber-700">공급자 후보 발굴과 RFQ 준비까지만 지원합니다.</p>
          </div>
        </aside>

        <main>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-[#EA580C]">GloSource Portal</p>
              <h1 className="text-3xl font-black tracking-tight text-[#0D1B2A]">{title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p>
            </div>
            {action}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
