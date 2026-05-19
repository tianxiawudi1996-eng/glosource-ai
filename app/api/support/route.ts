import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { findScenario, fillTemplate, SCENARIOS } from '@/app/lib/support/scenarios';

const resend = new Resend(process.env.RESEND_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const FOUNDER_EMAIL = 'glosourceai@gmail.com';
const FROM_EMAIL = process.env.RESEND_EMAIL_FROM ?? 'noreply@glosource.ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body as { name?: string; email?: string; message?: string };

    if (!email || !message) {
      return NextResponse.json({ error: 'email and message required' }, { status: 400 });
    }

    const displayName = name || email.split('@')[0];

    // Use Gemini to classify the scenario more accurately
    let scenarioId = 'fallback';
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const scenarioIds = SCENARIOS.map(s => s.id).join(', ');
      const classifyPrompt = `You are a customer support classifier for GloSource AI, a Korean B2B supplier sourcing SaaS tool.

Classify this customer message into ONE of these scenario IDs:
${scenarioIds}

Customer message: "${message}"

Respond with ONLY the scenario ID, nothing else.`;

      const result = await model.generateContent(classifyPrompt);
      const classified = result.response.text().trim().toLowerCase().replace(/[^a-z_]/g, '');
      if (SCENARIOS.find(s => s.id === classified)) {
        scenarioId = classified;
      } else {
        // Fall back to keyword matching
        scenarioId = findScenario(message).id;
      }
    } catch {
      scenarioId = findScenario(message).id;
    }

    const scenario = SCENARIOS.find(s => s.id === scenarioId) ?? SCENARIOS.find(s => s.id === 'fallback')!;
    const responseText = fillTemplate(scenario.response, displayName);

    // Send auto-reply to customer
    await resend.emails.send({
      from: `GloSource AI Support <${FROM_EMAIL}>`,
      to: email,
      subject: 'Re: Your GloSource AI Support Request',
      text: responseText,
    });

    // Notify founder if escalation needed or unknown scenario
    if (scenario.escalate || scenarioId === 'fallback') {
      await resend.emails.send({
        from: `GloSource Support Bot <${FROM_EMAIL}>`,
        to: FOUNDER_EMAIL,
        subject: `[ESCALATE] Support ticket from ${email} — ${scenarioId}`,
        text: `New support ticket requiring your attention:

FROM: ${name || 'Unknown'} <${email}>
SCENARIO: ${scenarioId}
CATEGORY: ${scenario.category}

MESSAGE:
${message}

---
AUTO-RESPONSE SENT:
${responseText}`,
      });
    }

    return NextResponse.json({ success: true, scenarioId });
  } catch (e) {
    console.error('[support]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
