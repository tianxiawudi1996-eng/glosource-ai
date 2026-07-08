'use client';

import { createElement } from 'react';
import type { Supplier } from '../api/source/types';
import { buildCsv } from '../lib/csv';

interface Props { suppliers: Supplier[]; keyword: string; lang?: 'ko' | 'en'; locked?: boolean }

export default function ExportButton({ suppliers, keyword, lang = 'ko', locked = false }: Props) {
  function onClick() {
    if (locked) {
      alert(lang === 'en' ? 'Export requires an eligible account.' : '내보내기 권한이 필요합니다.');
      return;
    }
    const headers = lang === 'en'
      ? ['Rank', 'Supplier', 'Platform', 'Trust Score', 'URL', 'Est. Price', 'MOQ', 'Lead Time', 'HS Code', 'Korea Export Exp.', 'Summary']
      : ['순위', '공급자명', '플랫폼', '신뢰도점수', 'URL', '가격', 'MOQ', '리드타임', 'HS코드', '한국수출경험', '요약'];
    const rows = suppliers.map(s => [s.rank, s.name, s.platform, s.trustScore, s.url, s.estimatedPrice, s.moq, s.leadTimeDays, s.hscode, s.exportToKoreaExperience ? (lang === 'en' ? 'Yes' : '예') : (lang === 'en' ? 'No' : '아니오'), s.summary]);
    const url = URL.createObjectURL(new Blob([buildCsv(headers, rows)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `glosource_${keyword.replace(/[^\p{L}\p{N}_-]+/gu, '_') || 'search'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return createElement('button', {
    type: 'button', onClick, disabled: suppliers.length === 0,
    className: 'rounded-lg border border-orange-500/50 px-4 py-2 text-sm font-semibold text-orange-400 disabled:opacity-50',
  }, lang === 'en' ? 'Export CSV' : 'CSV 내보내기');
}
