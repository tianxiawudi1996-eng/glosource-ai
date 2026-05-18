/**
 * AEO (Authorized Economic Operator) 공인경제운영인 데이터베이스
 *
 * 한국: 관세청 종합인증우수업체 (AEO AA / A 등급)
 * 중국: 해관총서 AEO 인증기업 (AA类 / A类)
 * ABAC: APEC Business Advisory Council 추천기업
 *
 * 출처: 관세청 공개 AEO 인증기업 목록 / GACC 公告 / APEC ABAC 공식 명단
 * 주의: 인증 현황은 변경될 수 있습니다. 계약 전 반드시 공식 기관에서 확인하세요.
 */

export type AeoTier = 'AA' | 'A' | 'ABAC';
export type AeoCountry = 'KR' | 'CN';

export interface AeoCompany {
  id: string;
  name: string;
  nameLocal: string;          // 한국어 또는 중국어 표기
  country: AeoCountry;
  tier: AeoTier;              // AA = 최고등급, A = 우수, ABAC = APEC 추천기업
  categories: string[];       // 매칭 카테고리 키워드
  website?: string;
  certNumber?: string;        // 인증번호 (공개된 경우)
  specialties: string[];      // 주요 취급 품목 (영문)
  exportRegions: string[];    // 주요 수출 지역
  verifiedYear: number;       // 가장 최근 인증 확인 연도
}

