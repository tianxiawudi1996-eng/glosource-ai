'use client';

import { useState, useEffect } from 'react';
import { Icon } from './icons';
import type { SourcingOutput } from '../api/source/types';

interface BusinessCard {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  wechat: string;
  website: string;
}

const CARD_KEY = 'glosource_bizcard';
const EMPTY_CARD: BusinessCard = { name: '', title: '', company: '', email: '', phone: '', wechat: '', website: '' };

function loadCard(): BusinessCard {
  try {
    const raw = localStorage.getItem(CARD_KEY);
    if (raw) return { ...EMPTY_CARD, ...JSON.parse(raw) as Partial<BusinessCard> };
  } catch { /* ignore */ }
  return EMPTY_CARD;
}

function applyCard(template: string, card: BusinessCard): string {
  return template
    .replace('[YOUR NAME]', card.name || '[YOUR NAME]')
    .replace('[YOUR TITLE]', card.title || '[YOUR TITLE]')
    .replace('[YOUR COMPANY]', card.company || '[YOUR COMPANY]')
    .replace('[YOUR EMAIL]', card.email || '[YOUR EMAIL]')
    .replace('[YOUR PHONE / WECHAT / WHATSAPP]', [card.phone, card.wechat].filter(Boolean).join(' / ') || '[YOUR PHONE / WECHAT]')
    .replace('[YOUR WEBSITE]', card.website || '[YOUR WEBSITE]')
    .replace('[Your Company Name]', card.company || '[Your Company Name]')
    .replace('[Your Company Name]', card.company || '[Your Company Name]')
    .replace('[贵公司名称]', card.company || '[贵公司名称]')
    .replace('[您的公司名称]', card.company || '[您的公司名称]')
    .replace('[您的姓名]', card.name || '[您的姓名]')
    .replace('[您的职位]', card.title || '[您的职位]')
    .replace('[您的电子邮件]', card.email || '[您的电子邮件]')
    .replace('[您的电话 / 微信 / WhatsApp]', [card.phone, card.wechat].filter(Boolean).join(' / ') || '[您的电话 / 微信]')
    .replace('[您的网站]', card.website || '[您的网站]');
}

interface RFQComposerProps {
  rfqEmail: SourcingOutput['rfqEmail'];
}

export default function RFQComposer({ rfqEmail }: RFQComposerProps) {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const [copied, setCopied] = useState(false);
  const [card, setCard] = useState<BusinessCard>(EMPTY_CARD);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    setCard(loadCard());
  }, []);

  const updateCard = (field: keyof BusinessCard, value: string) => {
    const updated = { ...card, [field]: value };
    setCard(updated);
    localStorage.setItem(CARD_KEY, JSON.stringify(updated));
  };

  const finalEmail = applyCard(rfqEmail[lang], card);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(finalEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardFilled = card.name && card.company && card.email;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Tabs */}
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

      {/* Business Card Toggle */}
      <div className="border-b border-slate-100">
        <button
          onClick={() => setShowCard(!showCard)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-slate-500 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2">
            <span>👤 내 명함 정보</span>
            {cardFilled
              ? <span className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded text-[10px]">저장됨</span>
              : <span className="bg-orange-100 text-orange-500 px-1.5 py-0.5 rounded text-[10px]">미입력</span>}
          </div>
          <span className="text-slate-300">{showCard ? '▲' : '▼'}</span>
        </button>

        {showCard && (
          <div className="px-4 pb-4 grid grid-cols-2 gap-2 bg-slate-50/50">
            {([
              { field: 'name', label: '이름', placeholder: 'Kim Mubin' },
              { field: 'title', label: '직함', placeholder: 'Procurement Manager' },
              { field: 'company', label: '회사명', placeholder: 'ABC Trading Co.' },
              { field: 'email', label: '이메일', placeholder: 'mubin@abc.com' },
              { field: 'phone', label: '전화/WhatsApp', placeholder: '+82-10-xxxx-xxxx' },
              { field: 'wechat', label: '위챗 ID', placeholder: 'wechat_id' },
            ] as { field: keyof BusinessCard; label: string; placeholder: string }[]).map(({ field, label, placeholder }) => (
              <div key={field}>
                <label className="block text-[10px] text-slate-400 mb-0.5">{label}</label>
                <input
                  type="text"
                  value={card[field]}
                  onChange={(e) => updateCard(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-400 bg-white"
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-[10px] text-slate-400 mb-0.5">웹사이트 (선택)</label>
              <input
                type="text"
                value={card.website}
                onChange={(e) => updateCard('website', e.target.value)}
                placeholder="https://www.yourcompany.com"
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-400 bg-white"
              />
            </div>
            <p className="col-span-2 text-[10px] text-slate-400">* 입력 정보는 브라우저에만 저장되며 서버로 전송되지 않습니다.</p>
          </div>
        )}
      </div>

      {/* Email Body */}
      <div className="p-4 h-[280px] overflow-y-auto">
        <pre className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "'Pretendard','Malgun Gothic',sans-serif" }}>
          {finalEmail}
        </pre>
      </div>
    </div>
  );
}
