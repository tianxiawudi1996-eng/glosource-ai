export type UiLocale = 'ko' | 'en';
export type BuyerCountry = 'KR' | 'US' | 'EU' | 'JP' | 'SG' | 'AU' | 'GLOBAL';
export type CurrencyCode = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'SGD' | 'AUD';
export type UnitSystem = 'metric' | 'imperial';

export interface BuyerMarketProfile {
  country: BuyerCountry;
  labelKo: string;
  labelEn: string;
  currency: CurrencyCode;
  unitSystem: UnitSystem;
  complianceFocus: string[];
  destinationHint: string;
  paymentProvider: 'toss' | 'stripe' | 'manual';
}

export const BUYER_MARKETS: BuyerMarketProfile[] = [
  {
    country: 'KR',
    labelKo: '한국 바이어',
    labelEn: 'Korea buyer',
    currency: 'KRW',
    unitSystem: 'metric',
    complianceFocus: ['KC', 'KCs', 'KS', 'KTR/KCL test reports', 'battery safety', 'food-contact safety'],
    destinationHint: 'Busan Port, South Korea',
    paymentProvider: 'toss',
  },
  {
    country: 'US',
    labelKo: '미국 바이어',
    labelEn: 'United States buyer',
    currency: 'USD',
    unitSystem: 'imperial',
    complianceFocus: ['FCC', 'UL/ETL', 'FDA if applicable', 'CPSIA', 'Prop 65', 'ASTM'],
    destinationHint: 'Los Angeles / Long Beach, United States',
    paymentProvider: 'stripe',
  },
  {
    country: 'EU',
    labelKo: 'EU 바이어',
    labelEn: 'European Union buyer',
    currency: 'EUR',
    unitSystem: 'metric',
    complianceFocus: ['CE', 'RoHS', 'REACH', 'EN standards', 'WEEE if applicable'],
    destinationHint: 'Rotterdam, Netherlands',
    paymentProvider: 'stripe',
  },
  {
    country: 'JP',
    labelKo: '일본 바이어',
    labelEn: 'Japan buyer',
    currency: 'JPY',
    unitSystem: 'metric',
    complianceFocus: ['PSE', 'JIS', 'PSC if applicable', 'Japanese labeling requirements'],
    destinationHint: 'Yokohama / Tokyo, Japan',
    paymentProvider: 'stripe',
  },
  {
    country: 'SG',
    labelKo: '싱가포르 바이어',
    labelEn: 'Singapore buyer',
    currency: 'SGD',
    unitSystem: 'metric',
    complianceFocus: ['Enterprise Singapore safety marks if applicable', 'IMDA for wireless', 'ASEAN labeling'],
    destinationHint: 'Singapore Port',
    paymentProvider: 'stripe',
  },
  {
    country: 'AU',
    labelKo: '호주 바이어',
    labelEn: 'Australia buyer',
    currency: 'AUD',
    unitSystem: 'metric',
    complianceFocus: ['RCM', 'Australian Consumer Law', 'AS/NZS standards', 'biosecurity if applicable'],
    destinationHint: 'Sydney / Melbourne, Australia',
    paymentProvider: 'stripe',
  },
  {
    country: 'GLOBAL',
    labelKo: '글로벌 공통',
    labelEn: 'Global buyer',
    currency: 'USD',
    unitSystem: 'metric',
    complianceFocus: ['supplier certificates', 'sample validation', 'third-party inspection', 'destination-market compliance'],
    destinationHint: 'Buyer-designated destination port',
    paymentProvider: 'stripe',
  },
];

export function getBuyerMarket(country?: BuyerCountry): BuyerMarketProfile {
  return BUYER_MARKETS.find(market => market.country === country) ?? BUYER_MARKETS[0];
}

export function getLocaleLabel(locale: UiLocale, ko: string, en: string): string {
  return locale === 'en' ? en : ko;
}
