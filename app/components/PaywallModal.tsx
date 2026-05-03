'use client';

import { useState } from 'react';
import { Icon } from './icons';

interface PaywallModalProps {
  onClose: () => void;
  onLicenseActivated: (key: string) => void;
}

export default function PaywallModal({ onClose, onLicenseActivated }: PaywallModalProps) {
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');

  const verifyKey = async () => {
    if (!licenseKeyInput.trim()) return;
    setStatus('verifying');
    try {
      const res = await fetch('/api/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: licenseKeyInput.trim() }),
      });
      const json = await res.json() as { valid: boolean };
      if (json.valid) {
        setStatus('valid');
        setTimeout(() => {
          onLicenseActivated(licenseKeyInput.trim());
          onClose();
          setStatus('idle');
        }, 1200);
      } else {
        setStatus('invalid');
      }
    } catch {
      setStatus('invalid');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        <div className="mb-6">
          <div className="w-12 h-12 bg-[#0D1B2A] rounded-xl flex items-center justify-center mb-4">
            <Icon.Globe className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#0D1B2A] mb-1">무료 체험 횟수 소진</h2>
          <p className="text-slate-500 text-sm">AI 글로벌 소싱 분석을 계속 이용하려면 플랜을 선택하세요.</p>
        </div>
        <div className="space-y-2 mb-6">
          {[
            { name: '스타터', detail: '분석 20회/월', price: '19만원/월', per: '공급자 탐색 · PDF 저장 · RFQ 이메일', hot: false },
            { name: '프로', detail: '무제한', price: '49만원/월', per: '무제한 분석 · 세금계산서 · 한국어 지원', hot: true },
            { name: '팀', detail: '5계정', price: '99만원/월', per: '5계정 공유 · 현장별 관리 · 전담 지원', hot: false },
          ].map(p => (
            <a key={p.name} href={`mailto:like2buyglobal@gmail.com?subject=GloSource AI ${p.name} 플랜 문의`}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${p.hot ? 'border-[#0D1B2A] bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <div>
                <p className="font-semibold text-sm text-[#0D1B2A]">{p.name} <span className="font-normal text-slate-400 text-xs">· {p.detail}</span></p>
                <p className="text-xs text-slate-400 mt-0.5">{p.per}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-[#0D1B2A] text-sm">{p.price}</p>
                <Icon.ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </a>
          ))}
        </div>
        <p className="text-xs text-slate-400 text-center mb-4">세금계산서 발행 가능 · like2buyglobal@gmail.com</p>
        <div className="border-t border-slate-100 pt-4 mb-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">이미 라이선스 키가 있으신가요?</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={licenseKeyInput}
              onChange={e => { setLicenseKeyInput(e.target.value); setStatus('idle'); }}
              onKeyDown={e => e.key === 'Enter' && verifyKey()}
              placeholder="라이선스 키 입력 (예: PRO_XXXX-XXXX)"
              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#0D1B2A] transition-colors"
            />
            <button
              onClick={verifyKey}
              disabled={status === 'verifying' || status === 'valid'}
              className="px-4 py-2 text-xs font-semibold bg-[#0D1B2A] text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {status === 'verifying' ? '확인 중...' : status === 'valid' ? '✓ 활성화' : '키 활성화'}
            </button>
          </div>
          {status === 'invalid' && (
            <p className="text-xs text-red-500 mt-1.5">유효하지 않은 라이선스 키입니다.</p>
          )}
          {status === 'valid' && (
            <p className="text-xs text-emerald-600 mt-1.5">✓ 라이선스 키가 활성화되었습니다!</p>
          )}
        </div>
        <button onClick={onClose} className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl transition-colors">닫기</button>
      </div>
    </div>
  );
}
