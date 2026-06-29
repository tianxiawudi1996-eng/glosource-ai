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

If you're having trouble at checkout, you can also reach us directly at hello@glosourceai.com and we'll apply any valid discount manually to your account.

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

  // ── VERIFICATION & TRUST (expanded) ──────────────────────────────────
  {
    id: 'how_verification_works',
    category: 'results',
    triggers: ['how do you verify', 'how is verification', 'verify supplier', 'verification process', 'how do you check suppliers', 'government verified', 'verified meaning'],
    tone: 'informative',
    response: `Hi {{name}},

Great question — verification is the heart of GloSource. For each Korean supplier we surface, we cross-check the company name (and business-registration number when available) against official Korean government registries:

• MFDS — cosmetics manufacturers & responsible-distributors
• HACCP — certified food/livestock manufacturers
• MFDS medical-device licence holders
• Health-functional-food & quasi-drug (의약외품) makers
• National Tax Service — a live check that the business is still active (계속사업자)

When a supplier matches, you'll see a green "Gov-Verified" panel with the exact facts. AI-guessed signals are kept separate and clearly labeled "unverified." Always confirm details directly with the supplier before ordering.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'manufacturer_vs_trader',
    category: 'results',
    triggers: ['manufacturer or trader', 'middleman', 'is this a factory', 'real manufacturer', 'trading company', 'factory or reseller'],
    tone: 'informative',
    response: `Hi {{name}},

Telling a real manufacturer from a middleman is exactly what our government cross-check is for.

• If a supplier is registered with MFDS as a MANUFACTURER (제조), we label it as such.
• If it's only registered as a brand/distributor (책임판매), we flag that — it means someone else actually makes the product, so you should ask who.
• For medical devices we distinguish 제조업 (manufacturer) from 수입업 (importer).

A government "MANUFACTURER" record is the strongest signal you're dealing with the factory itself. Still, confirm production capability directly before committing.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'nts_active_business',
    category: 'results',
    triggers: ['active business', 'NTS', 'national tax', 'still in business', 'is the company active', 'business status', 'closed business'],
    tone: 'informative',
    response: `Hi {{name}},

The "Active business — verified live with Korea NTS" badge means we queried Korea's National Tax Service in real time and confirmed the company is a 계속사업자 (active, operating business) — not closed (폐업) or suspended (휴업).

This is the single strongest anti-fraud signal: a government-registered manufacturer that is also a currently-active taxpayer. If a firm shows as closed, we flag it as a red flag so you don't transact with a defunct entity.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'cgmp_explanation',
    category: 'results',
    triggers: ['CGMP', 'GMP', 'what is cgmp', 'good manufacturing', 'cosmetic gmp'],
    tone: 'informative',
    response: `Hi {{name}},

CGMP (Cosmetics Good Manufacturing Practice) is Korea's MFDS standard for cosmetics manufacturing quality and hygiene control. A CGMP-certified factory follows audited processes for production, testing, and storage.

When we show "CGMP-certified" on a cosmetics manufacturer, it's matched against the official MFDS CGMP list — a meaningful quality signal for K-beauty buyers. It is not a substitute for your own due diligence on a specific product, but it's a strong starting point.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'medical_device_verification',
    category: 'results',
    triggers: ['medical device', 'medical certification', 'is this a medical device maker', 'medical manufacturer', 'mfds medical'],
    tone: 'informative',
    response: `Hi {{name}},

For medical-device suppliers we cross-check Korea's MFDS medical-device registry. You'll see whether the company is a licensed MANUFACTURER (제조업) or IMPORTER/distributor (수입업), its business-registration number, and region — plus a live NTS active-business check.

Korean medical-device makers (dental, aesthetic, diagnostic, etc.) are a high-trust export category. As always, confirm the specific device's clearances for YOUR market (e.g., FDA/CE) directly with the supplier.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'health_food_verification',
    category: 'results',
    triggers: ['health functional food', 'health food', '건강기능식품', 'supplement maker', 'vitamin manufacturer', 'red ginseng', 'probiotics'],
    tone: 'informative',
    response: `Hi {{name}},

For health-functional-food suppliers (홍삼/red ginseng, probiotics, vitamins, etc.) we cross-check Korea's MFDS health-functional-food registry. A match means the company is a registered maker of government-recognized health-functional-food products.

This is a concentrated, OEM-heavy industry — a few large contract manufacturers make most products — so a registry match is a strong, real signal. Confirm specific product registrations and your own market's import rules before ordering.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'quasi_drug_verification',
    category: 'results',
    triggers: ['quasi drug', 'quasi-drug', '의약외품', 'toothpaste maker', 'sanitizer', 'mask manufacturer', 'band-aid'],
    tone: 'informative',
    response: `Hi {{name}},

Quasi-drugs (의약외품) cover toothpaste, hand sanitizers, masks, medicated patches, and similar. We cross-check Korea's MFDS quasi-drug registry and show whether a supplier is a MANUFACTURER (제조) or importer (수입), and whether its product permits are currently active vs cancelled/closed.

A firm whose permits are all cancelled gets a red flag. Confirm the specific item's permit status directly before ordering.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'confirm_certs_yourself',
    category: 'results',
    triggers: ['how do I confirm', 'verify myself', 'check certification myself', 'confirm the certificate', 'proof of certification', 'verify the documents'],
    tone: 'informative',
    response: `Hi {{name}},

Smart to double-check yourself. Here's how:

1. Ask the supplier for their 사업자등록번호 (business-registration number) and certificate numbers.
2. Cross-check the business number at the National Tax Service status lookup (we already do a live version of this).
3. For cosmetics/food/medical, ask for the MFDS/HACCP certificate and verify the company name matches.
4. Request a recent product test report or COA.

GloSource gives you the government-backed starting signals; these steps let you independently confirm before you wire any money.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'red_flags_explained',
    category: 'results',
    triggers: ['red flag', 'warning', 'caution', 'what does the red flag mean', 'risk signal', 'why flagged'],
    tone: 'informative',
    response: `Hi {{name}},

Red flags are signals we surface so you slow down before transacting. Common ones:

• "Registered as a brand/distributor, not a manufacturer" — someone else actually makes it.
• "Not an active business per NTS" — the company shows as closed/suspended.
• "Medical-device licence closed" or "all quasi-drug permits cancelled."
• Dead or unreachable supplier URL.

A red flag isn't proof of fraud — it means verify carefully before sending money. If you see one and aren't sure how to proceed, reply and I'll help you assess it.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'is_supplier_legit',
    category: 'results',
    triggers: ['is this supplier real', 'is this legit', 'can I trust this supplier', 'is the company real', 'scam supplier', 'fake supplier'],
    tone: 'informative',
    response: `Hi {{name}},

Here's how to judge a specific supplier with GloSource:

1. Check for the green "Gov-Verified" panel — a government-registry match is the strongest signal.
2. Look for "Active business — live NTS check" (a currently-operating, tax-registered company).
3. Note whether it's a MANUFACTURER vs a brand/distributor.
4. Watch for any red flags.

If a supplier shows none of these, it doesn't mean it's fake — just that we couldn't confirm it, so ask for its 사업자등록번호 and certificates. Want me to check a specific company name? Reply with it.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'biz_registration_check',
    category: 'results',
    triggers: ['business registration number', '사업자등록번호', 'business number', 'company registration', 'tax id', 'BRN'],
    tone: 'informative',
    response: `Hi {{name}},

The 사업자등록번호 (10-digit business-registration number) is the key to verifying any Korean company. When a supplier provides it, GloSource (and you) can confirm in real time with the National Tax Service whether the business is active (계속사업자), suspended, or closed.

Always ask a prospective supplier for this number — a legitimate company shares it readily, and it lets you independently confirm they're a real, operating business before you transact.

Best,
Vision @ GloSource AI`,
  },

  // ── SOURCING & SEARCH (expanded) ─────────────────────────────────────
  {
    id: 'how_search_works',
    category: 'results',
    triggers: ['how does search work', 'where does the data come from', 'how do you find suppliers', 'how it works', 'how does sourcing work'],
    tone: 'informative',
    response: `Hi {{name}},

When you enter a product, GloSource uses AI search grounding to find Korean supplier candidates across public B2B sources (EC21, BuyKorea/KOTRA, tradeKorea/KITA), then cross-checks each candidate against Korean government registries and a live tax-office status check.

You get a shortlist with: government-verified signals (where matched), an AI trust score, estimated price/MOQ, and a ready-to-send English RFQ draft. It's research that compresses days of sourcing into ~90 seconds — you still confirm commercial terms directly with the supplier.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'data_sources_explained',
    category: 'info',
    triggers: ['EC21', 'BuyKorea', 'tradeKorea', 'what platforms', 'which sources', 'where do you search', 'KOTRA', 'KITA'],
    tone: 'informative',
    response: `Hi {{name}},

We surface supplier candidates from major Korean export B2B platforms — EC21, BuyKorea (run by KOTRA, Korea's trade agency), and tradeKorea (run by KITA, the trade association) — and then verify them against government registries (MFDS, HACCP, medical-device, etc.) plus a live National Tax Service check.

So the discovery is broad and public; the trust layer is real government data. That combination is what separates GloSource from a plain supplier directory.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'data_freshness',
    category: 'results',
    triggers: ['how recent', 'how current', 'up to date', 'old data', 'how fresh', 'when was this updated', 'outdated'],
    tone: 'informative',
    response: `Hi {{name}},

Two layers, two freshness levels:

• Supplier discovery is AI-searched at query time, so it reflects current public listings.
• Government verification uses official registries we sync regularly, plus a LIVE National Tax Service status check at the moment you search — so "active business" reflects today's status.

Estimated price/MOQ are AI signals and can lag the supplier's current offer, so always confirm those directly.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'korea_vs_china_sourcing',
    category: 'results',
    triggers: ['korea or china', 'why not china', 'china vs korea', 'cheaper in china', 'should I use china', 'china instead'],
    tone: 'informative',
    response: `Hi {{name}},

It depends on your goal. China usually wins on lowest unit cost and massive variety. Korea wins on premium quality, brand cachet (K-beauty, K-food, K-medical), government-verifiable manufacturing, and FTA tariff advantages into the US/EU.

GloSource focuses on Korea because we can back Korean suppliers with real government data. We also offer a China add-on for candidates, but the verification layer is strongest for Korean suppliers. If you tell me your product and target market, I can suggest which fits better.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'product_categories',
    category: 'info',
    triggers: ['what products', 'which categories', 'do you cover', 'what can I source', 'product types', 'do you have'],
    tone: 'informative',
    response: `Hi {{name}},

You can search for almost any Korean product. Our government-verification layer is deepest for:

• Cosmetics / K-beauty (MFDS + CGMP)
• Food & beverages (HACCP)
• Medical & aesthetic devices (MFDS)
• Health-functional-food (홍삼, probiotics, vitamins)
• Quasi-drugs (toothpaste, sanitizers, masks)

For other categories you still get AI-surfaced supplier candidates and trust signals — just without a category-specific government match yet. We're adding more registries over time. What are you sourcing?

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'supplier_contact_how',
    category: 'results',
    triggers: ['how to contact', 'get supplier email', 'supplier phone', 'contact details', 'how do I reach', 'contact information'],
    tone: 'informative',
    response: `Hi {{name}},

For each shortlisted supplier you'll find the source URL and a pre-filled English RFQ you can send. On paid plans, full supplier details and the export-ready RFQ are unlocked.

Best practice: use the supplier's official website/listing contact plus the RFQ. If a contact looks missing or a link is dead, reply with the supplier name and I'll help you find an alternative route.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'supplier_link_dead',
    category: 'results',
    triggers: ['link dead', 'url not working', '404', 'page not found', 'link broken', 'website down'],
    tone: 'empathetic',
    response: `Hi {{name}},

Sorry about that — supplier pages do sometimes move or expire. We try to flag dead links and downgrade those suppliers, but a few slip through.

Please reply with the supplier's name and I'll help you find a working route (official site, alternative B2B listing, or the company's MFDS/registry record). You can also try searching the exact company name on Naver or Google with "공식" (official).

Best,
Vision @ GloSource AI`,
  },

  // ── MOQ, PRICING & ORDER TERMS ───────────────────────────────────────
  {
    id: 'what_is_moq',
    category: 'info',
    triggers: ['what is moq', 'minimum order', 'minimum quantity', 'moq meaning', 'smallest order'],
    tone: 'informative',
    response: `Hi {{name}},

MOQ = Minimum Order Quantity — the smallest amount a supplier will produce/sell in one order. Korean OEM/ODM MOQs vary a lot by category (cosmetics can be 1,000–3,000 units; food and devices differ).

The "Est. MOQ" we show is an AI estimate to help you compare — the real MOQ is set by the supplier and is often negotiable, especially for a first trial order. Ask in your RFQ, and consider requesting a small pilot run.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'negotiate_with_supplier',
    category: 'info',
    triggers: ['negotiate', 'lower moq', 'reduce price', 'haggle', 'better terms', 'discount from supplier'],
    tone: 'informative',
    response: `Hi {{name}},

A few tips that work well with Korean suppliers:

• Lead with a clear, professional RFQ (ours pre-fills this) — specificity earns better quotes.
• Ask for a small trial/pilot order to reduce MOQ for a first run.
• Request a price-break table at higher volumes (e.g., 1k / 3k / 5k units).
• Mention your target market and reorder potential — repeat business improves terms.

Be polite and concrete; Korean B2B values clear, respectful communication. Want help drafting a counter-offer? Reply with the details.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'lead_time_explained',
    category: 'info',
    triggers: ['lead time', 'how long to produce', 'production time', 'delivery time', 'how long does it take', 'turnaround'],
    tone: 'informative',
    response: `Hi {{name}},

Lead time = how long from order confirmation to goods ready to ship. For Korean OEM it's commonly a few weeks to a couple of months depending on product, customization, and whether tooling/formulation is needed — plus shipping time to your country.

The lead-time figure we show is an estimate; confirm the exact timeline (including sample → bulk) directly in your RFQ, and build in a buffer for QC and customs.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'request_samples',
    category: 'info',
    triggers: ['sample', 'samples', 'request a sample', 'get a sample', 'trial product', 'test product'],
    tone: 'informative',
    response: `Hi {{name}},

Always order samples before a bulk order. In your RFQ, ask the supplier for:

• Sample availability, cost, and who pays shipping
• Sample lead time
• Whether the sample matches bulk-production specs

Many Korean suppliers provide samples for the cost of the product + courier. Evaluate quality, packaging, and compliance for your market before committing. Our RFQ draft can include a sample request — just say the word.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'incoterms_explained',
    category: 'info',
    triggers: ['incoterms', 'FOB', 'CIF', 'EXW', 'shipping terms', 'who pays shipping', 'DDP'],
    tone: 'informative',
    response: `Hi {{name}},

Incoterms define who handles cost/risk at each shipping stage. The common ones for Korean exports:

• EXW — you arrange everything from the factory door (cheapest quote, most work for you).
• FOB Korea — supplier delivers to the Korean port; you handle freight onward (most common).
• CIF — supplier covers freight + insurance to your port.
• DDP — supplier delivers fully to your door, duties paid (simplest, priciest).

For a first order, FOB or CIF with a freight forwarder is a safe middle ground. Confirm the Incoterm in your RFQ so quotes are comparable.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'supplier_payment_terms',
    category: 'info',
    triggers: ['payment terms', 'how to pay supplier', 'T/T', 'L/C', 'escrow', 'pay the supplier', 'deposit', 'wire transfer'],
    tone: 'informative',
    response: `Hi {{name}},

GloSource doesn't handle payments — you pay suppliers directly — but here's standard practice for Korea:

• T/T (bank wire) is most common; a typical split is a deposit up front + balance before shipment.
• For larger first orders, an L/C (letter of credit) via your bank adds protection.
• Verify the bank account name matches the supplier's registered company name (사업자등록번호) before sending.

Never send the full amount up front to an unverified company. Use samples + a small first order to build trust.

Best,
Vision @ GloSource AI`,
  },

  // ── IMPORT, CERTS & COMPLIANCE (buyer's market) ──────────────────────
  {
    id: 'import_requirements',
    category: 'info',
    triggers: ['import requirements', 'what do I need to import', 'customs requirements', 'can I import', 'import to my country', 'regulations'],
    tone: 'informative',
    response: `Hi {{name}},

Import rules depend on your product + destination country. General checklist:

• Product compliance for your market (e.g., FDA for US cosmetics/food, CE/REACH for EU, etc.)
• Correct HS code + any import licence
• Labeling/language requirements for your country
• Duties/taxes (often reduced under a Korea FTA — see below)

GloSource finds and verifies the supplier; your local customs broker confirms exact import requirements. Tell me your product + destination and I can outline the typical certifications you'll need.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'fta_tariff_savings',
    category: 'info',
    triggers: ['FTA', 'tariff', 'duty', 'KORUS', 'free trade', 'import tax', 'tariff savings', 'certificate of origin'],
    tone: 'informative',
    response: `Hi {{name}},

This is a real money-saver. Korea has free-trade agreements with the US (KORUS), the EU, and many others — so many Korean-origin goods qualify for reduced or zero import tariffs.

To claim it, you'll need a Certificate of Origin from the supplier proving Korean origin. Ask for it in your RFQ. Depending on your product and country, this can cut your landed cost meaningfully versus sourcing from a non-FTA country. Your customs broker confirms the exact rate.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'hs_code_help',
    category: 'info',
    triggers: ['HS code', 'HS-code', 'customs code', 'tariff code', 'classification code', 'hscode'],
    tone: 'informative',
    response: `Hi {{name}},

The HS (Harmonized System) code classifies your product for customs and determines duty rates. GloSource surfaces a likely HS code as a starting signal, but the authoritative classification should be confirmed by your customs broker, since it affects duties and FTA eligibility.

Tell me your exact product and I can suggest the typical HS heading to discuss with your broker.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'market_cert_needed',
    category: 'info',
    triggers: ['do I need CE', 'do I need FDA', 'what certification for my market', 'REACH', 'FCC', 'certification for selling', 'compliance for my country'],
    tone: 'informative',
    response: `Hi {{name}},

Korean certifications (MFDS, KC, etc.) prove the supplier is legitimate in Korea — but to SELL in your market you also need your market's certifications. Rough guide:

• US: FDA registration (cosmetics/food/devices), FCC (electronics)
• EU: CE marking, REACH (chemicals), EU cosmetics notification
• Most markets: local labeling + safety standards

Ask the supplier whether they've exported to your market before and can support the needed documentation. Share your product + country and I'll list the usual requirements.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'labeling_requirements',
    category: 'info',
    triggers: ['labeling', 'packaging requirements', 'label in english', 'ingredient list', 'private label packaging', 'custom packaging'],
    tone: 'informative',
    response: `Hi {{name}},

Most Korean OEM suppliers can do private-label / custom packaging and labeling. For imports you'll typically need:

• Your market's required label language + mandatory info (ingredients, net weight, origin, importer)
• Compliant claims (avoid unapproved health claims)
• Barcodes/SKUs for retail

Specify your labeling needs in the RFQ so quotes include artwork/printing. Confirm your destination country's exact label rules with a local consultant.

Best,
Vision @ GloSource AI`,
  },

  // ── RFQ, CONTACT & WORKFLOW ──────────────────────────────────────────
  {
    id: 'rfq_translation',
    category: 'feature',
    triggers: ['RFQ language', 'translate RFQ', 'korean RFQ', 'send in korean', 'language of RFQ', 'english to korean'],
    tone: 'informative',
    response: `Hi {{name}},

Your RFQ draft is generated in clear English, which Korean export teams handle well. We can also provide Korean and Chinese versions of the RFQ so you can send whichever the supplier prefers.

For live conversations, GloSource Voice offers real-time interpreted negotiation. If you'd like a Korean copy of your current RFQ, just let me know the supplier and product.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'voice_call_feature',
    category: 'feature',
    triggers: ['voice call', 'voice feature', 'call the supplier', 'live call', 'phone the supplier', 'interpreted call', 'glosource voice'],
    tone: 'excited',
    response: `Hi {{name}},

GloSource Voice lets you have a live, interpreted voice conversation with a Korean supplier — you speak English, they hear Korean, and vice versa, in real time. It's designed to break the language barrier for negotiation and clarifying specs without hiring an interpreter.

You'll find the "GloSource Voice" button on a supplier's detail card. Try it for your next negotiation and let me know how it goes!

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'follow_up_suppliers',
    category: 'info',
    triggers: ['follow up', 'no reply yet', 'how to follow up', 'second email', 'chase supplier', 'havent heard back'],
    tone: 'informative',
    response: `Hi {{name}},

Following up is normal and expected. A good rhythm:

• Send the initial RFQ on Tue–Thu, Korean business hours (9am–6pm KST).
• If no reply in 3–5 business days, send a brief, polite follow-up restating quantity and timeline.
• Try a second channel (the supplier's website form or a different listed email).

Concise, specific messages get the best response rates. Want me to draft a follow-up note? Reply with the supplier and what you've asked so far.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'contact_multiple_suppliers',
    category: 'info',
    triggers: ['contact multiple', 'how many suppliers', 'reach out to several', 'should I contact all', 'multiple quotes'],
    tone: 'informative',
    response: `Hi {{name}},

Yes — contact 3–5 suppliers from your shortlist. Getting multiple quotes lets you compare price, MOQ, lead time, and responsiveness, and gives you negotiating leverage.

Prioritize the government-verified, active-business suppliers first. Send each a tailored RFQ (ours pre-fills the details), then shortlist the 1–2 most responsive for samples.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'export_report',
    category: 'feature',
    triggers: ['export report', 'download report', 'PDF', 'save report', 'download results', 'export to csv', 'excel export'],
    tone: 'informative',
    response: `Hi {{name}},

Paid plans include an exportable sourcing report so you can save and share your shortlist (Pro includes a full PDF report). CSV/Excel export is on the roadmap for the Business tier.

If you need a particular format for your team right now, reply and I'll help you get the data out in a usable form.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'save_projects',
    category: 'feature',
    triggers: ['save search', 'save project', 'project history', 'saved searches', 'come back later', 'save my shortlist'],
    tone: 'informative',
    response: `Hi {{name}},

Your recent searches appear on your dashboard so you can pick up where you left off. Saved projects and richer comparison/history are part of the Business plan and on our near-term roadmap.

If there's a specific shortlist you want to keep, export it (paid plans) so it's safe. Tell me how you like to organize sourcing and I'll flag it to the team.

Best,
Vision @ GloSource AI`,
  },

  // ── BILLING & PLANS (expanded) ───────────────────────────────────────
  {
    id: 'plan_comparison',
    category: 'billing',
    triggers: ['plan comparison', 'difference between plans', 'which plan', 'what plan should I get', 'compare plans', 'plan features'],
    tone: 'informative',
    response: `Hi {{name}},

Here's the quick rundown:

• Free — try it out with a few searches + basic verification.
• Starter ($39/mo) — 40 searches/month, for one active product line.
• Pro ($99/mo) — 100 searches/month, full reports + priority support (most popular).
• Business ($249/mo) — 300 searches/month, high-volume + export.
• Enterprise — custom (contact sales) for unlimited volume, team seats & API.

Pick based on monthly search volume. You can upgrade any time at glosourceai.com/en/billing. Tell me your use case and I'll recommend one.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'update_payment_method',
    category: 'billing',
    triggers: ['update card', 'change card', 'payment method', 'new credit card', 'update billing', 'expired card'],
    tone: 'informative',
    response: `Hi {{name}},

Billing is handled by our payment provider, Polar. To update your card, log in to your customer portal at polar.sh with the email you subscribed with — you can change your payment method and view invoices there.

If you have trouble accessing it, reply here and I'll get you a direct link.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'billing_cycle_proration',
    category: 'billing',
    triggers: ['billing cycle', 'when am I charged', 'billing date', 'proration', 'prorated', 'next charge', 'renewal date'],
    tone: 'informative',
    response: `Hi {{name}},

Plans bill monthly from your signup date and renew automatically. If you upgrade mid-cycle, the change takes effect immediately and the price difference is prorated for the remainder of the period. Downgrades take effect at your next billing date.

You can see your renewal date and invoices in the Polar customer portal. Anything specific you'd like me to check?

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'pause_subscription',
    category: 'billing',
    triggers: ['pause subscription', 'temporarily stop', 'pause my plan', 'hold subscription', 'freeze account'],
    tone: 'informative',
    escalate: true,
    response: `Hi {{name}},

We don't have a self-serve pause yet, but I don't want you paying for months you won't use. Reply and tell me roughly how long you'd like to pause, and I'll work out the best option with our billing team (e.g., downgrade to Free now and a smooth path back).

Your account and history stay intact in the meantime.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'annual_billing',
    category: 'billing',
    triggers: ['annual plan', 'yearly', 'annual discount', 'pay yearly', 'annual billing', 'yearly discount'],
    tone: 'informative',
    response: `Hi {{name}},

Right now plans are billed monthly. If you're interested in an annual commitment (and a discount for it), reply and let me know which plan — I'll see what we can arrange, especially for Business/Enterprise volumes.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'payment_currency',
    category: 'billing',
    triggers: ['currency', 'what currency', 'do you accept', 'pay in euros', 'pay in dollars', 'paypal', 'payment options'],
    tone: 'informative',
    response: `Hi {{name}},

Plans are priced in USD and processed by Polar, which accepts major international cards (and additional methods by region). Your bank converts to your local currency automatically.

If your card is declined, make sure it allows international transactions, or try a different card. Still stuck? Reply and I'll look into alternatives for you.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'free_trial_details',
    category: 'billing',
    triggers: ['free trial', 'is it free', 'try for free', 'free searches', 'free version', 'do I have to pay'],
    tone: 'informative',
    response: `Hi {{name}},

Yes — you can start free. Free includes a limited number of searches with basic government-verification results, so you can see real Korean suppliers before paying. Contact details, full evidence, and RFQ export unlock on a paid plan.

No Korean business entity is required to use GloSource. Create a free account at glosourceai.com/en/register and try a search.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'quota_reached',
    category: 'billing',
    triggers: ['quota reached', 'ran out of searches', 'limit reached', 'no more searches', 'used all searches', 'monthly limit'],
    tone: 'informative',
    response: `Hi {{name}},

Looks like you've hit your plan's monthly search limit — nice, you're putting it to work! Your searches reset at the start of your next billing cycle.

If you need more now, upgrading takes effect immediately (and is prorated). Starter→Pro→Business each step up your monthly searches. Manage it at glosourceai.com/en/billing, or reply and I'll recommend the right tier for your volume.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'refund_policy',
    category: 'billing',
    triggers: ['refund policy', 'can I get a refund', 'money back guarantee', 'do you refund', 'cancellation policy'],
    tone: 'informative',
    escalate: true,
    response: `Hi {{name}},

I want you to feel good about your subscription. If GloSource isn't delivering value, reply and tell me what went wrong — our team reviews refund requests case by case within 1 business day and we'll find a fair resolution.

You can cancel anytime to stop future charges via the Polar customer portal.

Best,
Vision @ GloSource AI`,
  },

  // ── ACCOUNT & TECHNICAL (expanded) ───────────────────────────────────
  {
    id: 'verification_email_missing',
    category: 'technical',
    triggers: ['verification email', 'didnt get email', 'no confirmation email', 'verify email not received', 'confirmation not arrived', 'resend verification'],
    tone: 'informative',
    response: `Hi {{name}},

Sorry the verification email is slow to arrive. Please:

1. Check your spam/junk folder (search for "glosourceai.com").
2. Wait a couple of minutes and refresh.
3. Use the "resend verification" option on the login page.
4. Make sure you registered the email correctly (typos happen).

If it still doesn't arrive after ~10 minutes, reply with your account email and I'll trigger it manually.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'change_account_email',
    category: 'technical',
    triggers: ['change email', 'update email', 'change my account email', 'wrong email', 'new email address'],
    tone: 'informative',
    escalate: true,
    response: `Hi {{name}},

To keep accounts secure we change the login email manually. Reply from your current account email with the new address you'd like, and I'll update it and confirm — usually within 1 business day.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'delete_account',
    category: 'privacy',
    triggers: ['delete account', 'close account', 'remove my account', 'delete my data', 'erase account', 'deactivate'],
    tone: 'informative',
    response: `Hi {{name}},

You can permanently delete your account and data yourself: go to your account settings (Settings → Delete account) and confirm. This is irreversible and removes your data.

If you'd rather we handle it, reply from your account email and we'll process the deletion and confirm. Anything we could fix to keep you instead? No pressure — just here to help.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'browser_issue',
    category: 'technical',
    triggers: ['browser', 'doesnt work in', 'chrome', 'safari', 'firefox', 'page not loading', 'blank page', 'display issue'],
    tone: 'informative',
    response: `Hi {{name}},

Let's get it working. Quick fixes:

1. Use an up-to-date Chrome, Safari, Edge, or Firefox.
2. Hard refresh (Ctrl/Cmd + Shift + R).
3. Disable ad-blockers/extensions for glosourceai.com, or try an incognito window.
4. Try another network or device to rule out a local issue.

If a specific page still misbehaves, reply with your browser + what you see (a screenshot helps) and I'll dig in.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'results_history_gone',
    category: 'technical',
    triggers: ['results gone', 'history disappeared', 'lost my searches', 'previous results missing', 'cant find old search'],
    tone: 'empathetic',
    response: `Hi {{name}},

Sorry about that. Recent searches show on your dashboard while you're logged in — make sure you're signed in with the same account you searched from (people sometimes have two).

If they're still missing, reply with your account email and roughly when you ran the search, and I'll look into it. To keep important shortlists safe going forward, export them (paid plans).

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'forgot_signup_email',
    category: 'technical',
    triggers: ['which email did I use', 'forgot email', 'dont remember email', 'cant find my account', 'what email did I sign up'],
    tone: 'informative',
    escalate: true,
    response: `Hi {{name}},

No problem. Try the email addresses you commonly use at the login page's "forgot password" — if an account exists, you'll get a reset link.

If none work, reply with the name and any details you used at signup (and the email you're writing from), and I'll help locate your account.

Best,
Vision @ GloSource AI`,
  },

  // ── TRUST, SAFETY & LEGAL ────────────────────────────────────────────
  {
    id: 'do_you_guarantee',
    category: 'info',
    triggers: ['do you guarantee', 'is quality guaranteed', 'guarantee delivery', 'guarantee the supplier', 'warranty', 'do you promise'],
    tone: 'firm',
    response: `Hi {{name}},

Honest answer: no, we don't guarantee product quality, delivery, or transaction outcomes — and you should be wary of any sourcing tool that claims to.

What GloSource does is give you the strongest possible starting signals: government-registry verification, live business-status checks, and AI trust signals, clearly separated from estimates. That dramatically lowers your risk, but you still run your own due diligence (samples, QC, contracts) before ordering. We're a research and verification tool, not a guarantor.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'who_handles_payment',
    category: 'info',
    triggers: ['do you handle payment', 'do you process orders', 'escrow service', 'trade assurance', 'do you take the money', 'middleman payment'],
    tone: 'firm',
    response: `Hi {{name}},

GloSource does not handle payments or process orders between you and suppliers — you transact directly with the supplier. We find and verify supplier candidates; the commercial relationship (quotes, payment, shipping) is between you and them.

For payment safety: verify the supplier (we help), order samples, start with a small order, and confirm the bank account name matches the registered company. Never wire large sums to an unverified company.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'supplier_dispute',
    category: 'general',
    triggers: ['dispute', 'supplier scammed', 'didnt receive goods', 'bad product received', 'supplier problem', 'fraud', 'got scammed'],
    tone: 'empathetic',
    escalate: true,
    response: `Hi {{name}},

I'm really sorry you're dealing with this — that's stressful. While the transaction was directly between you and the supplier (GloSource doesn't process orders), I want to help where I can.

Please reply with: the supplier name, what happened, and any documents (PO, payment proof, messages). I'll personally review it, flag the supplier in our system, and point you to the best recourse (your bank, customs, or Korean trade dispute channels).

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'is_glosource_safe',
    category: 'info',
    triggers: ['is glosource safe', 'is this legit', 'is this a scam', 'can I trust glosource', 'are you legitimate', 'is this real'],
    tone: 'informative',
    response: `Hi {{name}},

Fair question to ask of any new tool. GloSource is a sourcing-research platform: we surface Korean supplier candidates and back them with REAL Korean government data (MFDS, HACCP, medical-device registries) plus a live National Tax Service business-status check. We're transparent about what's verified vs AI-estimated.

We don't take your money for orders or hold your goods — you transact directly with suppliers. Try the free tier and see the government-verified results for yourself.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'data_privacy_usage',
    category: 'privacy',
    triggers: ['data privacy', 'how is my data used', 'do you sell my data', 'privacy policy', 'my information', 'data protection'],
    tone: 'informative',
    response: `Hi {{name}},

We take privacy seriously. We use your account info and searches to provide and improve the service; we don't sell your personal data. Search terms are used to return results and improve quality, and we keep what's needed to run your account and billing.

Full details are in our Privacy Policy. If you want a copy of your data or its deletion, reply and we'll handle it (see also GDPR requests).

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'liability_disclaimer',
    category: 'info',
    triggers: ['are you liable', 'liability', 'responsible if', 'who is responsible', 'legal responsibility', 'not my fault'],
    tone: 'firm',
    response: `Hi {{name}},

To be clear and fair: GloSource provides AI-generated supplier research and government-registry verification signals to support your decisions. We don't verify every claim, guarantee quality/delivery, or handle transactions — so the purchasing decision and contract are yours.

We give you strong, real signals to lower risk; you conduct final due diligence. Full terms are in our Terms of Service. Happy to walk you through anything specific.

Best,
Vision @ GloSource AI`,
  },

  // ── GENERAL & COMPARISON (expanded) ──────────────────────────────────
  {
    id: 'why_source_korea',
    category: 'general',
    triggers: ['why korea', 'why source from korea', 'benefits of korea', 'why korean suppliers', 'advantage of korea'],
    tone: 'informative',
    response: `Hi {{name}},

A few reasons buyers choose Korea:

• Premium quality + strong global brand appeal (K-beauty, K-food, K-medical, K-electronics).
• Government-verifiable manufacturing (MFDS, HACCP, etc.) — exactly what GloSource surfaces.
• FTA tariff advantages into the US, EU, and more (often 0% duty with a Certificate of Origin).
• Strong OEM/ODM and private-label capability for new brands.

If you tell me your product and target market, I'll explain whether Korea is a strong fit.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'who_is_glosource_for',
    category: 'general',
    triggers: ['who is this for', 'is this for me', 'who uses glosource', 'is it for small business', 'do I qualify', 'minimum to start'],
    tone: 'informative',
    response: `Hi {{name}},

GloSource is built for international buyers sourcing Korean products — indie brands, importers, distributors, retailers, and agencies — whether you're placing your first OEM order or sourcing at scale.

You don't need a Korean entity, and you can start free. If you're evaluating Korean suppliers and want government-verified signals before you commit, you're exactly who we built this for. What are you looking to source?

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'supported_languages',
    category: 'info',
    triggers: ['languages', 'what languages', 'do you support', 'spanish', 'multilingual', 'in my language', 'non-english'],
    tone: 'informative',
    response: `Hi {{name}},

The GloSource interface is in English, and your RFQ can be generated in English, Korean, and Chinese so you can communicate with suppliers. GloSource Voice also provides real-time interpretation for live calls.

You can write to support in your own language and our assistant will do its best to help. Which language would you prefer?

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'mobile_app_question',
    category: 'info',
    triggers: ['mobile app', 'is there an app', 'app store', 'android app', 'iphone app', 'download the app'],
    tone: 'informative',
    response: `Hi {{name}},

There's no separate mobile app yet — GloSource runs in your mobile browser and is designed to work on phones and tablets. Just open glosourceai.com and sign in.

A dedicated app may come later. If anything feels off on your device, reply with the details and I'll have it checked.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'partnership_inquiry',
    category: 'general',
    triggers: ['partnership', 'collaborate', 'business proposal', 'work together', 'integration partner', 'reseller program', 'become a partner'],
    tone: 'excited',
    escalate: true,
    response: `Hi {{name}},

Thanks for thinking of GloSource for a partnership! We're always open to the right collaborations (integrations, reseller/agency, content, distribution).

Please reply with a quick overview of who you are and what you have in mind, and I'll route it to the right person on our team to follow up directly.

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'getting_started',
    category: 'general',
    triggers: ['how do I start', 'getting started', 'how to begin', 'first steps', 'how to use', 'new user', 'where do I start'],
    tone: 'informative',
    response: `Hi {{name}},

Welcome! Here's the fastest path:

1. Create a free account at glosourceai.com/en/register.
2. Enter a product (e.g., "vegan facial serum, private-label").
3. Review the shortlist — look for the green "Gov-Verified" panel and active-business signals.
4. Send the pre-filled English RFQ to your top 3–5 suppliers, and request samples.

That's it — verified Korean suppliers in about 90 seconds. Reply any time and I'll guide you. What are you sourcing first?

Best,
Vision @ GloSource AI`,
  },
  {
    id: 'accuracy_concern',
    category: 'results',
    triggers: ['how accurate', 'accuracy', 'can I rely on', 'how reliable', 'is the data correct', 'how trustworthy is the data'],
    tone: 'informative',
    response: `Hi {{name}},

Honest breakdown of accuracy by layer:

• Government verification (MFDS/HACCP/medical/NTS) — real registry data, high confidence.
• Supplier discovery — AI-searched public listings; very useful but confirm the specific contact.
• Trust score and Est. Price/MOQ — AI estimates to help you prioritize, NOT guarantees.

We deliberately separate "verified" facts from "AI-estimated" signals so you always know which is which. Use the verified signals to shortlist, then confirm commercial terms directly.

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

If this is urgent, you can also reach me directly at support@glosourceai.com.

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
