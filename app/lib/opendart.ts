import { normFirmName } from '@/app/lib/firm-name';

export interface DartCorporationCode {
  corpCode: string;
  name: string;
  nameEn: string | null;
  stockCode: string | null;
  modifiedAt: string | null;
}

export interface DartCompanyProfile {
  corpCode: string;
  name: string;
  nameEn: string | null;
  stockCode: string | null;
  jurirNo: string | null;
  bizrno: string;
  address: string | null;
  homepage: string | null;
}

export type DartBusinessNumberDecision =
  | { kind: 'no_match' }
  | { kind: 'ambiguous' }
  | { kind: 'available'; profile: DartCompanyProfile }
  | { kind: 'confirmed'; profile: DartCompanyProfile }
  | { kind: 'conflict'; profile: DartCompanyProfile };

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function text(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value).trim()
    : '';
}

function nullableText(value: unknown): string | null {
  return text(value) || null;
}

function assertSuccess(payload: Record<string, unknown>): void {
  const status = text(payload.status);
  if (status !== '000') {
    throw new Error(`OpenDART ${status || 'unknown'}: ${text(payload.message) || 'request failed'}`);
  }
}

export function parseDartCorpCodes(payload: unknown): DartCorporationCode[] {
  const outer = record(payload);
  const root = Object.keys(record(outer.result)).length ? record(outer.result) : outer;
  assertSuccess(root);
  const list = Array.isArray(root.list) ? root.list : [];

  return list.flatMap((value) => {
    const row = record(value);
    const corpCode = text(row.corp_code);
    const name = text(row.corp_name);
    if (!/^\d{8}$/.test(corpCode) || !name) return [];
    return [{
      corpCode,
      name,
      nameEn: nullableText(row.corp_eng_name),
      stockCode: nullableText(row.stock_code),
      modifiedAt: nullableText(row.modify_date),
    }];
  });
}

export function matchDartCorporation(
  rows: DartCorporationCode[],
  companyName: string,
): DartCorporationCode | undefined {
  const target = normFirmName(companyName);
  if (!target) return undefined;
  const matches = rows.filter((row) => normFirmName(row.name) === target);
  return matches.length === 1 ? matches[0] : undefined;
}

export function parseDartCompanyProfile(payload: unknown): DartCompanyProfile {
  const outer = record(payload);
  const root = Object.keys(record(outer.result)).length ? record(outer.result) : outer;
  assertSuccess(root);

  const corpCode = text(root.corp_code);
  const name = text(root.corp_name);
  const bizrno = text(root.bizr_no).replace(/\D/g, '');
  if (!/^\d{8}$/.test(corpCode)) throw new Error('OpenDART company profile has no valid 8-digit corporation code');
  if (!name) throw new Error('OpenDART company profile has no company name');
  if (!/^\d{10}$/.test(bizrno)) throw new Error('OpenDART company profile has no valid 10-digit business-registration number');

  return {
    corpCode,
    name,
    nameEn: nullableText(root.corp_name_eng),
    stockCode: nullableText(root.stock_code),
    jurirNo: nullableText(root.jurir_no),
    bizrno,
    address: nullableText(root.adres),
    homepage: nullableText(root.hm_url),
  };
}

export function evaluateDartBusinessNumber(
  profiles: DartCompanyProfile[],
  companyName: string,
  claimedBizrno?: string | null,
): DartBusinessNumberDecision {
  const target = normFirmName(companyName);
  const matches = profiles.filter((profile) => normFirmName(profile.name) === target);
  if (matches.length > 1) return { kind: 'ambiguous' };
  const profile = matches[0];
  if (!profile) return { kind: 'no_match' };

  const claimed = String(claimedBizrno ?? '').replace(/\D/g, '');
  if (!claimed) return { kind: 'available', profile };
  return claimed === profile.bizrno
    ? { kind: 'confirmed', profile }
    : { kind: 'conflict', profile };
}