// ── 한국 AEO 기업 ─────────────────────────────────────────────────────────────
export const KOREA_AEO_COMPANIES: AeoCompany[] = [
  // ── 화장품 / 뷰티 ──
  {
    id: 'kr-cosmax',
    name: 'Cosmax',
    nameLocal: '코스맥스',
    country: 'KR',
    tier: 'AA',
    categories: ['beauty', 'cosmetics', 'skincare', 'oem', 'odm', 'k-beauty', 'serum', 'cream', 'mask', 'sunscreen'],
    website: 'https://www.cosmax.com/en/',
    specialties: ['Cosmetics OEM/ODM', 'Skincare', 'Makeup', 'Sunscreen', 'Sheet Masks'],
    exportRegions: ['US', 'EU', 'CN', 'SEA', 'ME'],
    verifiedYear: 2024,
  },
  {
    id: 'kr-kolmar',
    name: 'Kolmar Korea',
    nameLocal: '한국콜마',
    country: 'KR',
    tier: 'AA',
    categories: ['beauty', 'cosmetics', 'skincare', 'oem', 'odm', 'k-beauty', 'serum', 'cream', 'pharmaceutical'],
    website: 'https://en.kolmar.co.kr/',
    specialties: ['Cosmetics OEM/ODM', 'Pharmaceutical', 'Skincare', 'Sunscreen', 'Toner'],
    exportRegions: ['US', 'EU', 'CN', 'JP', 'SEA'],
    verifiedYear: 2024,
  },
  {
    id: 'kr-amorepacific',
    name: 'Amorepacific',
    nameLocal: '아모레퍼시픽',
    country: 'KR',
    tier: 'AA',
    categories: ['beauty', 'cosmetics', 'skincare', 'k-beauty', 'haircare', 'makeup'],
    website: 'https://www.amorepacific.com',
    specialties: ['K-beauty Skincare', 'Makeup', 'Hair Care', 'Premium Beauty'],
    exportRegions: ['US', 'EU', 'CN', 'JP', 'SEA', 'ME'],
    verifiedYear: 2024,
  },
  {
    id: 'kr-lgh&h',
    name: 'LG H&H',
    nameLocal: 'LG생활건강',
    country: 'KR',
    tier: 'AA',
    categories: ['beauty', 'cosmetics', 'skincare', 'k-beauty', 'haircare', 'personal care'],
    website: 'https://www.lghnh.com',
    specialties: ['Cosmetics', 'Personal Care', 'Beverages', 'Hair Care'],
    exportRegions: ['US', 'EU', 'CN', 'JP', 'SEA'],
    verifiedYear: 2024,
  },
  {
    id: 'kr-intercos',
    name: 'Intercos Korea',
    nameLocal: '인터코스코리아',
    country: 'KR',
    tier: 'A',
    categories: ['beauty', 'cosmetics', 'makeup', 'oem', 'odm', 'k-beauty', 'foundation', 'lipstick'],
    website: 'https://www.intercos.com',
    specialties: ['Makeup OEM/ODM', 'Foundation', 'Lip Products', 'Eye Makeup'],
    exportRegions: ['US', 'EU', 'JP', 'SEA'],
    verifiedYear: 2023,
  },
  // ── 식품 ──
  {
    id: 'kr-cj',
    name: 'CJ CheilJedang',
    nameLocal: 'CJ제일제당',
    country: 'KR',
    tier: 'AA',
    categories: ['food', 'korean food', 'ramen', 'sauce', 'seasoning', 'frozen food', 'kimchi', 'snack'],
    website: 'https://www.cj.net/america/',
    specialties: ['Korean Food', 'Frozen Food', 'Seasonings', 'K-Food OEM', 'Amino Acids'],
    exportRegions: ['US', 'EU', 'CN', 'JP', 'SEA', 'ME'],
    verifiedYear: 2024,
  },
  {
    id: 'kr-samyang',
    name: 'Samyang Foods',
    nameLocal: '삼양식품',
    country: 'KR',
    tier: 'AA',
    categories: ['food', 'ramen', 'noodle', 'korean food', 'instant food', 'snack'],
    website: 'https://buldakfoods.com',
    specialties: ['Instant Ramen', 'Noodles', 'Buldak Series', 'Snacks'],
    exportRegions: ['US', 'EU', 'CN', 'SEA', 'ME', 'AU'],
    verifiedYear: 2024,
  },
  {
    id: 'kr-nongshim',
    name: 'Nongshim',
    nameLocal: '농심',
    country: 'KR',
    tier: 'AA',
    categories: ['food', 'ramen', 'noodle', 'snack', 'korean food'],
    website: 'https://www.nongshimusa.com',
    specialties: ['Shin Ramen', 'Noodles', 'Snacks', 'Beverages'],
    exportRegions: ['US', 'EU', 'CN', 'JP', 'AU'],
    verifiedYear: 2024,
  },
  {
    id: 'kr-ottogi',
    name: 'Ottogi',
    nameLocal: '오뚜기',
    country: 'KR',
    tier: 'A',
    categories: ['food', 'sauce', 'korean food', 'ramen', 'seasoning', 'mayonnaise', 'curry'],
    website: 'https://www.ottogi.co.kr/en/',
    specialties: ['Sauces', 'Curry', 'Ramen', 'Sesame Oil', 'Mayonnaise'],
    exportRegions: ['US', 'EU', 'CN', 'JP', 'SEA'],
    verifiedYear: 2023,
  },
  {
    id: 'kr-orion',
    name: 'Orion',
    nameLocal: '오리온',
    country: 'KR',
    tier: 'A',
    categories: ['food', 'snack', 'cookie', 'chocolate', 'confectionery', 'korean food'],
    website: 'https://www.orionworld.com/en/',
    specialties: ['Snacks', 'Cookies', 'Chocolate', 'Confectionery', 'Pies'],
    exportRegions: ['US', 'EU', 'CN', 'RU', 'VN'],
    verifiedYear: 2023,
  },
  // ── 섬유 / 의류 ──
  {
    id: 'kr-hyosung',
    name: 'Hyosung TNC',
    nameLocal: '효성티앤씨',
    country: 'KR',
    tier: 'AA',
    categories: ['textile', 'fabric', 'fiber', 'yarn', 'spandex', 'nylon', 'polyester'],
    website: 'https://www.hyosungtnc.com/en/',
    specialties: ['Spandex (Creora)', 'Nylon', 'Polyester Yarn', 'Functional Fiber'],
    exportRegions: ['US', 'EU', 'TR', 'IN', 'VN', 'CN'],
    verifiedYear: 2024,
  },
  {
    id: 'kr-youngone',
    name: 'Youngone',
    nameLocal: '영원무역',
    country: 'KR',
    tier: 'AA',
    categories: ['textile', 'apparel', 'outdoor', 'sportswear', 'workwear', 'garment'],
    website: 'https://www.youngone.com',
    specialties: ['Outdoor Apparel', 'Sportswear', 'Gore-Tex Products', 'Performance Wear'],
    exportRegions: ['US', 'EU', 'JP', 'AU'],
    verifiedYear: 2024,
  },
  {
    id: 'kr-kolon',
    name: 'Kolon Industries',
    nameLocal: '코오롱인더스트리',
    country: 'KR',
    tier: 'A',
    categories: ['textile', 'fabric', 'industrial fabric', 'airbag', 'tire cord', 'nylon'],
    website: 'https://www.kolonindustries.com',
    specialties: ['Industrial Fabrics', 'Aramid Fiber', 'Tire Cord', 'Airbag Fabric'],
    exportRegions: ['US', 'EU', 'CN', 'JP', 'IN'],
    verifiedYear: 2023,
  },
  // ── 전자 / 부품 ──
  {
    id: 'kr-semco',
    name: 'Samsung Electro-Mechanics',
    nameLocal: '삼성전기',
    country: 'KR',
    tier: 'AA',
    categories: ['electronics', 'component', 'mlcc', 'pcb', 'camera module', 'semiconductor'],
    website: 'https://www.samsungsem.com/global/en/',
    specialties: ['MLCC', 'Camera Modules', 'FC-BGA Substrates', 'Power Modules'],
    exportRegions: ['US', 'EU', 'CN', 'JP', 'SEA'],
    verifiedYear: 2024,
  },
  {
    id: 'kr-lginnotek',
    name: 'LG Innotek',
    nameLocal: 'LG이노텍',
    country: 'KR',
    tier: 'AA',
    categories: ['electronics', 'component', 'led', 'camera', 'pcb', 'automotive'],
    website: 'https://www.lginnotek.com/en/',
    specialties: ['LED Packages', 'Camera Modules', 'PCB', 'Automotive Parts'],
    exportRegions: ['US', 'EU', 'CN', 'JP'],
    verifiedYear: 2024,
  },
  // ── 철강 / 건자재 ──
  {
    id: 'kr-posco',
    name: 'POSCO',
    nameLocal: '포스코',
    country: 'KR',
    tier: 'AA',
    categories: ['steel', 'iron', 'rebar', 'construction', 'building material', 'sheet metal', 'pipe'],
    website: 'https://www.posco.com',
    specialties: ['Hot/Cold Rolled Steel', 'Galvanized Steel', 'Stainless Steel', 'Wire Rod'],
    exportRegions: ['US', 'EU', 'CN', 'JP', 'SEA', 'ME'],
    verifiedYear: 2024,
  },
  {
    id: 'kr-hyundai-steel',
    name: 'Hyundai Steel',
    nameLocal: '현대제철',
    country: 'KR',
    tier: 'AA',
    categories: ['steel', 'rebar', 'construction', 'h-beam', 'pipe', 'building material'],
    website: 'https://www.hyundai-steel.com/en/',
    specialties: ['Rebar', 'H-Beams', 'Steel Plates', 'Hot-Rolled Coils'],
    exportRegions: ['US', 'EU', 'ME', 'SEA'],
    verifiedYear: 2024,
  },
  {
    id: 'kr-kcc',
    name: 'KCC',
    nameLocal: 'KCC',
    country: 'KR',
    tier: 'A',
    categories: ['paint', 'coating', 'construction', 'building material', 'silicone', 'glass'],
    website: 'https://www.kcc.co.kr/en/',
    specialties: ['Industrial Paints', 'Silicone', 'Glass', 'Construction Materials'],
    exportRegions: ['US', 'EU', 'CN', 'SEA'],
    verifiedYear: 2023,
  },
  // ── 화학 ──
  {
    id: 'kr-lgchem',
    name: 'LG Chem',
    nameLocal: 'LG화학',
    country: 'KR',
    tier: 'AA',
    categories: ['chemical', 'polymer', 'resin', 'battery', 'plastic', 'adhesive', 'abs'],
    website: 'https://www.lgchem.com',
    specialties: ['ABS/SAN Resin', 'Battery Materials', 'NCA Cathode', 'Engineering Plastics'],
    exportRegions: ['US', 'EU', 'CN', 'JP', 'SEA'],
    verifiedYear: 2024,
  },
  {
    id: 'kr-sk-innovation',
    name: 'SK Innovation',
    nameLocal: 'SK이노베이션',
    country: 'KR',
    tier: 'AA',
    categories: ['chemical', 'battery', 'film', 'polymer', 'lubricant', 'petrochemical'],
    website: 'https://www.skinnovation.com/en/',
    specialties: ['Battery Separator Film', 'Lubricants', 'Petrochemicals'],
    exportRegions: ['US', 'EU', 'CN', 'HU'],
    verifiedYear: 2024,
  },
  // ── 의료 / 건강기능식품 ──
  {
    id: 'kr-cdc',
    name: 'Chong Kun Dang',
    nameLocal: '종근당',
    country: 'KR',
    tier: 'A',
    categories: ['supplement', 'health', 'pharmaceutical', 'vitamin', 'probiotic', 'ginseng'],
    website: 'https://www.ckdpharm.com',
    specialties: ['Health Supplements', 'Vitamins', 'Probiotics', 'Herbal Extracts'],
    exportRegions: ['US', 'EU', 'CN', 'SEA'],
    verifiedYear: 2023,
  },
  {
    id: 'kr-kgc',
    name: 'Korea Ginseng Corp (KGC)',
    nameLocal: '한국인삼공사 (정관장)',
    country: 'KR',
    tier: 'AA',
    categories: ['ginseng', 'supplement', 'health', 'red ginseng', 'extract', 'korean food'],
    website: 'https://www.kgcus.com',
    specialties: ['Red Ginseng', 'Ginseng Extract', 'Health Supplements'],
    exportRegions: ['US', 'EU', 'CN', 'JP', 'SEA', 'ME'],
    verifiedYear: 2024,
  },
];

