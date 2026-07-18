import { lookup } from 'node:dns/promises';
import { load } from 'cheerio';
import type { Supplier } from '@/app/api/source/types';
import {
  GLOSOURCE_BOT_USER_AGENT,
  isPublicIpAddress,
  parsePublicHttpUrl,
} from '@/app/lib/public-url';

export type SupplierUrlFetcher = (input: string, init: RequestInit) => Promise<Response>;
export type SupplierHostResolver = (hostname: string) => Promise<readonly string[]>;
export interface SupplierUrlVerificationOptions {
  fetcher?: SupplierUrlFetcher;
  resolveAddresses?: SupplierHostResolver;
  signal?: AbortSignal;
  deadlineAt?: number;
  timeoutMs?: number;
}

async function resolveHostAddresses(hostname: string): Promise<readonly string[]> {
  const records = await lookup(hostname, { all: true, verbatim: true });
  return records.map((record) => record.address);
}

const URL_COMPANY_UNCONFIRMED = 'URL-company identity could not be confirmed from the page content — verify the supplier and link directly.';
const COMPANY_SUFFIXES = /\b(co|company|corp|corporation|inc|incorporated|ltd|limited|llc|plc|gmbh|factory|manufacturer|manufacturing|industrial|industries|trading|technology|technologies|group|global|international|korea|korean|china|chinese|cosmetic|cosmetics|oem|odm)\b|주식회사|유한회사|股份有限公司|有限公司|公司/giu;
const TOKEN_PATTERN = /[\p{L}\p{N}]+/gu;
const MAX_URL_CHECKS = 8;
const MAX_CONCURRENT_URL_CHECKS = 5;

function distinctiveNameTokens(value: string): string[] {
  const normalized = value.normalize('NFKC').toLocaleLowerCase().replace(COMPANY_SUFFIXES, ' ');
  return [...new Set((normalized.match(TOKEN_PATTERN) ?? []).filter((token) => token.length >= 2 && token !== '주'))];
}

function pageText(html: string): string {
  const $ = load(html);
  $('script, style, noscript, template').remove();
  const metadata = $('meta[property="og:title"], meta[name="description"]')
    .map((_, element) => $(element).attr('content') ?? '')
    .get()
    .join(' ');
  return `${$('title').text()} ${metadata} ${$('body').text()}`;
}

function supplierNameMatchesTokens(supplier: Supplier, pageTokens: ReadonlySet<string>): boolean {
  const candidates = [supplier.name, supplier.koreanName ?? '']
    .map(distinctiveNameTokens)
    .filter((tokens) => tokens.length > 0);

  return candidates.some((tokens) => {
    const matched = tokens.filter((token) => pageTokens.has(token)).length;
    return matched >= Math.min(2, tokens.length);
  });
}

export function supplierNameMatchesPage(supplier: Supplier, html: string): boolean {
  return supplierNameMatchesTokens(supplier, new Set(distinctiveNameTokens(pageText(html))));
}

function addUnconfirmedFlag(supplier: Supplier): void {
  supplier.verificationStatus = 'ai_estimated';
  supplier.urlCompanyMatch = false;
  const existing = Array.isArray(supplier.redFlags) ? supplier.redFlags : [];
  supplier.redFlags = existing.includes(URL_COMPANY_UNCONFIRMED)
    ? existing
    : [URL_COMPANY_UNCONFIRMED, ...existing];
}

async function readHtml(response: Response, limit = 300_000): Promise<string> {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let bytes = 0;

  try {
    while (bytes < limit) {
      const { done, value } = await reader.read();
      if (done) break;
      const remaining = limit - bytes;
      const chunk = value.byteLength > remaining ? value.slice(0, remaining) : value;
      result += decoder.decode(chunk, { stream: true });
      bytes += chunk.byteLength;
      if (chunk.byteLength < value.byteLength) break;
    }
    result += decoder.decode();
    return result;
  } finally {
    await reader.cancel().catch(() => {});
  }
}

export async function verifySupplierUrlIdentities(
  suppliers: Supplier[],
  options: SupplierUrlVerificationOptions = {},
): Promise<void> {
  const fetcher = options.fetcher ?? fetch;
  const resolveAddresses = options.resolveAddresses ?? (options.fetcher ? null : resolveHostAddresses);
  const timeoutMs = options.timeoutMs ?? 4000;
  const suppliersByUrl = new Map<string, Supplier[]>();

  for (const supplier of suppliers) {
    supplier.urlCompanyMatch = false;
    if (supplier.verificationStatus !== 'grounding_confirmed') continue;

    const url = parsePublicHttpUrl(supplier.url)?.requestUrl ?? null;
    if (!url) {
      addUnconfirmedFlag(supplier);
      supplier.url = '';
      continue;
    }

    supplier.url = url;
    const matches = suppliersByUrl.get(url) ?? [];
    matches.push(supplier);
    suppliersByUrl.set(url, matches);
  }

  const allEntries = [...suppliersByUrl];
  const entries = allEntries.slice(0, MAX_URL_CHECKS);
  for (const [, skippedSuppliers] of allEntries.slice(MAX_URL_CHECKS)) {
    skippedSuppliers.forEach(addUnconfirmedFlag);
  }
  let nextEntry = 0;
  async function worker(): Promise<void> {
    while (nextEntry < entries.length) {
      const [url, matchingSuppliers] = entries[nextEntry++];
      const remainingMs = options.deadlineAt == null
        ? timeoutMs
        : Math.min(timeoutMs, options.deadlineAt - Date.now());
      if (remainingMs <= 0) {
        matchingSuppliers.forEach(addUnconfirmedFlag);
        continue;
      }
      if (resolveAddresses) {
        try {
          const addresses = await resolveAddresses(new URL(url).hostname);
          if (addresses.length === 0 || addresses.some((address) => !isPublicIpAddress(address))) {
            matchingSuppliers.forEach(addUnconfirmedFlag);
            continue;
          }
        } catch {
          matchingSuppliers.forEach(addUnconfirmedFlag);
          continue;
        }
      }
      const timeoutSignal = AbortSignal.timeout(remainingMs);
      const signal = options.signal
        ? AbortSignal.any([options.signal, timeoutSignal])
        : timeoutSignal;
      try {
        const response = await fetcher(url, {
          method: 'GET',
          redirect: 'manual',
          signal,
          headers: {
            'User-Agent': GLOSOURCE_BOT_USER_AGENT,
            'Accept': 'text/html,text/plain;q=0.9,*/*;q=0.1',
          },
        });
        const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
        if (!response.ok || (contentType && !contentType.includes('text/html') && !contentType.includes('text/plain'))) {
          matchingSuppliers.forEach(addUnconfirmedFlag);
          await response.body?.cancel().catch(() => {});
          continue;
        }

        const html = await readHtml(response);
        const tokens = new Set(distinctiveNameTokens(pageText(html)));
        for (const supplier of matchingSuppliers) {
          if (supplierNameMatchesTokens(supplier, tokens)) {
            supplier.urlCompanyMatch = true;
          } else {
            addUnconfirmedFlag(supplier);
          }
        }
      } catch {
        matchingSuppliers.forEach(addUnconfirmedFlag);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(MAX_CONCURRENT_URL_CHECKS, entries.length) }, () => worker()),
  );
}
