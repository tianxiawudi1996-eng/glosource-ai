export type CountryPreference = 'china' | 'korea' | 'both' | 'any';
export type OrderFrequency = 'one_time' | 'monthly' | 'bimonthly_plus';
export type QuantityUnit = '개' | 'kg' | 'ton' | 'm' | 'm2' | 'm3' | 'set';
export type VerificationStatus = 'grounding_confirmed' | 'ai_estimated';
export type ProductStage = 'raw_material' | 'semi_finished' | 'finished_product';
export type BuyerCountry = 'KR' | 'US' | 'EU' | 'GB' | 'BR' | 'MX' | 'JP' | 'SG' | 'AU' | 'GLOBAL';
export type OutputLanguage = 'ko' | 'en';
export type CurrencyCode = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'SGD' | 'AUD';
export type UnitSystem = 'metric' | 'imperial';

export interface SourcingRequest {
  productDescription: string;
  quantity: string;
  budget?: string;
  countryPreference: CountryPreference;
  orderFrequency: OrderFrequency;
  categoryCode?: string;
  categoryNameZh?: string;
  quantityUnit?: QuantityUnit;
  buyerCountry?: BuyerCountry;
  outputLanguage?: OutputLanguage;
  currency?: CurrencyCode;
  unitSystem?: UnitSystem;
  destinationPort?: string;
}

export interface Supplier {
  rank: number;
  name: string;
  platform: string;
  country: string;
  url: string;
  trustScore: number;
  trustEvidence: string[];
  redFlags: string[];
  productMatch: string;
  estimatedPrice: string;
  moq: string;
  summary: string;
  verificationStatus: VerificationStatus;
  dbVerified?: boolean; // matched a manually-curated row in verified_suppliers (real, GloSource-curated)
  koreanName?: string; // Korean registered company name (한글 상호) for MFDS registry matching
  // ── Government-registry verification (real data, distinct from AI trustEvidence) ──
  govVerified?: boolean; // matched ≥1 Korean government registry (MFDS/HACCP/medical/health/quasi-drug)
  govRegistries?: string[]; // human labels of the registries matched, for the badge/tooltip
  govEvidence?: string[]; // government-sourced facts (hard signals), rendered separately from AI signals
  govActiveBusiness?: boolean; // National Tax Service live check returned an active business (계속사업자)
  productStage: ProductStage;
  leadTimeDays: string;
  hscode: string;
  exportToKoreaExperience: boolean;
}

export interface AeoMatchedCompany {
  id: string;
  name: string;
  nameLocal: string;
  country: 'KR' | 'CN';
  tier: 'AA' | 'A' | 'ABAC';
  specialties: string[];
  exportRegions: string[];
  website?: string;
  verifiedYear: number;
}

export interface MarketRiskFlag {
  code: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  detail: string;
}

export interface SourcingOutput {
  suppliers: Supplier[];
  recommendation: string;
  rfqEmail: {
    en: string;
    zh: string;
  };
  disclaimer: string;
  groundingUsed: boolean;
  qualityGate?: {
    policy: 'search_grounded_supplier_candidates';
    acceptedCount: number;
    rejectedCount: number;
    rejectionReasons: string[];
  };
  aeoMatches?: {
    korea: AeoMatchedCompany[];
    china: AeoMatchedCompany[];
  };
  marketRiskFlags?: MarketRiskFlag[];
  access?: {
    plan: string;
    supplierDetailsLocked: boolean;
    lockedReason?: string;
  };
}

export interface WeChatPost {
  accountName: string;
  accountType: string;
  articleTitle: string;
  publishDate: string;
  url: string;
  summary: string;
  productKeywords: string[];
  contactHint: string;
  productSpecs?: string;
  productEvidence?: string;
  priceRange?: string;
  moq?: string;
  location?: string;
  sourceType?: 'wechat_article' | 'web_search' | 'ai_estimated';
  relevanceScore: number;
}

export interface WeChatSourcingOutput {
  posts: WeChatPost[];
  analysis: string;
  searchKeyword: string;
  translatedKeyword?: string;
  disclaimer: string;
}