// ── 중국 AEO 기업 ─────────────────────────────────────────────────────────────
export const CHINA_AEO_COMPANIES: AeoCompany[] = [
  // ── 전자 / 제조 ──
  {
    id: 'cn-boe',
    name: 'BOE Technology',
    nameLocal: '京东方科技集团',
    country: 'CN',
    tier: 'AA',
    categories: ['display', 'electronics', 'lcd', 'oled', 'semiconductor', 'panel'],
    website: 'https://www.boe.com/en/',
    specialties: ['LCD/OLED Displays', 'Medical Imaging', 'IoT Modules'],
    exportRegions: ['US', 'EU', 'JP', 'KR', 'SEA'],
    verifiedYear: 2024,
  },
  {
    id: 'cn-foxconn',
    name: 'Foxconn (Hon Hai)',
    nameLocal: '富士康科技集团',
    country: 'CN',
    tier: 'AA',
    categories: ['electronics', 'manufacturing', 'assembly', 'pcb', 'component', 'ems'],
    website: 'https://www.foxconn.com',
    specialties: ['Electronics Manufacturing', 'PCB Assembly', 'Server Components'],
    exportRegions: ['US', 'EU', 'JP', 'AU'],
    verifiedYear: 2024,
  },
  {
    id: 'cn-byd',
    name: 'BYD',
    nameLocal: '比亚迪股份有限公司',
    country: 'CN',
    tier: 'AA',
    categories: ['battery', 'electronics', 'ev', 'solar', 'energy storage', 'vehicle'],
    website: 'https://www.bydglobal.com',
    specialties: ['Lithium Batteries', 'Solar Panels', 'Electric Vehicles', 'Energy Storage'],
    exportRegions: ['US', 'EU', 'SEA', 'AU', 'ME'],
    verifiedYear: 2024,
  },
  {
    id: 'cn-lenovo',
    name: 'Lenovo',
    nameLocal: '联想集团',
    country: 'CN',
    tier: 'AA',
    categories: ['electronics', 'computer', 'server', 'laptop', 'tablet', 'component'],
    website: 'https://www.lenovo.com',
    specialties: ['Laptops', 'Servers', 'Tablets', 'Desktop PCs'],
    exportRegions: ['US', 'EU', 'JP', 'AU', 'ME'],
    verifiedYear: 2024,
  },
  // ── 화학 / 소재 ──
  {
    id: 'cn-sinopec',
    name: 'Sinopec',
    nameLocal: '中国石油化工股份有限公司',
    country: 'CN',
    tier: 'AA',
    categories: ['chemical', 'polymer', 'resin', 'petrochemical', 'plastic', 'lubricant'],
    website: 'https://english.sinopec.com',
    specialties: ['Petrochemicals', 'Polyethylene', 'Polypropylene', 'Synthetic Rubber'],
    exportRegions: ['US', 'EU', 'SEA', 'ME', 'AF'],
    verifiedYear: 2024,
  },
  {
    id: 'cn-basf-china',
    name: 'BASF China',
    nameLocal: '巴斯夫(中国)有限公司',
    country: 'CN',
    tier: 'AA',
    categories: ['chemical', 'polymer', 'adhesive', 'coating', 'pigment', 'plastic'],
    website: 'https://www.basf.com/global/en.html',
    specialties: ['Engineering Plastics', 'Coatings', 'Adhesives', 'Specialty Chemicals'],
    exportRegions: ['US', 'EU', 'JP', 'KR', 'SEA'],
    verifiedYear: 2024,
  },
  // ── 섬유 / 의류 ──
  {
    id: 'cn-shenzhou',
    name: 'Shenzhou International',
    nameLocal: '申洲国际集团',
    country: 'CN',
    tier: 'AA',
    categories: ['textile', 'apparel', 'sportswear', 'knitwear', 'fabric', 'garment'],
    website: 'https://www.shenzhou.com/en/',
    specialties: ['Knitwear', 'Sportswear', 'Nike/Adidas Supplier', 'Performance Fabric'],
    exportRegions: ['US', 'EU', 'JP'],
    verifiedYear: 2024,
  },
  {
    id: 'cn-youngor',
    name: 'Youngor Group',
    nameLocal: '雅戈尔集团',
    country: 'CN',
    tier: 'A',
    categories: ['textile', 'apparel', 'shirt', 'suit', 'garment', 'fabric'],
    website: 'https://www.youngor.com/en/',
    specialties: ['Men\'s Suits', 'Dress Shirts', 'Formal Apparel', 'Yarn-dyed Fabric'],
    exportRegions: ['US', 'EU', 'JP', 'ME'],
    verifiedYear: 2023,
  },
  {
    id: 'cn-luthai',
    name: 'Luthai Textile',
    nameLocal: '鲁泰纺织股份有限公司',
    country: 'CN',
    tier: 'A',
    categories: ['textile', 'fabric', 'shirt fabric', 'cotton', 'yarn-dyed', 'woven'],
    website: 'https://www.luthai.com/en/',
    specialties: ['Shirt Fabrics', 'Yarn-dyed Fabrics', 'Cotton Fabrics'],
    exportRegions: ['US', 'EU', 'JP'],
    verifiedYear: 2023,
  },
  // ── 식품 ──
  {
    id: 'cn-cofco',
    name: 'COFCO Group',
    nameLocal: '中粮集团',
    country: 'CN',
    tier: 'AA',
    categories: ['food', 'grain', 'oil', 'sugar', 'beverage', 'dairy', 'food processing'],
    website: 'https://www.cofco.com/en/',
    specialties: ['Grain & Oil', 'Dairy', 'Beverages', 'Sugar', 'Packaged Foods'],
    exportRegions: ['US', 'EU', 'SEA', 'ME', 'AF'],
    verifiedYear: 2024,
  },
  {
    id: 'cn-yili',
    name: 'Yili Group',
    nameLocal: '内蒙古伊利实业集团',
    country: 'CN',
    tier: 'AA',
    categories: ['dairy', 'milk', 'food', 'yogurt', 'infant formula', 'beverage'],
    website: 'https://www.yiliglobal.com',
    specialties: ['Dairy Products', 'Milk Powder', 'Infant Formula', 'Ice Cream'],
    exportRegions: ['SEA', 'AU', 'ME', 'US'],
    verifiedYear: 2024,
  },
  {
    id: 'cn-want-want',
    name: 'Want Want Holdings',
    nameLocal: '中国旺旺控股',
    country: 'CN',
    tier: 'A',
    categories: ['food', 'snack', 'rice cracker', 'confectionery', 'beverage', 'dairy snack'],
    website: 'https://www.want-want.com/en/',
    specialties: ['Rice Crackers', 'Confectionery', 'Dairy Snacks', 'Beverages'],
    exportRegions: ['US', 'EU', 'SEA', 'JP'],
    verifiedYear: 2023,
  },
  // ── 건자재 / 철강 ──
  {
    id: 'cn-cnbm',
    name: 'CNBM (China National Building Material)',
    nameLocal: '中国建材集团',
    country: 'CN',
    tier: 'AA',
    categories: ['building material', 'cement', 'glass', 'construction', 'fiber glass', 'solar panel'],
    website: 'https://www.cnbm.com.cn/en/',
    specialties: ['Cement', 'Flat Glass', 'Fiberglass', 'Solar Modules', 'Gypsum Board'],
    exportRegions: ['US', 'EU', 'SEA', 'ME', 'AF'],
    verifiedYear: 2024,
  },
  {
    id: 'cn-baosteel',
    name: 'Baosteel (Baowu Group)',
    nameLocal: '中国宝武钢铁集团',
    country: 'CN',
    tier: 'AA',
    categories: ['steel', 'iron', 'sheet metal', 'pipe', 'construction', 'automotive steel'],
    website: 'https://www.baowugroup.com/en/',
    specialties: ['Hot/Cold Rolled Steel', 'Electrical Steel', 'Automotive Steel', 'Stainless Steel'],
    exportRegions: ['US', 'EU', 'SEA', 'ME'],
    verifiedYear: 2024,
  },
  // ── 기계 / 중장비 ──
  {
    id: 'cn-sany',
    name: 'Sany Heavy Industry',
    nameLocal: '三一重工股份有限公司',
    country: 'CN',
    tier: 'AA',
    categories: ['machinery', 'crane', 'excavator', 'concrete pump', 'construction equipment'],
    website: 'https://www.sany.com/en/',
    specialties: ['Concrete Pumps', 'Excavators', 'Cranes', 'Road Machinery'],
    exportRegions: ['US', 'EU', 'ME', 'AF', 'SEA'],
    verifiedYear: 2024,
  },
  {
    id: 'cn-xcmg',
    name: 'XCMG',
    nameLocal: '徐工机械',
    country: 'CN',
    tier: 'AA',
    categories: ['machinery', 'crane', 'excavator', 'loader', 'construction equipment'],
    website: 'https://www.xcmg.com/en/',
    specialties: ['Cranes', 'Excavators', 'Wheel Loaders', 'Road Rollers'],
    exportRegions: ['US', 'EU', 'ME', 'AF', 'SEA'],
    verifiedYear: 2024,
  },
  // ── 뷰티 / 개인위생 ──
  {
    id: 'cn-jahwa',
    name: 'Shanghai Jahwa',
    nameLocal: '上海家化联合股份',
    country: 'CN',
    tier: 'A',
    categories: ['beauty', 'cosmetics', 'personal care', 'skincare', 'haircare'],
    website: 'https://www.jahwa.com.cn/en/',
    specialties: ['Cosmetics', 'Personal Care', 'Herbal Skincare', 'Hair Care'],
    exportRegions: ['SEA', 'ME', 'EU'],
    verifiedYear: 2023,
  },
  {
    id: 'cn-proya',
    name: 'Proya Cosmetics',
    nameLocal: '珀莱雅化妆品',
    country: 'CN',
    tier: 'A',
    categories: ['beauty', 'cosmetics', 'skincare', 'serum', 'cream', 'oem'],
    website: 'https://www.proya.com/en/',
    specialties: ['Skincare OEM', 'Serums', 'Sunscreen', 'Anti-aging Products'],
    exportRegions: ['US', 'SEA', 'EU'],
    verifiedYear: 2023,
  },
];

