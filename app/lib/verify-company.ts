/**
 * Single-name government verification engine — reused by the chatbot's verifyKoreanCompany tool
 * and any "paste a supplier name → instant proof" surface. Cross-checks all five MFDS registries
 * plus the live National Tax Service business-status API. Pure data, never throws.
 */
import {
  lookupMfdsFirms, lookupHaccpFirms, lookupMedicalDeviceFirms,
  lookupHealthFoodFirms, lookupQuasiDrugFirms, normFirmName,
} from './mfds';
import { checkBusinessStatus } from './nts';

export interface CompanyVerification {
  query: string;
  found: boolean;
  registries: string[];
  evidence: string[];
  redFlags: string[];
  activeBusiness: boolean | null; // null = no biz-reg number available to check
  bizStatus: string | null;
  bizrno: string | null;
}

export async function verifyKoreanCompany(name: string, lang: 'ko' | 'en' = 'en'): Promise<CompanyVerification> {
  const en = lang === 'en';
  const out: CompanyVerification = {
    query: name, found: false, registries: [], evidence: [], redFlags: [],
    activeBusiness: null, bizStatus: null, bizrno: null,
  };
  const clean = String(name || '').trim();
  if (clean.length < 2) return out;
  const names = [clean];

  const [mfds, haccp, mdeq, htfs, qdrg] = await Promise.all([
    lookupMfdsFirms(names), lookupHaccpFirms(names), lookupMedicalDeviceFirms(names),
    lookupHealthFoodFirms(names), lookupQuasiDrugFirms(names),
  ]);
  const norm = normFirmName(clean);

  const mf = mfds.get(norm);
  if (mf) {
    out.registries.push(mf.cgmp ? 'MFDS · CGMP' : 'MFDS');
    out.evidence.push(mf.isManufacturer
      ? (en ? `MFDS-registered ${mf.cgmp ? 'CGMP-certified ' : ''}cosmetics MANUFACTURER${mf.bizrno ? ` · biz reg ${mf.bizrno}` : ''}${mf.ageYears ? ` · ${mf.ageYears}y in business` : ''}${mf.sido ? ` · ${mf.sido}` : ''}`
           : `식약처 등록 ${mf.cgmp ? 'CGMP 인증 ' : ''}화장품 제조사${mf.ageYears ? ` · 업력 ${mf.ageYears}년` : ''}`)
      : (en ? `MFDS-registered as a cosmetics BRAND/DISTRIBUTOR (책임판매), not a manufacturer of record`
           : `식약처 등록상 화장품 책임판매사(브랜드/유통) — 직접 제조사 아님`));
    if (!mf.isManufacturer) out.redFlags.push(en ? 'Registered with MFDS as a brand/distributor, not a manufacturer — verify who actually manufactures.' : 'MFDS상 책임판매사 — 실제 제조사 확인 필요.');
    out.bizrno = out.bizrno ?? mf.bizrno;
  }
  const hc = haccp.get(norm);
  if (hc) {
    out.registries.push('HACCP');
    const gb = hc.productGb === '축산물' ? (en ? 'livestock' : '축산물') : (en ? 'food' : '식품');
    out.evidence.push(en ? `HACCP-certified ${gb} manufacturer${hc.area1 ? ` · ${hc.area1}` : ''}` : `HACCP 인증 ${gb} 제조사${hc.area1 ? ` · ${hc.area1}` : ''}`);
  }
  const md = mdeq.get(norm);
  if (md) {
    out.registries.push('Medical device');
    out.evidence.push(md.isManufacturer
      ? (en ? `MFDS-licensed medical-device MANUFACTURER${md.bizrno ? ` · biz reg ${md.bizrno}` : ''}${md.sido ? ` · ${md.sido}` : ''}` : `식약처 허가 의료기기 제조업체`)
      : (en ? `MFDS-licensed medical-device IMPORTER/distributor (not a manufacturer of record)` : `식약처 허가 의료기기 수입업체`));
    if (md.closeDate) out.redFlags.push(en ? `MFDS records show this medical-device license closed (${md.closeDate}).` : `식약처상 의료기기 허가 폐업 이력 (${md.closeDate}).`);
    out.bizrno = out.bizrno ?? md.bizrno;
  }
  const hf = htfs.get(norm);
  if (hf) {
    out.registries.push('Health food');
    out.evidence.push(en ? `MFDS-registered health-functional-food maker${hf.productCount ? ` · ${hf.productCount} registered products` : ''}` : `식약처 등록 건강기능식품 업체${hf.productCount ? ` · 등록품목 ${hf.productCount}건` : ''}`);
  }
  const qd = qdrg.get(norm);
  if (qd) {
    out.registries.push('Quasi-drug');
    out.evidence.push(qd.isManufacturer
      ? (en ? `MFDS-licensed quasi-drug (의약외품) MANUFACTURER` : `식약처 허가 의약외품 제조업체`)
      : (en ? `MFDS-licensed quasi-drug (의약외품) importer/distributor` : `식약처 허가 의약외품 수입/유통업체`));
    if (!qd.hasActive) out.redFlags.push(en ? 'All MFDS quasi-drug permits for this firm are cancelled/closed.' : '식약처상 의약외품 허가 모두 취하/폐업.');
  }

  out.found = out.registries.length > 0;

  // Live National Tax Service status when any registry gave us a biz-reg number.
  if (out.bizrno) {
    const nts = await checkBusinessStatus([out.bizrno]);
    const st = nts.get(out.bizrno.replace(/\D/g, ''));
    if (st?.registered) {
      out.activeBusiness = st.active;
      out.bizStatus = st.statusText;
      if (st.active) {
        out.evidence.unshift(en ? `✓ Active registered business — verified live with Korea NTS${st.taxType ? ` (${st.taxType})` : ''}` : `✓ 국세청 실시간 계속사업자 확인${st.taxType ? ` · ${st.taxType}` : ''}`);
      } else {
        out.redFlags.unshift(en ? `⚠ Not an active business per Korea NTS: ${st.statusText} — do not transact before reconfirming.` : `⚠ 국세청 실시간 조회상 정상영업 아님: ${st.statusText}`);
      }
    }
  }

  out.registries = [...new Set(out.registries)];
  return out;
}
