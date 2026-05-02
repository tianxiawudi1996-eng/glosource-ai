'use client';

import type { Supplier } from '../api/source/types';

interface ExportButtonProps {
  suppliers: Supplier[];
  keyword: string;
}

function formatDateForFilename(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function sanitizeFilenamePart(value: string): string {
  return value.trim().replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, '_') || 'search';
}

export default function ExportButton({ suppliers, keyword }: ExportButtonProps) {
  const handleExport = async () => {
    const XLSX = await import('xlsx');
    const rows = suppliers.map((supplier) => ({
      순위: supplier.rank,
      공급자명: supplier.name,
      플랫폼: supplier.platform,
      신뢰도점수: supplier.trustScore,
      URL: supplier.url,
      가격: supplier.estimatedPrice,
      MOQ: supplier.moq,
      리드타임: supplier.leadTimeDays,
      HS코드: supplier.hscode,
      한국수출경험: supplier.exportToKoreaExperience ? '예' : '아니오',
      요약: supplier.summary,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: ['순위', '공급자명', '플랫폼', '신뢰도점수', 'URL', '가격', 'MOQ', '리드타임', 'HS코드', '한국수출경험', '요약'],
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '공급자 목록');

    const filename = `glosource_${sanitizeFilenamePart(keyword)}_${formatDateForFilename(new Date())}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={suppliers.length === 0}
      className="rounded-lg border border-orange-500/50 px-4 py-2 text-sm font-semibold text-orange-400 transition-colors hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Excel 내보내기
    </button>
  );
}