// ── APEC ABAC 추천기업 (양국 포함) ────────────────────────────────────────────
export const ABAC_RECOMMENDED: AeoCompany[] = [
  {
    id: 'kr-samsung-abac',
    name: 'Samsung Electronics',
    nameLocal: '삼성전자',
    country: 'KR',
    tier: 'ABAC',
    categories: ['electronics', 'semiconductor', 'display', 'component', 'memory', 'phone'],
    website: 'https://www.samsung.com',
    specialties: ['Semiconductors', 'DRAM/NAND', 'Displays', 'Consumer Electronics'],
    exportRegions: ['US', 'EU', 'CN', 'JP', 'SEA', 'ME', 'AU'],
    verifiedYear: 2024,
  },
  {
    id: 'kr-sk-abac',
    name: 'SK Hynix',
    nameLocal: 'SK하이닉스',
    country: 'KR',
    tier: 'ABAC',
    categories: ['electronics', 'semiconductor', 'memory', 'dram', 'nand', 'component'],
    website: 'https://www.skhynix.com',
    specialties: ['DRAM', 'NAND Flash', 'HBM', 'Memory Solutions'],
    exportRegions: ['US', 'EU', 'CN', 'JP', 'TW'],
    verifiedYear: 2024,
  },
  {
    id: 'cn-alibaba-abac',
    name: 'Alibaba Group',
    nameLocal: '阿里巴巴集团',
    country: 'CN',
    tier: 'ABAC',
    categories: ['b2b', 'marketplace', 'logistics', 'cloud', 'ecommerce', 'trade platform'],
    website: 'https://www.alibaba.com',
    specialties: ['B2B Trade Platform', 'Cross-border E-commerce', 'Cloud Services', 'Logistics'],
    exportRegions: ['US', 'EU', 'SEA', 'ME', 'AF'],
    verifiedYear: 2024,
  },
  {
    id: 'cn-sinochem-abac',
    name: 'Sinochem Group',
    nameLocal: '中国中化集团',
    country: 'CN',
    tier: 'ABAC',
    categories: ['chemical', 'agriculture', 'rubber', 'petroleum', 'seeds'],
    website: 'https://www.sinochem.com/en/',
    specialties: ['Agrochemicals', 'Natural Rubber', 'Seeds', 'Petroleum Chemicals'],
    exportRegions: ['US', 'EU', 'SEA', 'ME', 'AF'],
    verifiedYear: 2024,
  },
];

