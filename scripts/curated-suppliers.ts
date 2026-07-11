/**
 * The curated supplier list, kept apart from the seed runner so it can be unit-tested without a
 * database. tests/curated-suppliers.test.ts enforces the honesty rules described in
 * scripts/seed-suppliers.ts — every row carries its government-registry evidence, no score or MOQ
 * is ever invented, and a published MOQ must name its source.
 */
import type { verifiedSuppliers } from '../app/lib/db/schema';

export type CuratedSupplier = typeof verifiedSuppliers.$inferInsert;

export const CURATED: CuratedSupplier[] = [
  // ── Mega-ODMs. Kept for credibility and comparison; both now run indie programmes. ──
  {
    name: '코스맥스',
    nameEn: 'COSMAX',
    platform: 'Direct',
    url: 'https://www.cosmax.com',
    category: 'K-Beauty',
    country: 'KR',
    certifications: 'ISO 22716,CGMP',
    trustScore: null,
    moqMin: 1000,
    leadTimeDays: null,
    notes:
      'World-scale Korean cosmetics ODM (skincare / serum / ampoule). MFDS-licensed manufacturer (biz reg 143-81-19635, licensed 2012) and on the MFDS CGMP-certified list. Since 2023 it publicly runs an indie/micro-brand programme that lowered the minimum from 10,000 to 1,000 units per SKU — widely reported in the Korean business press, not a GloSource estimate. The 1,000-unit floor is the programme entry point, not a quote: confirm it for your specific SKU, formula and packaging.',
    addedBy: 'seed-script',
  },
  {
    name: '한국콜마',
    nameEn: 'Kolmar Korea',
    platform: 'Direct',
    url: 'https://www.kolmar.co.kr',
    category: 'K-Beauty',
    country: 'KR',
    certifications: 'ISO 22716,CGMP',
    trustScore: null,
    moqMin: null,
    leadTimeDays: null,
    notes:
      'Major science-led Korean cosmetics ODM with strong actives formulation. MFDS-licensed manufacturer (biz reg 307-81-02816, licensed 2012) and on the MFDS CGMP-certified list. It is reported to support indie brands, but publishes no MOQ figure — ask for the minimum on your SKU before you plan volumes.',
    addedBy: 'seed-script',
  },
  {
    name: '코스메카코리아',
    nameEn: 'Cosmecca Korea',
    platform: 'Direct',
    url: 'https://www.cosmecca.com',
    category: 'K-Beauty',
    country: 'KR',
    certifications: 'ISO 22716,CGMP',
    trustScore: null,
    moqMin: null,
    leadTimeDays: null,
    notes:
      'Established Korean cosmetics ODM with broad formulation capability (works with global and indie brands). MFDS-licensed manufacturer (biz reg 303-81-24119, licensed 2012) and on the MFDS CGMP-certified list. No public MOQ figure — confirm the serum-line minimum directly.',
    addedBy: 'seed-script',
  },

  // ── Mid-size CGMP plants. Smaller than the mega-ODMs, but they publish no MOQ. ──
  {
    name: '(주)나우코스',
    nameEn: 'NOWCOS',
    platform: 'Direct',
    url: 'https://nowcos.com',
    category: 'K-Beauty',
    country: 'KR',
    certifications: 'CGMP',
    trustScore: null,
    moqMin: null,
    leadTimeDays: null,
    notes:
      'Mid-size Korean cosmetics ODM/OEM — a real plant, not one of the mega-ODMs, so likelier to talk to a small brand. MFDS-licensed manufacturer (biz reg 130-81-69444, licensed 2012-09-27; plant in Sejong) and on the MFDS CGMP-certified list. It publishes no MOQ: GloSource will not guess one, so ask directly before you assume it is indie-friendly.',
    addedBy: 'seed-script',
  },
  {
    name: '(주)한국코스모',
    nameEn: 'Hankook Cosmo',
    platform: 'Direct',
    url: 'https://hankookcosmo.co.kr',
    category: 'K-Beauty',
    country: 'KR',
    certifications: 'CGMP',
    trustScore: null,
    moqMin: null,
    leadTimeDays: null,
    notes:
      'Mid-size Korean cosmetics OEM/ODM. MFDS-licensed manufacturer (biz reg 130-81-87189, licensed 2012-12-26; plant in Cheonan) and on the MFDS CGMP-certified list. It publishes no MOQ figure — ask for the minimum on your SKU. (Its site mentions "small-batch packaging", which is about pack format, not order minimums.)',
    addedBy: 'seed-script',
  },

  // ── Publishes a low MOQ. Licensed manufacturers, but NOT CGMP-listed — say so. ──
  {
    name: '(주)코스메디크',
    nameEn: 'COSMEDIQUE KOREA',
    platform: 'Direct',
    url: 'https://www.cmq.kr',
    category: 'K-Beauty',
    country: 'KR',
    certifications: null,
    trustScore: null,
    moqMin: 1000,
    leadTimeDays: null,
    notes:
      'Turnkey OEM/ODM that publicly states "MOQ starting from 1,000ea/sku" on its own site — a company claim, so confirm it for your formula and packaging. MFDS-licensed manufacturer (biz reg 206-81-58905, manufacturing licence 2016-08-11; plant in Osan). NOT on the MFDS CGMP-certified list, unlike COSMAX / Kolmar / Cosmecca / NOWCOS / Hankook Cosmo — ask what GMP scope its plant actually holds before contracting, especially if you export to markets that ask for it.',
    addedBy: 'seed-script',
  },
  {
    name: '주식회사씨티케이',
    nameEn: 'CTK (CTKCLIP)',
    platform: 'Direct',
    url: 'https://www.ctkclip.com',
    category: 'K-Beauty',
    country: 'KR',
    certifications: null,
    trustScore: null,
    moqMin: 1000,
    leadTimeDays: null,
    notes:
      'Ask first whether your SKU is made in CTK\'s own plant or routed to a partner factory: CTK is primarily a packaging and turnkey platform (CTKCLIP) that ALSO holds a manufacturing licence, so "manufacturer" is true but not the whole story. Its platform advertises small-batch production from 1,000 units. MFDS-licensed manufacturer (biz reg 214-86-81682, manufacturing licence 2023-02-28; plant in Hwaseong) — a recent licence, so it has less plant track record than the 2012-licensed ODMs here. NOT on the MFDS CGMP-certified list.',
    addedBy: 'seed-script',
  },
];
