export type CountryPreference = 'china' | 'southeast_asia' | 'europe' | 'japan' | 'any';
export type OrderFrequency = 'one_time' | 'monthly' | 'bimonthly_plus';

export interface SourcingRequest {
  productDescription: string;
  quantity: string;
  budget?: string;
  countryPreference: CountryPreference;
  orderFrequency: OrderFrequency;
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
  relevanceScore: number;
}

export interface WeChatSourcingOutput {
  posts: WeChatPost[];
  analysis: string;
  searchKeyword: string;
  disclaimer: string;
}
