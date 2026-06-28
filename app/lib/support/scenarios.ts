export interface Scenario {
  id: string;
  category: string;
  triggers: string[]; // keywords/phrases that match this scenario
  response: string;   // email response template (use {{name}} placeholder)
  escalate?: boolean; // true = also notify founder
  tone: 'empathetic' | 'informative' | 'firm' | 'excited';
}

export const SCENARIOS: Scenario[] = [
  // ── BILLING ──────────────────────────────────────────────────────────
  {
    id: 'refund_no_usage',
    category: 'billing',
    triggers: ['refund', 'money back', 'cancel', 'charged', 'not used', 'never used', 'didnt use'],
    tone: 'empathetic',
    escalate: true,
    response: `Hi {{name}},

Thank you for reaching out. I completely understand, and I'm sorry to hear the service didn't work out for you.

I've passed your request to our billing team and they'll review your account within 1 business day. You'll hear back with next steps via email.

In the meantime, you still have full access to your account.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'refund_after_usage',
    category: 'billing',
    triggers: ['refund', 'money back', 'waste', 'useless', 'not worth', 'disappointed', 'bad results'],
    tone: 'empathetic',
    escalate: true,
    response: `Hi {{name}},

I'm really sorry the results didn't meet your expectations — that's genuinely frustrating, and I take that feedback seriously.

I've flagged your case for a personal review and our team will reach out within 1 business day to discuss options including a refund or an extended trial period.

Could you tell me what product you were sourcing? This helps me personally investigate what went wrong and improve quality for your category.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'cancel_subscription',
    category: 'billing',
    triggers: ['cancel', 'stop subscription', 'unsubscribe', 'end membership', 'discontinue'],
    tone: 'empathetic',
    escalate: true,
    response: `Hi {{name}},

I've received your cancellation request and passed it to our billing team. They'll process it within 1 business day and confirm via email. You'll keep full access until the end of your current billing period.

Before you go: was there something specific that didn't work for you? Even a quick note helps me improve GloSource for others.

You can always come back — the 5 free searches are always available at glosourceai.com/en.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'double_charged',
    category: 'billing',
    triggers: ['double charge', 'charged twice', 'duplicate payment', 'two payments', 'billed twice'],
    tone: 'empathetic',
    escalate: true,
    response: `Hi {{name}},

I sincerely apologize — that should never happen. I'm escalating this to our billing team right now.

To help us investigate quickly, could you reply with the transaction dates and amounts you were charged? Our team will review and respond within 1 business day.

Very sorry for the inconvenience.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'upgrade_plan',
    category: 'billing',
    triggers: ['upgrade', 'higher plan', 'more searches', 'pro plan', 'agency plan', 'need more'],
    tone: 'excited',
    response: `Hi {{name}},

Great to hear you want to upgrade! Here are your options:

• Starter ($39/mo) — 40 searches/month
• Pro ($99/mo) — 100 searches/month
• Business ($249/mo) — 300 searches/month + priority support
• Enterprise — custom pricing (contact sales) for unlimited volume, team & API

You can upgrade directly at: glosourceai.com/en/billing

The upgrade takes effect immediately, and the price difference is prorated for your current billing period.

Let me know if you have any questions!

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'downgrade_plan',
    category: 'billing',
    triggers: ['downgrade', 'lower plan', 'cheaper', 'reduce plan', 'starter plan'],
    tone: 'informative',
    response: `Hi {{name}},

No problem at all! You can switch to any plan at glosourceai.com/en/billing.

The downgrade takes effect at your next billing cycle, so you'll keep your current search allowance until then.

Let me know if there's anything else I can help with!

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'promo_code_issue',
    category: 'billing',
    triggers: ['promo code', 'discount code', 'coupon', 'producthunt', 'PRODUCTHUNT', 'code not working'],
    tone: 'informative',
    escalate: true,
    response: `Hi {{name}},

I'd love to help with your promo code! Could you reply with the code you're trying to use and I'll look into it personally.

If you're having trouble at checkout, you can also reach us directly at hello@glosource.ai and we'll apply any valid discount manually to your account.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'invoice_request',
    category: 'billing',
    triggers: ['invoice', 'receipt', 'billing document', 'VAT', 'tax invoice', 'company billing'],
    tone: 'informative',
    response: `Hi {{name}},

Your invoices and receipts are available through Polar.sh, our billing provider.

Log in at polar.sh with the email you used to subscribe, and you can download all invoices from your dashboard.

If you need a specific format for your accounting department, reply here with your company details and I'll arrange it.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'payment_failed',
    category: 'billing',
    triggers: ['payment failed', 'card declined', 'payment not going through', 'cant pay', 'billing error'],
    tone: 'informative',
    response: `Hi {{name}},

Sorry to hear that! A few things to try:

1. Make sure your card supports international transactions (some cards block foreign charges)
2. Try a different card or PayPal
3. Contact your bank to allow the charge from Polar.sh

If none of those work, reply here and I'll look into alternative payment options for you.

Best,
Vision @ GloSource AI`,
  },

  // ── RESULTS QUALITY ──────────────────────────────────────────────────
  {
    id: 'no_results',
    category: 'results',
    triggers: ['no results', 'nothing found', 'empty', 'zero results', 'found nothing', 'no suppliers'],
    tone: 'empathetic',
    response: `Hi {{name}},

Sorry you got no results! This usually happens when the search term is very specific. A few tips:

• Try a broader product description (e.g., "collagen serum" instead of "collagen serum 30ml peptide formula")
• Use the product category instead of brand name
• Try English keywords if you searched in another language

If you still get no results after trying these, reply with your exact search term and I'll run a manual check.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'supplier_not_responding',
    category: 'results',
    triggers: ['supplier not responding', 'no reply', 'email bounced', 'contact not working', 'no response from supplier'],
    tone: 'empathetic',
    escalate: false,
    response: `Hi {{name}},

Unfortunately, supplier responsiveness is outside our control — GloSource AI finds and surfaces supplier candidates, but response rates depend on the suppliers themselves.

A few tips to improve response rates:
• Send the RFQ on a Tuesday or Wednesday (Korean business hours: 9am–6pm KST)
• Follow up once after 3–5 business days
• Try contacting via the supplier's website directly in addition to email

That said, if multiple suppliers from a single search are all unresponsive, please share the search term and I'll look into whether the results need quality improvement.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'trust_score_explanation',
    category: 'results',
    triggers: ['trust score', 'what is trust score', 'how is score calculated', 'score meaning', 'reliability score'],
    tone: 'informative',
    response: `Hi {{name}},

Great question! The Trust Score (0–100) is an AI-calculated signal based on:

• Trade readiness indicators (export history signals, multi-platform presence)
• Certification signals (MFDS, HACCP, KC, KS, ISO detected)
• Platform activity (listing completeness, response signals)
• AEO customs certification (Korean Authorized Economic Operator)

Important: this is an AI-estimated signal, not a third-party audit. It helps you prioritize which suppliers to contact first — a score of 80+ means stronger signals, not a guarantee.

Always verify directly with the supplier before placing an order.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'price_moq_inaccurate',
    category: 'results',
    triggers: ['price wrong', 'MOQ wrong', 'inaccurate price', 'wrong price', 'price too high', 'different price'],
    tone: 'informative',
    response: `Hi {{name}},

The price and MOQ figures shown are AI estimates based on publicly available signals — they are labeled as "Est. Price" and "Est. MOQ" to indicate they may not reflect the supplier's current offer.

Actual prices and MOQs must be confirmed directly with the supplier via the RFQ.

If you consistently find our estimates far off for a specific category, please let me know the product type and I'll look into improving our signals for it.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'mfds_haccp_explanation',
    category: 'results',
    triggers: ['MFDS', 'HACCP', 'KC certification', 'what is MFDS', 'certification meaning', 'KS certification'],
    tone: 'informative',
    response: `Hi {{name}},

Here's a quick guide to the Korean certifications shown:

• **MFDS** — Ministry of Food and Drug Safety. Required for cosmetics and food products exported from Korea. Essential for K-beauty and K-food imports.
• **HACCP** — Hazard Analysis Critical Control Points. International food safety standard. Required for most Korean food manufacturers exporting to the US/EU.
• **KC** — Korea Certification. Mandatory safety mark for electronics sold in Korea. EU/US equivalents: CE / FCC.
• **KS** — Korean Industrial Standards. Voluntary quality standard, indicates product consistency.
• **AEO** — Authorized Economic Operator. Korean customs certification indicating reliable trade history.

Reply if you need help understanding which certifications your product requires!

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'results_irrelevant',
    category: 'results',
    triggers: ['wrong category', 'irrelevant results', 'not what I searched', 'wrong products', 'unrelated suppliers'],
    tone: 'empathetic',
    escalate: true,
    response: `Hi {{name}},

I'm sorry the results weren't relevant to what you were looking for — that's a real problem and I want to fix it.

Could you share:
1. What you searched for
2. What results came back
3. What you actually needed

This helps me improve the AI for your category directly.

In the meantime, I've added a free search credit to your account.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'want_more_results',
    category: 'results',
    triggers: ['more results', 'only few suppliers', 'need more suppliers', 'limited results', 'show more'],
    tone: 'informative',
    response: `Hi {{name}},

The number of results depends on how many search-grounded supplier candidates our AI can find across EC21, BuyKorea, and tradeKorea for your product.

To get more results:
• Try a broader search term
• Search for the product category (e.g., "K-beauty serum" returns more than "collagen serum 50ml with peptide")
• Try an alternative keyword

Pro and Business plans also get deeper search results. Check glosourceai.com/en/billing if you want to upgrade.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'search_slow',
    category: 'results',
    triggers: ['slow', 'loading', 'takes too long', 'timeout', 'spinning', 'hanging', 'no response'],
    tone: 'empathetic',
    response: `Hi {{name}},

Sorry for the slow experience! GloSource AI searches multiple Korean B2B platforms simultaneously via Google Search grounding, which can take 15–30 seconds depending on your product category.

If you hit a timeout (over 60 seconds):
1. Try refreshing and searching again
2. Use a slightly different search term
3. Try during off-peak hours (avoid 9am–12pm KST / midnight–3am UTC)

If the issue persists, please reply with your search term and I'll investigate.

Best,
Vision @ GloSource AI`,
  },

  // ── TECHNICAL ────────────────────────────────────────────────────────
  {
    id: 'login_issue',
    category: 'technical',
    triggers: ['cant login', 'login not working', 'sign in error', 'cant access', 'locked out', 'wrong password'],
    tone: 'informative',
    response: `Hi {{name}},

Sorry you're having trouble logging in! Here's what to try:

1. **Google login**: Make sure you're using the same Google account you registered with
2. **Clear browser cache**: Sometimes old session data causes login issues
3. **Try incognito mode**: Rules out browser extension conflicts
4. **Different browser**: Chrome or Firefox work best

If none of these work, reply with the email address you used and I'll manually check your account.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'password_reset',
    category: 'technical',
    triggers: ['forgot password', 'reset password', 'change password', 'password not working'],
    tone: 'informative',
    response: `Hi {{name}},

GloSource AI uses Google Sign-In, so there's no password to reset — you just log in with your Google account.

If you're having trouble with Google login, visit accounts.google.com to manage your Google account access.

Still stuck? Reply here and I'll help.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'dashboard_empty',
    category: 'technical',
    triggers: ['dashboard empty', 'no history', 'search history gone', 'cant see searches', 'history missing'],
    tone: 'informative',
    response: `Hi {{name}},

Search history is only saved when you're logged in. If you searched while logged out, those searches won't appear in the dashboard.

Going forward, make sure you're logged in before searching to have your history saved.

If you were logged in and the history is missing, please reply and I'll investigate your account.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'mobile_issue',
    category: 'technical',
    triggers: ['mobile', 'phone', 'iphone', 'android', 'tablet', 'not working on phone', 'mobile display'],
    tone: 'informative',
    response: `Hi {{name}},

Sorry for the mobile experience issue! GloSource AI is optimized for desktop use — some features may display differently on mobile.

For the best experience, I recommend using Chrome on desktop or laptop.

That said, the core search functionality does work on mobile. If something specific is broken, please describe what's happening and I'll look into a fix.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'rfq_not_working',
    category: 'technical',
    triggers: ['RFQ not working', 'RFQ error', 'cant generate RFQ', 'request for quote error', 'rfq blank'],
    tone: 'informative',
    response: `Hi {{name}},

Sorry about the RFQ issue! The RFQ draft is auto-generated from your search results — here's how to access it:

1. Run a search and wait for results
2. Click on any supplier card
3. The "Copy RFQ" button appears in the expanded view

If the button isn't showing or the text is blank, try:
• Refreshing the page and re-running the search
• Using Chrome or Firefox

Still not working? Reply with what browser you're using and I'll investigate.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'error_500',
    category: 'technical',
    triggers: ['error', '500', 'server error', 'internal error', 'something went wrong', 'broken', 'bug'],
    tone: 'empathetic',
    escalate: true,
    response: `Hi {{name}},

Sorry you hit an error! I've been notified and will investigate right away.

In the meantime:
1. Try refreshing and repeating your search
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try a slightly different search term

If the error persists, please share:
- What you searched for
- What error message appeared
- Your browser type

I'll add a free search credit to your account for the trouble.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'api_access',
    category: 'technical',
    triggers: ['API', 'API access', 'API key', 'integrate', 'webhook', 'programmatic', 'bulk search'],
    tone: 'informative',
    response: `Hi {{name}},

GloSource AI doesn't currently offer public API access, but it's available by request on the Enterprise tier (contact sales).

If you're looking for bulk sourcing or integration capabilities, reply here with your use case — I'm exploring early access partnerships for API users.

Best,
Vision @ GloSource AI`,
  },

  // ── FEATURE REQUESTS ─────────────────────────────────────────────────
  {
    id: 'more_countries',
    category: 'feature',
    triggers: ['Japan', 'Japanese', 'Taiwan', 'Vietnam', 'Indonesia', 'other countries', 'more countries', 'expand'],
    tone: 'excited',
    response: `Hi {{name}},

Great suggestion! We're currently focused on Korean suppliers (EC21, BuyKorea, tradeKorea) but expanding to other Asian markets is definitely on the roadmap.

Japan and Taiwan are next on the list. I'll add your vote to the feature tracker.

Would you be willing to beta test when we launch a new country? Reply here and I'll put you on the list.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'china_suppliers',
    category: 'feature',
    triggers: ['China', 'Chinese suppliers', '1688', 'Alibaba', 'Taobao', 'Chinese manufacturer'],
    tone: 'informative',
    response: `Hi {{name}},

GloSource AI is specifically focused on Korean suppliers — we don't cover Chinese suppliers (Alibaba, 1688, etc.) as those are already well-covered by existing tools.

Our value is in Korean manufacturers who are harder to find on Alibaba. If you're specifically looking for K-beauty, K-food, or Korean OEM manufacturers, we're the right tool.

If you still need Chinese suppliers, Alibaba.com and 1688.com are the go-to platforms.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'white_label',
    category: 'feature',
    triggers: ['white label', 'resell', 'rebrand', 'OEM software', 'private label software', 'partner'],
    tone: 'excited',
    escalate: true,
    response: `Hi {{name}},

That's an interesting opportunity! White-label and reseller partnerships are something we're exploring for the right partners.

Could you tell me more about your use case? (e.g., sourcing agent, e-commerce platform, trade consultant)

I'd love to set up a quick call to discuss. What's the best way to reach you?

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'team_accounts',
    category: 'feature',
    triggers: ['team', 'multiple users', 'share account', 'team plan', 'company account', 'seats'],
    tone: 'informative',
    response: `Hi {{name}},

For high volume, the Business plan ($249/mo) includes 300 searches, and the Enterprise tier (contact sales) covers unlimited volume with team seats by request.

If you need multiple user accounts, reply here with how many seats you need and I can put together a custom quote.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'bulk_export',
    category: 'feature',
    triggers: ['export', 'CSV', 'Excel', 'download', 'bulk download', 'spreadsheet', 'export all'],
    tone: 'informative',
    response: `Hi {{name}},

Excel/CSV export is on the roadmap for the Business tier.

In the meantime, you can copy the RFQ draft and supplier details from each result card.

I'll add your vote to the export feature — thanks for the feedback!

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'affiliate_program',
    category: 'feature',
    triggers: ['affiliate', 'referral program', 'commission', 'earn money', 'refer friends', 'partnership'],
    tone: 'excited',
    escalate: true,
    response: `Hi {{name}},

We're planning to launch an affiliate program soon! Interested partners will earn a commission on referred subscriptions.

Reply here with your website/audience size and I'll add you to the early access list.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'enterprise_custom',
    category: 'feature',
    triggers: ['enterprise', 'custom plan', 'large volume', 'custom pricing', 'Fortune 500', 'procurement team'],
    tone: 'excited',
    escalate: true,
    response: `Hi {{name}},

We'd love to work with you on a custom plan! For enterprise and high-volume sourcing needs, we can offer:

• Custom search quotas
• Dedicated support
• Custom integrations
• Volume pricing

Reply here with your monthly sourcing volume and team size, and I'll get back to you within 24 hours.

Best,
Vision @ GloSource AI`,
  },

  // ── GENERAL / INFO ───────────────────────────────────────────────────
  {
    id: 'what_is_glosource',
    category: 'info',
    triggers: ['what is glosource', 'how does it work', 'explain the product', 'what do you do', 'how does AI work'],
    tone: 'informative',
    response: `Hi {{name}},

GloSource AI is a Korean supplier discovery tool. Here's how it works:

1. **You describe your product** (e.g., "collagen serum OEM, 1000 units, MFDS certified")
2. **Our AI searches** EC21, BuyKorea (KOTRA-operated), and tradeKorea simultaneously via Google Search
3. **You get ranked results** with:
   - Trust Score (0–100)
   - Certification signals (MFDS, HACCP, KC, KS)
   - Estimated MOQ & unit price
   - Pre-filled English RFQ ready to send

It's built for Amazon FBA sellers, K-beauty importers, and anyone who sources from Korea.

5 free searches at glosourceai.com/en — no signup needed.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'gdpr_data_request',
    category: 'privacy',
    triggers: ['GDPR', 'delete my data', 'data request', 'privacy', 'personal data', 'right to erasure', 'data deletion'],
    tone: 'informative',
    escalate: true,
    response: `Hi {{name}},

We take data privacy seriously. Here's what we store for your account:

• Email address (from Google Sign-In)
• Search history (product descriptions and results)
• Subscription status

To request data deletion (right to erasure under GDPR):
Reply to this email with "DELETE MY DATA" and I'll remove your account and all associated data within 7 business days.

To export your data, reply with "EXPORT MY DATA" and I'll send you a copy within 72 hours.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'press_media',
    category: 'info',
    triggers: ['press', 'media', 'journalist', 'article', 'interview', 'write about', 'feature story'],
    tone: 'excited',
    escalate: true,
    response: `Hi {{name}},

Thanks for reaching out! We'd love to be featured.

A few quick facts:
• Launched May 2026
• Focused on Korean B2B supplier discovery (EC21, BuyKorea, tradeKorea)
• Built specifically for Amazon FBA sellers and K-beauty importers
• Bootstrapped, solo founder

Reply here with your publication and deadline and I'll get back to you within 24 hours.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'competitor_comparison',
    category: 'info',
    triggers: ['vs Alibaba', 'vs 1688', 'vs EC21', 'vs BuyKorea', 'competitor', 'compare', 'better than', 'difference'],
    tone: 'informative',
    response: `Hi {{name}},

Good question! Here's how GloSource AI compares:

| | GloSource AI | Alibaba | EC21 Direct | BuyKorea Direct |
|---|---|---|---|---|
| Korean suppliers | ✅ Specialized | ❌ Very few | ✅ | ✅ |
| AI trust scoring | ✅ | ❌ | ❌ | ❌ |
| Multi-platform search | ✅ (3 platforms) | ❌ | ❌ | ❌ |
| English RFQ auto-draft | ✅ | ❌ | ❌ | ❌ |
| Time to find suppliers | ~30 seconds | Hours | Hours | Hours |
| Cost | From $39/mo | Free | Free | Free |

We're not a replacement for Alibaba (different market). We're for buyers who specifically need Korean manufacturers.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'positive_feedback',
    category: 'info',
    triggers: ['love it', 'great tool', 'awesome', 'thank you', 'amazing', 'fantastic', 'very helpful', 'works great'],
    tone: 'excited',
    response: `Hi {{name}},

Thank you so much — that genuinely made my day! 🙏

If you have a moment, a short review on Product Hunt or a tweet would mean the world to a bootstrapped solo project like this.

Product Hunt: producthunt.com/posts/glosource-ai

Thanks again for the kind words, and happy sourcing!

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'free_plan_limit',
    category: 'billing',
    triggers: ['free searches used', 'limit reached', 'no more free', 'used all 5', 'out of free searches', 'exceeded limit'],
    tone: 'informative',
    response: `Hi {{name}},

You've used all 5 free searches! To continue, you can upgrade to a paid plan:

• **Starter** ($39/mo) — 40 searches/month = ~$0.98/search
• **Pro** ($99/mo) — 100 searches/month = ~$0.99/search
• **Business** ($249/mo) — 300 searches/month = ~$0.83/search

Upgrade at: glosourceai.com/en/billing

Use code **PRODUCTHUNT** for 1 month free!

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'how_to_use_rfq',
    category: 'info',
    triggers: ['how to use RFQ', 'RFQ template', 'send RFQ', 'request for quote', 'how to contact supplier'],
    tone: 'informative',
    response: `Hi {{name}},

Here's how to use the RFQ draft:

1. Run a search and expand a supplier card
2. Click **"Copy RFQ"** — it copies a pre-filled message to your clipboard
3. Find the supplier's email from their website or the listing
4. Paste and send

The RFQ is pre-filled with your product details, target MOQ, and certification requirements.

**Pro tip:** Send on Tuesday–Thursday (Korean business hours: 9am–6pm KST = midnight–9am UTC). Response rates are significantly higher.

Best,
Vision @ GloSource AI`,
  },

  // ── ESCALATION FALLBACK ───────────────────────────────────────────────
  {
    id: 'fallback',
    category: 'general',
    triggers: [],
    tone: 'empathetic',
    escalate: true,
    response: `Hi {{name}},

Thanks for reaching out to GloSource AI!

I've received your message and will personally review it within 24 hours (usually much faster).

If this is urgent, you can also reach me directly at support@glosource.ai.

Best,
Vision @ GloSource AI`,
  },
];

export function findScenario(message: string): Scenario {
  const lower = message.toLowerCase();

  // Score each scenario by trigger matches
  let bestMatch: Scenario = SCENARIOS.find(s => s.id === 'fallback')!;
  let bestScore = 0;

  for (const scenario of SCENARIOS) {
    if (scenario.id === 'fallback') continue;
    let score = 0;
    for (const trigger of scenario.triggers) {
      if (lower.includes(trigger.toLowerCase())) {
        score += trigger.split(' ').length; // longer phrases = higher score
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = scenario;
    }
  }

  return bestMatch;
}

export function fillTemplate(template: string, name: string): string {
  return template.replace(/\{\{name\}\}/g, name || 'there');
}
