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

function getLineValue(text: string, labels: string[]): string {
  const lines = text.split('\n');
  for (const label of labels) {
    const line = lines.find((l) => l.trim().toLowerCase().startsWith(label.toLowerCase()));
    if (line) {
      const [, ...rest] = line.split(':');
      const value = rest.join(':').trim();
      if (value) return value;
    }
  }
  return '-';
}

function buildChecklist(lang: 'en' | 'zh') {
  if (lang === 'zh') {
    return [
      ['认证证书', '请确认 ISO/CE/SGS 等认证是否适用。'],
      ['样品', '请提供样品费用、周期和退款条件。'],
      ['包装', '请确认出口包装方式和箱规。'],
      ['付款条件', '请确认 T/T 定金和尾款条件。'],
      ['交期', '请确认样品和批量生产交期。'],
    ];
  }
  return [
    ['Certification', 'Confirm applicable ISO/CE/SGS or equivalent certificates.'],
    ['Sample', 'Confirm sample cost, lead time, and refund conditions.'],
    ['Packing', 'Confirm export packing method and carton details.'],
    ['Payment Terms', 'Confirm deposit, balance, and payment method.'],
    ['Lead Time', 'Confirm sample and mass production lead time.'],
  ];
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
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span>내 명함 정보</span>
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

      {/* RFQ Document Preview */}
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_280px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-2xl font-black tracking-tight text-[#0D1B2A]">RFQ Draft</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {lang === 'en'
                  ? 'Review the requirements and send this draft to shortlisted suppliers.'
                  : '请确认以下询价内容，并发送给候选供应商。'}
              </p>
            </div>
            <span className="inline-flex w-fit rounded-lg bg-[#EA580C] px-3 py-1 text-xs font-black text-white">
              {lang === 'en' ? 'DRAFT' : '草稿'}
            </span>
          </div>

          <div className="space-y-5">
            <section>
              <h3 className="mb-2 text-sm font-black text-[#0D1B2A]">
                1. {lang === 'en' ? 'Requirement' : '需求说明'}
              </h3>
              <p className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                {finalEmail.split('\n').find((line) => line.includes('interested') || line.includes('感兴趣')) || finalEmail.split('\n').find(Boolean)}
              </p>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-black text-[#0D1B2A]">
                2. {lang === 'en' ? 'Specs' : '规格参数'}
              </h3>
              <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-slate-200 text-xs sm:grid-cols-2">
                {[
                  [lang === 'en' ? 'Product' : '产品名称', getLineValue(finalEmail, lang === 'en' ? ['Product'] : ['产品名称'])],
                  [lang === 'en' ? 'Quantity' : '采购数量', getLineValue(finalEmail, lang === 'en' ? ['Quantity'] : ['采购数量'])],
                  [lang === 'en' ? 'Budget' : '预算范围', getLineValue(finalEmail, lang === 'en' ? ['Budget'] : ['预算范围'])],
                  [lang === 'en' ? 'Destination' : '目的港', getLineValue(finalEmail, lang === 'en' ? ['Destination'] : ['目的港'])],
                  [lang === 'en' ? 'Payment' : '付款方式', getLineValue(finalEmail, lang === 'en' ? ['Payment'] : ['付款方式'])],
                  [lang === 'en' ? 'Frequency' : '采购频率', getLineValue(finalEmail, lang === 'en' ? ['Frequency'] : ['采购频率'])],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[96px_1fr] border-b border-slate-200 last:border-b-0 sm:border-r sm:even:border-r-0">
                    <div className="bg-slate-50 px-3 py-2 font-bold text-slate-500">{label}</div>
                    <div className="px-3 py-2 font-semibold text-slate-700">{value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-black text-[#0D1B2A]">
                3. {lang === 'en' ? 'Message Body' : '邮件正文'}
              </h3>
              <div className="max-h-[260px] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
                <pre className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap" style={{ fontFamily: "'Pretendard','Malgun Gothic',sans-serif" }}>
                  {finalEmail}
                </pre>
              </div>
            </section>
          </div>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-sm font-black text-[#0D1B2A]">
              {lang === 'en' ? 'Supplier Confirmation' : '供应商确认项'}
            </p>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700">5 / 5</span>
          </div>
          <div className="space-y-3">
            {buildChecklist(lang).map(([title, desc], idx) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white">
                    {idx + 1}
                  </span>
                  <p className="text-xs font-black text-[#0D1B2A]">{title}</p>
                </div>
                <p className="pl-7 text-xs leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
