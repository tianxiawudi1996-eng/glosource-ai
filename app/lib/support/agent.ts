/**
 * Support auto-response agent — shared by the website form (/api/support) and inbound
 * email (/api/support/inbound). Classifies an inquiry, then SMART-routes:
 *  - clear FAQ/info/technical → full templated auto-reply
 *  - sensitive (refund/complaint/escalate=true) or sales/enterprise lead → short ack to
 *    the customer + full escalation to the founder for a personal reply (no templated reply)
 */
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { findScenario, fillTemplate, SCENARIOS } from './scenarios';

const FOUNDER_EMAIL = 'glosourceai@gmail.com';
const FROM_EMAIL = process.env.RESEND_EMAIL_FROM ?? 'noreply@glosourceai.com';

// High-value sales / enterprise signals → never answer with a template; ack + alert founder.
const SALES_LEAD_RE = /\b(enterprise|custom pricing|custom plan|high volume|bulk|team seats?|sso|api access|reseller|partnership|white[- ]?label|procurement|rfp|rfq for a contract)\b/i;

// Loop / auto-reply prevention — never auto-reply to these senders.
const NO_REPLY_RE = /(no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounce|notifications?@|automated?@|@.*amazonses\.com)/i;

export interface InquiryInput {
  name?: string;
  email: string;
  message: string;
  subject?: string;
  source: 'form' | 'email';
}

export interface AgentResult {
  handled: boolean;
  scenarioId: string;
  autoSent: boolean;
  escalated: boolean;
  skipped?: string;
}

async function classifyScenario(message: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const ids = SCENARIOS.map((s) => s.id).join(', ');
    const prompt = `You are a customer-support classifier for GloSource AI, a B2B Korean-supplier sourcing tool.
Classify the message below into ONE of these scenario IDs:
${ids}
Respond with ONLY the scenario ID, nothing else.

<customer_message>
${message}
</customer_message>`;
    const r = await model.generateContent(prompt);
    const c = r.response.text().trim().toLowerCase().replace(/[^a-z_]/g, '');
    if (SCENARIOS.find((s) => s.id === c)) return c;
  } catch {
    /* fall through to keyword matcher */
  }
  return findScenario(message).id;
}

export async function processSupportMessage(input: InquiryInput): Promise<AgentResult> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const email = String(input.email || '').trim();
  const name = (input.name?.trim() || email.split('@')[0] || 'there');
  const subject = (input.subject ?? '').trim();
  const message = String(input.message || '').trim();

  // Loop prevention: do not reply to automated/no-reply senders or to ourselves.
  if (!email || NO_REPLY_RE.test(email) || email.toLowerCase() === FROM_EMAIL.toLowerCase()) {
    return { handled: false, scenarioId: '-', autoSent: false, escalated: false, skipped: 'noreply_or_self' };
  }
  if (message.length < 3) {
    return { handled: false, scenarioId: '-', autoSent: false, escalated: false, skipped: 'empty' };
  }

  const scenarioId = await classifyScenario(message);
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS.find((s) => s.id === 'fallback')!;
  const isSalesLead = SALES_LEAD_RE.test(`${subject} ${message}`);
  const sensitive = scenario.escalate || isSalesLead;
  const replySubject = subject ? `Re: ${subject}` : 'Re: Your GloSource AI inquiry';

  if (sensitive) {
    // Short acknowledgement only — the founder replies personally.
    const ack = `Hi ${name},

Thanks for reaching out to GloSource AI — we've received your message and a member of our team will personally get back to you within 1 business day.

Best,
GloSource AI Team`;
    await resend.emails.send({ from: `GloSource AI <${FROM_EMAIL}>`, to: email, subject: replySubject, text: ack });
    await resend.emails.send({
      from: `GloSource Support Bot <${FROM_EMAIL}>`,
      to: FOUNDER_EMAIL,
      subject: `[${isSalesLead ? 'SALES LEAD' : 'ESCALATE'}] ${scenarioId} — ${name}`,
      text: `${isSalesLead ? 'Possible ENTERPRISE / SALES lead' : 'Sensitive support ticket'} (via ${input.source})

FROM: ${name} <${email}>
SUBJECT: ${subject || '-'}
SCENARIO: ${scenarioId} (${scenario.category})

MESSAGE:
${message}

— Reply to the customer directly. Only a short acknowledgement was auto-sent.`,
    });
    return { handled: true, scenarioId, autoSent: false, escalated: true };
  }

  // Clear FAQ / info / technical → full templated auto-reply.
  const responseText = fillTemplate(scenario.response, name);
  await resend.emails.send({
    from: `GloSource AI Support <${FROM_EMAIL}>`,
    to: email,
    subject: replySubject,
    text: responseText,
  });
  return { handled: true, scenarioId, autoSent: true, escalated: false };
}
