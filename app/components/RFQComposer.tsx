'use client';

import { useState } from 'react';
import { Icon } from './icons';
import type { SourcingOutput } from '../api/source/types';

interface RFQComposerProps {
  rfqEmail: SourcingOutput['rfqEmail'];
}

export default function RFQComposer({ rfqEmail }: RFQComposerProps) {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rfqEmail[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex border-b border-slate-100">
        <button onClick={() => setLang('en')}
          className={`flex-1 py-3 text-xs font-medium transition-all border-b-2 ${lang === 'en' ? 'border-[#0D1B2A] text-[#0D1B2A] bg-slate-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          영어 이메일
        </button>
        <button onClick={() => setLang('zh')}
          className={`flex-1 py-3 text-xs font-medium transition-all border-b-2 ${lang === 'zh' ? 'border-[#0D1B2A] text-[#0D1B2A] bg-slate-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          중국어 이메일
        </button>
        <button onClick={handleCopy}
          className="px-4 border-l border-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
          <Icon.Copy className="w-3.5 h-3.5" />
          <span className="text-xs">{copied ? '완료' : '복사'}</span>
        </button>
      </div>
      <div className="p-4 h-[220px] overflow-y-auto">
        <pre className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "'Pretendard','Malgun Gothic',sans-serif" }}>
          {rfqEmail[lang]}
        </pre>
      </div>
    </div>
  );
}
