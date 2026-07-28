import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { FunctionDeclaration } from '@google/generative-ai';
import { checkAuthAndQuota } from '../../lib/authMiddleware';
import { verifyKoreanCompany } from '../../lib/verify-company';

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

const verifyDecl = {
  name: 'verifyKoreanCompany',
  description:
    'Verify whether a Korean company is a real, government-registered manufacturer/business. ' +
    'Cross-checks Korea\'s MFDS cosmetics, HACCP food, medical-device, health-functional-food and quasi-drug ' +
    'registries plus the live National Tax Service business-status. Call this whenever the user names a ' +
    'specific Korean company or asks if a supplier is real/legit/registered.',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description:
          'The KOREAN registered company name (한글 상호). Translate English/brand names to the Korean ' +
          'corporate name first, e.g. COSMAX→코스맥스, Kolmar→한국콜마, 정관장(brand)→한국인삼공사, Nongshim→농심, ' +
          'Osstem→오스템임플란트. If unsure, use your best guess of the Korean corporate name.',
      },
    },
    required: ['name'],
  },
} as unknown as FunctionDeclaration;

const searchDecl = {
  name: 'searchSuppliers',
  description:
    'Search for Korean (or Chinese) suppliers/manufacturers for a product the buyer wants to source. ' +
    'Use when the user wants to FIND or SOURCE suppliers (not just verify a known one).',
  parameters: {
    type: 'object',
    properties: {
      product: { type: 'string', description: 'The product to source, e.g. "vegan facial serum, private-label/OEM".' },
      quantity: { type: 'string', description: 'Order quantity if mentioned, e.g. "5000 units". Default "1000".' },
      country: { type: 'string', description: '"korea" (default) or "china".' },
      buyerCountry: { type: 'string', description: 'Destination ISO code if mentioned: US, EU, GB, JP, SG, AU, MX, BR, KR. Else GLOBAL.' },
    },
    required: ['product'],
  },
} as unknown as FunctionDeclaration;

function systemPrompt(): string {
  return [
    'You are the GloSource sourcing assistant for FOREIGN B2B buyers sourcing products from Korean suppliers.',
    '',
    'CORE RULES:',
    '- You verify Korean suppliers against REAL government registries (MFDS cosmetics, HACCP food, medical devices, health-functional-food, quasi-drugs) plus a live National Tax Service business-status check. NEVER invent verification facts — only state exactly what the verifyKoreanCompany tool returns.',
    '- Whenever the user asks whether a company is real/legit/registered/a manufacturer, OR names a specific Korean company, call verifyKoreanCompany. ALWAYS pass the company\'s KOREAN registered name (한글 상호); translate English/brand names first.',
    '- After verifying: if found, briefly summarize which registries matched and whether it is an active business. If NOT found, say it is not in the registries you check — explain that this does not necessarily mean it is fake, but you cannot confirm it, and suggest the buyer ask the supplier for its 사업자등록번호 (business-registration number).',
    '- For sourcing requests (find/source suppliers for a product), call searchSuppliers. All plans may search; the sourcing results endpoint applies each plan\'s usage and detail limits.',
    '- Be concise, factual and buyer-friendly. Reply in the user\'s language (default English). Do not use markdown tables.',
    '- CRITICAL: always answer in natural, friendly PROSE of 1–3 sentences. NEVER output JSON, code, field names, or the raw tool result — the structured verification details are shown to the user separately, so just summarize them conversationally (e.g. "Yes — 코스맥스 is a government-registered cosmetics and medical-device manufacturer, and it\'s an active business per today\'s live tax-office check.").',
  ].join('\n');
}

interface ChatMessage { role: string; content: string }

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ reply: 'The assistant is temporarily unavailable.' }, { status: 503 });
  }
  const auth = await checkAuthAndQuota(request, 'chat', 'en');
  if (!auth.ok) return auth.response;
  let body: { messages?: ChatMessage[] };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }); }
  const messages = Array.isArray(body.messages) ? body.messages.filter((m) => m && typeof m.content === 'string') : [];
  if (!messages.length) return NextResponse.json({ error: 'no messages' }, { status: 400 });
  if (messages.length > 24) messages.splice(0, messages.length - 24); // cap context

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: [{ functionDeclarations: [verifyDecl, searchDecl] }],
    systemInstruction: systemPrompt(),
  });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content.slice(0, 4000) }],
  }));
  const latest = messages[messages.length - 1].content.slice(0, 4000);

  try {
    const chat = model.startChat({ history });
    const r1 = await chat.sendMessage(latest);
    const calls = r1.response.functionCalls?.() ?? [];
    if (calls.length) {
      const call = calls[0];
      if (call.name === 'verifyKoreanCompany') {
        const name = String((call.args as { name?: string }).name ?? '').trim();
        const v = await verifyKoreanCompany(name, 'en');
        const r2 = await chat.sendMessage([{ functionResponse: { name: call.name, response: { result: v } } }]);
        return NextResponse.json({ reply: r2.response.text(), verification: v });
      }
      if (call.name === 'searchSuppliers') {
        const a = call.args as { product?: string; quantity?: string; country?: string; buyerCountry?: string };
        return NextResponse.json({
          reply: `Searching Korean supplier candidates for “${a.product ?? ''}” and checking available government-registry signals…`,
          action: {
            type: 'search',
            params: {
              product: String(a.product ?? '').slice(0, 200),
              quantity: String(a.quantity ?? '1000').slice(0, 40),
              country: a.country === 'china' ? 'china' : 'korea',
              buyerCountry: String(a.buyerCountry ?? 'GLOBAL').slice(0, 8),
            },
          },
        });
      }
    }
    return NextResponse.json({ reply: r1.response.text() || 'Could you rephrase that?' });
  } catch {
    return NextResponse.json({ reply: 'Sorry — I had trouble with that. Try rephrasing, or use the search form above.' });
  }
}
