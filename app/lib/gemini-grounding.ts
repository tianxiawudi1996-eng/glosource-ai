import type { EnhancedGenerateContentResponse, Tool } from '@google/generative-ai';

// @google/generative-ai 0.24.x types predate the current Gemini googleSearch tool.
export const GOOGLE_SEARCH_TOOLS: Tool[] = [
  { googleSearch: {} } as unknown as Tool,
];

export const FACTORY_DIRECT_ROUTE_BUDGET_MS = 55_000;
export const FACTORY_DIRECT_POST_MODEL_RESERVE_MS = 8_000;
export const FACTORY_DIRECT_MODEL_ATTEMPTS = [
  { model: 'gemini-2.5-flash', ms: 26_000, tools: GOOGLE_SEARCH_TOOLS },
  { model: 'gemini-2.5-flash', ms: 18_000, tools: GOOGLE_SEARCH_TOOLS },
] as const;

export function hasGroundingMetadata(response: EnhancedGenerateContentResponse): boolean {
  return response.candidates?.some((candidate) => {
    const chunks = candidate.groundingMetadata?.groundingChunks?.length ?? 0;
    const supports = candidate.groundingMetadata?.groundingSupports?.length ?? 0;
    return chunks > 0 || supports > 0;
  }) ?? false;
}

export function groundingUrls(response: EnhancedGenerateContentResponse): string[] {
  return response.candidates?.flatMap((candidate) =>
    candidate.groundingMetadata?.groundingChunks?.flatMap((chunk) =>
      chunk.web?.uri ? [chunk.web.uri] : [],
    ) ?? [],
  ) ?? [];
}

const GROUNDING_PROXY_HOSTS = new Set([
  'vertexaisearch.cloud.google.com',
]);

function normalizedHostname(value: string): string | null {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '').replace(/\.$/, '') || null;
  } catch {
    return null;
  }
}

function hostnameFromGroundingTitle(title: string): string | null {
  const direct = normalizedHostname(title.includes('://') ? title : `https://${title}`);
  if (direct && direct.includes('.')) return direct;
  const match = title.toLowerCase().match(/(?:[a-z0-9-]+\.)+[a-z]{2,}/)?.[0];
  return match?.replace(/^www\./, '').replace(/\.$/, '') ?? null;
}

export function groundingSourceHosts(response: EnhancedGenerateContentResponse): string[] {
  const hosts = new Set<string>();
  for (const candidate of response.candidates ?? []) {
    for (const chunk of candidate.groundingMetadata?.groundingChunks ?? []) {
      const uriHost = chunk.web?.uri ? normalizedHostname(chunk.web.uri) : null;
      if (uriHost && !GROUNDING_PROXY_HOSTS.has(uriHost)) hosts.add(uriHost);
      if (!uriHost || GROUNDING_PROXY_HOSTS.has(uriHost)) {
        const titleHost = chunk.web?.title ? hostnameFromGroundingTitle(chunk.web.title) : null;
        if (titleHost) hosts.add(titleHost);
      }
    }
  }
  return [...hosts];
}