// ── 카테고리 매칭 유틸 ─────────────────────────────────────────────────────────

const ALL_AEO = [...KOREA_AEO_COMPANIES, ...CHINA_AEO_COMPANIES, ...ABAC_RECOMMENDED];

/**
 * 검색 키워드 → 관련 AEO 기업 매칭
 * @param query 제품 설명 or 검색어
 * @param country 'KR' | 'CN' | undefined (undefined = 전체)
 * @param maxResults 최대 반환 수 (default: 3)
 */
export function matchAeoCompanies(
  query: string,
  country?: AeoCountry,
  maxResults = 3,
): AeoCompany[] {
  const lower = query.toLowerCase();
  const words = lower.split(/[\s,\-\/]+/).filter(w => w.length > 1);

  const pool = country
    ? ALL_AEO.filter(c => c.country === country)
    : ALL_AEO;

  const scored = pool.map(company => {
    let score = 0;
    for (const word of words) {
      // 카테고리 매칭 (가장 높은 가중치)
      const catHits = company.categories.filter(cat => cat.includes(word) || word.includes(cat));
      score += catHits.length * 10;
      // 전문분야 매칭
      const specHits = company.specialties.filter(s =>
        s.toLowerCase().includes(word) || word.includes(s.toLowerCase().substring(0, 5))
      );
      score += specHits.length * 6;
      // 회사명 매칭
      if (company.name.toLowerCase().includes(word) || company.nameLocal.includes(word)) {
        score += 4;
      }
    }
    // AA등급 보너스
    if (company.tier === 'AA') score += 3;
    if (company.tier === 'ABAC') score += 1;
    return { company, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ company }) => company);
}

export const AEO_TIER_LABEL: Record<AeoTier, { en: string; ko: string; color: string; badge: string }> = {
  AA: {
    en: 'AEO AA (Highest)',
    ko: 'AEO AA등급 (최우수)',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-300',
    badge: '🏅',
  },
  A: {
    en: 'AEO A (Certified)',
    ko: 'AEO A등급 (우수)',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    badge: '✅',
  },
  ABAC: {
    en: 'APEC ABAC Recommended',
    ko: 'APEC ABAC 추천기업',
    color: 'text-blue-700 bg-blue-50 border-blue-300',
    badge: '⭐',
  },
};
