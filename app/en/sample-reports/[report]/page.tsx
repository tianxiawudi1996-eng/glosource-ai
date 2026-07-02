import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import BrandLogo from '@/app/components/BrandLogo';

const REPORTS = {
  serum: 'serum-oem-sample-report.md',
  'sheet-mask': 'sheet-mask-oem-sample-report.md',
  sunscreen: 'sunscreen-oem-sample-report.md',
} as const;

type ReportKey = keyof typeof REPORTS;

export const metadata: Metadata = {
  title: 'K-Beauty OEM Sample Report | GloSource AI',
  description: 'See the supplier research, risk signals, RFQ draft, and buyer checklist included in a GloSource AI sample report.',
  robots: { index: false, follow: true },
};

export function generateStaticParams() {
  return Object.keys(REPORTS).map(report => ({ report }));
}

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('_') && part.endsWith('_')) return <em key={index}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function renderMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const nodes: ReactNode[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line || line === '---') continue;
    if (line.startsWith('|') && lines[i + 1]?.trim().match(/^\|[-| ]+\|$/)) {
      const rows: string[][] = [];
      const headers = line.split('|').slice(1, -1).map(cell => cell.trim());
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(lines[i].trim().split('|').slice(1, -1).map(cell => cell.trim()));
        i += 1;
      }
      i -= 1;
      nodes.push(<div key={`table-${i}`} className="my-6 overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-100"><tr>{headers.map(header => <th key={header} className="px-4 py-3 font-black text-slate-700">{inline(header)}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 align-top leading-6 text-slate-600">{inline(cell)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    if (line.startsWith('# ')) nodes.push(<h1 key={i} className="mt-4 text-3xl font-black tracking-tight text-[#0D1B2A] md:text-4xl">{inline(line.slice(2))}</h1>);
    else if (line.startsWith('## ')) nodes.push(<h2 key={i} className="mt-10 border-t border-slate-200 pt-8 text-xl font-black text-[#0D1B2A]">{inline(line.slice(3))}</h2>);
    else if (line.startsWith('### ')) nodes.push(<h3 key={i} className="mt-7 text-base font-black text-[#0D1B2A]">{inline(line.slice(4))}</h3>);
    else if (line.startsWith('> ')) nodes.push(<p key={i} className="my-3 border-l-4 border-orange-400 bg-orange-50 px-4 py-3 text-sm leading-6 text-slate-700">{inline(line.slice(2))}</p>);
    else if (/^- \[[ x]\] /.test(line)) nodes.push(<p key={i} className="my-2 flex gap-2 text-sm leading-6 text-slate-700"><span aria-hidden="true">{line.startsWith('- [x]') ? '☑' : '☐'}</span><span>{inline(line.slice(6))}</span></p>);
    else if (line.startsWith('- ')) nodes.push(<p key={i} className="my-2 flex gap-2 text-sm leading-6 text-slate-700"><span className="text-orange-500">•</span><span>{inline(line.slice(2))}</span></p>);
    else nodes.push(<p key={i} className="my-3 text-sm leading-7 text-slate-700">{inline(line)}</p>);
  }
  return nodes;
}

export default async function SampleReportPage({ params }: { params: Promise<{ report: string }> }) {
  const { report } = await params;
  if (!(report in REPORTS)) notFound();
  const filename = REPORTS[report as ReportKey];
  const markdown = await readFile(path.join(process.cwd(), 'public', 'sample-reports', filename), 'utf8');

  return <main className="min-h-screen bg-slate-50"><nav className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4"><Link href="/en" aria-label="GloSource AI home"><BrandLogo /></Link><Link href="/en#pricing" className="rounded-lg bg-[#EA580C] px-4 py-2 text-xs font-black text-white hover:bg-[#DC4C00]">View plans</Link></div></nav><article className="mx-auto my-8 max-w-5xl rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm md:px-10 md:py-12"><div className="mb-6 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#EA580C]">Sample report</div>{renderMarkdown(markdown)}<div className="mt-12 rounded-2xl bg-[#0D1B2A] p-6 text-center text-white"><h2 className="text-xl font-black">Build a shortlist for your product</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-300">Run a live search, compare supplier signals, and generate an English RFQ for your exact product and quantity.</p><Link href="/en#sourcing-tool" className="mt-5 inline-flex rounded-xl bg-[#EA580C] px-6 py-3 text-sm font-black text-white hover:bg-[#DC4C00]">Start supplier research</Link></div></article></main>;
}
