import { GoogleGenerativeAI } from '@google/generative-ai';
import type { FunctionDeclaration } from '@google/generative-ai';
import { verifyKoreanCompany } from '../app/lib/verify-company';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const verifyDecl = {
  name: 'verifyKoreanCompany',
  description: 'Verify whether a Korean company is a real government-registered manufacturer. Call when user names a Korean company or asks if a supplier is real/legit.',
  parameters: { type: 'object', properties: { name: { type: 'string', description: 'KOREAN registered name (한글 상호). Translate English/brand names first: COSMAX→코스맥스, Kolmar→한국콜마.' } }, required: ['name'] },
} as unknown as FunctionDeclaration;

async function ask(prompt: string): Promise<void> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: [{ functionDeclarations: [verifyDecl] }],
    systemInstruction: 'You verify Korean suppliers against government registries. Always pass the KOREAN registered name to verifyKoreanCompany. CRITICAL: answer in natural friendly PROSE of 1-3 sentences; NEVER output JSON, field names, or the raw tool result — just summarize conversationally.',
  });
  const chat = model.startChat({});
  const r1 = await chat.sendMessage(prompt);
  const calls = r1.response.functionCalls?.() ?? [];
  console.log(`\n>>> "${prompt}"`);
  if (calls.length) {
    const c = calls[0];
    console.log(`  tool: ${c.name}(${JSON.stringify(c.args)})`);
    const v = await verifyKoreanCompany(String((c.args as { name?: string }).name ?? ''), 'en');
    const r2 = await chat.sendMessage([{ functionResponse: { name: c.name, response: { result: v } } }]);
    console.log(`  reply: ${r2.response.text().slice(0, 400)}`);
  } else {
    console.log(`  (no tool) reply: ${r1.response.text().slice(0, 300)}`);
  }
}

async function main(): Promise<void> {
  await ask('Is COSMAX a real Korean manufacturer?');
  await ask('can I trust 오스템임플란트?');
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
