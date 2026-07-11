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

  // ── K-Food. Every HACCP claim below is matched against Korea's food-safety registry at seed time.
  //    These rows came from an autonomous run that invented a trustScore (78/82/88 by certificate
  //    combination, not by any audit), listed "NTS-verified" among the certificates although it only
  //    means the business registration is active, let two links rot, missed Sempio's real HACCP
  //    certificate (the registry lists its plants, not its head office), and held Haitai's without
  //    claiming it. Fixed here. ──
  {
    name: '(주)농심', nameEn: 'Nongshim Co., Ltd.', platform: 'Direct', url: 'https://www.nongshim.com/',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Korea\'s largest instant-noodle and snack maker, known for Shin Ramyun. HACCP-certified food manufacturer in the Korea food-safety registry (plants incl. Chungcheongnam-do). It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },
  {
    name: '(주)오뚜기', nameEn: 'Ottogi Corporation', platform: 'Direct', url: 'https://www.ottogi.co.kr/',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Major Korean food company (sauces, retort meals, Jin Ramen). HACCP-certified food manufacturer in the Korea food-safety registry (plants incl. Gyeonggi-do). It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },
  {
    name: '(주)움트리', nameEn: 'Woomtree Co., Ltd.', platform: 'Direct', url: 'http://www.woomtree.co.kr',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Sauce and seasoning manufacturer (spices, premixes, fermented pastes) exporting to many markets. HACCP-certified food manufacturer in the Korea food-safety registry (Gyeonggi-do). It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },
  {
    name: '(주)진미식품', nameEn: 'Jinmi Foods Company', platform: 'Direct', url: 'http://www.jinmifoods.co.kr/',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Fermented-paste maker (gochujang, doenjang, ssamjang, chunjang), operating since 1948. HACCP-certified food manufacturer in the Korea food-safety registry. It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },
  {
    name: '(주)크라운제과', nameEn: 'Crown Confectionery Co., Ltd.', platform: 'Direct', url: 'https://www.crown.co.kr/',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Confectionery manufacturer (biscuits, crackers, pies, candy, chocolate). HACCP-certified food manufacturer in the Korea food-safety registry (Asan and Jincheon plants). It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },
  {
    name: '(주)팔도', nameEn: 'Paldo Co., Ltd.', platform: 'Direct', url: 'https://www.paldofood.co.kr/',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Noodles, beverages and ready-to-eat meals (Bibim Men, Wang Ttukkeong). HACCP-certified food manufacturer in the Korea food-safety registry. It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },
  {
    name: '(주)한국제면', nameEn: 'Korean Noodles Co.,Ltd.', platform: 'Direct', url: 'https://www.koreannoodles.co.kr/',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Fresh-noodle specialist offering OEM / ODM / RMR, with over 30 years in the trade — one of the smaller plants here, so likelier to talk to a small buyer. HACCP-certified food manufacturer in the Korea food-safety registry (Gyeonggi-do; fresh and frozen noodle lines). It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },
  {
    name: '롯데웰푸드(주)', nameEn: 'Lotte Wellfood Co., Ltd.', platform: 'Direct', url: 'https://www.lottewellfood.com/en/',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Large confectionery and ice-cream maker (Pepero and other national brands). HACCP-certified food manufacturer in the Korea food-safety registry (many plants). It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },
  {
    name: '매일식품(주)', nameEn: 'Maeil Foods Co., Ltd.', platform: 'Direct', url: 'http://www.maeilfoods.co.kr/',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Traditional fermented pastes and soy sauces, over 80 years old. HACCP-certified food manufacturer in the Korea food-safety registry (Iksan plant). It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },
  {
    name: '몽고식품(주)', nameEn: 'MONGGO FOOD INC.', platform: 'Direct', url: 'http://www.monggofood.co.kr',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Korea\'s first soy-sauce maker (since 1905); soy sauces and fermented pastes. HACCP-certified food manufacturer in the Korea food-safety registry (Gyeongsangnam-do). It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },
  {
    name: '삼양식품(주)', nameEn: 'Samyang Foods Co., Ltd.', platform: 'Direct', url: 'https://www.samyangfoods.com/',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Maker of the Buldak ramen line and Korea\'s first instant ramen. HACCP-certified food manufacturer in the Korea food-safety registry (Wonju, Miryang plants). Linked to the operating company rather than the group site (roundsquare.ai, the Samyang Roundsquare holding company) — a sourcing buyer wants the factory, not the brand story. It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },
  {
    name: '삼진푸드', nameEn: 'Samjin Food Co., Ltd.', platform: 'Direct', url: 'https://www.samjinfoods.com',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Sauces, seasonings, concentrates and beverage bases, 40+ years old — a mid-size plant rather than a national brand. HACCP-certified food manufacturer in the Korea food-safety registry (Chungcheongbuk-do). It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },
  {
    name: '샘표식품', nameEn: 'Sempio Foods Company', platform: 'Direct', url: 'https://www.sempio.com/',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Soy sauce and fermented foods, 80+ years old. HACCP-certified food manufacturer in the Korea food-safety registry (Yeongdong and Icheon plants) — the earlier seed missed this because the registry lists the plants, not the head office. It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },
  {
    name: '신송식품(주)', nameEn: 'Singsong Food Corporation', platform: 'Direct', url: 'https://www.singsongfood.com/',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Korean sauces and pastes (gochujang, ssamjang, doenjang, soy sauce), 40+ years old. HACCP-certified food manufacturer in the Korea food-safety registry (Chungcheongnam-do). It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },
  {
    name: '씨제이제일제당(주)', nameEn: 'CJ CheilJedang Corp.', platform: 'Direct', url: 'https://www.cj.co.kr',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Korea\'s largest food company (Bibigo, sauces, frozen and processed foods). HACCP-certified food manufacturer in the Korea food-safety registry (many plants). It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },
  {
    name: '해태제과식품주식회사', nameEn: 'Haitai Confectionery and Foods Co., Ltd.', platform: 'Direct', url: 'http://www.ht.co.kr/eng/main',
    category: 'K-Food', country: 'KR', certifications: 'HACCP', trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Confectionery and frozen foods (snacks, chocolate, dumplings). HACCP-certified food manufacturer in the Korea food-safety registry (Gwangju, Cheonan, Cheongju plants) — the earlier seed held the certificate but never claimed it. It publishes no MOQ — ask for the minimum on your SKU.',
    addedBy: 'seed-script',
  },

  // ── K-Fashion. Korea publishes NO government registry of apparel manufacturers, so the badge
  //    cannot mean here what it means for cosmetics or food. Rather than imply a check we did not
  //    make, each note says plainly that manufacturer-vs-trader is unconfirmed. ──
  {
    name: '한세실업(주)', nameEn: 'Hansae Co., Ltd.', platform: 'Direct', url: 'https://www.hansae.com/',
    category: 'K-Fashion', country: 'KR', certifications: null, trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Large garment OEM/ODM for knit and woven apparel, supplying international brands. UNVERIFIED: Korea publishes no government registry of apparel manufacturers, so GloSource cannot confirm manufacturer-vs-trader status here the way it can for cosmetics (MFDS) or food (HACCP). Treat this as a candidate, not a checked supplier — ask to see the factory and its audits. No published MOQ.',
    addedBy: 'seed-script',
  },
  {
    name: '(주)신원', nameEn: 'SHINWON CORPORATION', platform: 'Direct', url: 'http://www.sw.co.kr/',
    category: 'K-Fashion', country: 'KR', certifications: null, trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Apparel manufacturer and exporter offering end-to-end OEM/ODM for fashion and casual wear. UNVERIFIED: Korea publishes no government registry of apparel manufacturers, so GloSource cannot confirm manufacturer-vs-trader status here the way it can for cosmetics (MFDS) or food (HACCP). Treat this as a candidate, not a checked supplier. No published MOQ.',
    addedBy: 'seed-script',
  },
  {
    name: '(주)기도산업', nameEn: 'KIDO INDUSTRIAL CO., LTD.', platform: 'Direct', url: 'http://www.kido.co.kr/',
    category: 'K-Fashion', country: 'KR', certifications: null, trustScore: null, moqMin: null, leadTimeDays: null,
    notes: 'Technical outerwear, performance sportswear and swimwear manufacturer. UNVERIFIED: Korea publishes no government registry of apparel manufacturers, so GloSource cannot confirm manufacturer-vs-trader status here the way it can for cosmetics (MFDS) or food (HACCP). Treat this as a candidate, not a checked supplier. No published MOQ.',
    addedBy: 'seed-script',
  },
];

/**
 * Rows to retire from the badge, by `name`. Deactivated rather than deleted so the decision stays
 * auditable — and so an autonomous run cannot quietly resurrect one.
 */
export const RETIRED: { name: string; reason: string }[] = [
  {
    name: '주식회사 오소이',
    reason:
      'OSOI designs and sells bags and shoes — it is a brand, i.e. a factory\'s customer, not a supplier. Badging it as a verified manufacturer is exactly the trader-as-manufacturer error GloSource exists to catch.',
  },
];
