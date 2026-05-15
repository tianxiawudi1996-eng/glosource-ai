export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingTimeMin: number;
  category: string;
  content: string; // HTML string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-find-korean-cosmetics-manufacturers',
    title: 'How to Find Korean Cosmetics Manufacturers for Private Label (2025 Guide)',
    description: 'A step-by-step guide to finding verified Korean OEM cosmetics manufacturers — covering BuyKorea, EC21, MFDS certification, MOQ requirements, and RFQ templates.',
    publishedAt: '2025-05-01',
    readingTimeMin: 7,
    category: 'Sourcing Guide',
    content: `
<h2>Why Korean cosmetics manufacturers?</h2>
<p>Korea is the world's 4th largest cosmetics exporter, shipping over $8.5 billion in beauty products annually (2023, KITA data). Korean manufacturers pioneered sheet masks, BB cream, snail mucin serums, and cushion compacts — formats now sold globally under hundreds of private label brands.</p>
<p>Finding the right Korean OEM (Original Equipment Manufacturer) or ODM (Original Design Manufacturer) can take weeks of manual research. This guide shows you a faster path.</p>

<h2>The three main sourcing channels</h2>
<h3>1. BuyKorea (KOTRA)</h3>
<p>BuyKorea is operated by KOTRA (Korea Trade-Investment Promotion Agency), a Korean government body. Suppliers on BuyKorea have basic export eligibility verification. It's free to contact suppliers, but the platform UI is dated and search is limited.</p>
<p><strong>Best for:</strong> Initial supplier discovery, checking if a company exports officially.</p>

<h3>2. EC21.com</h3>
<p>EC21 is Korea's largest B2B marketplace. It lists thousands of manufacturers across all categories. Verification is lighter than BuyKorea — any company can list.</p>
<p><strong>Best for:</strong> Volume of options, comparing multiple suppliers quickly.</p>

<h3>3. tradeKorea (KITA)</h3>
<p>tradeKorea is operated by KITA (Korea International Trade Association). Similar to BuyKorea in credibility, slightly different supplier mix.</p>

<h2>What certifications matter for Korean cosmetics?</h2>
<ul>
<li><strong>MFDS (Ministry of Food and Drug Safety)</strong> — Korean equivalent of FDA. Look for manufacturers registered with MFDS as a cosmetics manufacturer. This is the most important signal.</li>
<li><strong>CGMP / ISO 22716</strong> — Good Manufacturing Practice for cosmetics. Serious exporters will have this.</li>
<li><strong>HALAL / Vegan certified</strong> — Required for Middle East and growing Western markets.</li>
</ul>

<h2>Typical MOQ (Minimum Order Quantities) for Korean cosmetics</h2>
<table>
<thead><tr><th>Product type</th><th>MOQ range</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>Sheet masks</td><td>1,000–5,000 pcs</td><td>Low MOQ common</td></tr>
<tr><td>Serums / essences</td><td>500–3,000 pcs</td><td>Varies by bottle size</td></tr>
<tr><td>Cream / moisturizers</td><td>1,000–5,000 pcs</td><td>Filling cost drives MOQ</td></tr>
<tr><td>Cushion compacts</td><td>2,000–10,000 pcs</td><td>Higher due to compact tooling</td></tr>
<tr><td>Lip products</td><td>1,000–5,000 pcs</td><td>Depends on formulation</td></tr>
</tbody>
</table>

<h2>How to write an RFQ to a Korean manufacturer</h2>
<p>Korean manufacturers respond best to structured, specific RFQ emails. Include:</p>
<ol>
<li>Your company name and country</li>
<li>Exact product specification (formulation type, texture, finish)</li>
<li>Target MOQ and annual volume</li>
<li>Packaging requirements (bottle, cap, label)</li>
<li>Certifications required (MFDS, CGMP, Vegan)</li>
<li>Target ex-factory price range (or ask for quote)</li>
<li>Lead time requirements</li>
<li>Sample request (most manufacturers offer samples for $30–100)</li>
</ol>

<h2>Using AI to speed up your search</h2>
<p>Manually checking BuyKorea, EC21, and tradeKorea separately takes hours. GloSource AI searches all three channels simultaneously via Google Search, ranks candidates by trust signals and certification evidence, and generates a ready-to-send English RFQ email — in about 90 seconds.</p>
<p>The AI doesn't verify suppliers or guarantee quality, but it dramatically cuts the research time from hours to minutes.</p>

<h2>Summary checklist</h2>
<ul>
<li>✅ Check MFDS registration for serious manufacturers</li>
<li>✅ Request CGMP / ISO 22716 certificate</li>
<li>✅ Always request a sample before placing a first order</li>
<li>✅ Confirm ex-factory (FOB Busan/Incheon) pricing</li>
<li>✅ Check payment terms (30% deposit + 70% before shipping is standard)</li>
<li>✅ Verify the manufacturer handles export documentation</li>
</ul>
    `.trim(),
  },
  {
    slug: 'ec21-vs-buykorea-vs-tradekorea-comparison',
    title: 'EC21 vs BuyKorea vs tradeKorea: Which Korean B2B Platform Should Importers Use?',
    description: 'An honest comparison of Korea\'s top B2B sourcing platforms — EC21, BuyKorea (KOTRA), and tradeKorea (KITA) — for international buyers looking for Korean manufacturers.',
    publishedAt: '2025-05-08',
    readingTimeMin: 5,
    category: 'Platform Guide',
    content: `
<h2>The three platforms at a glance</h2>
<p>If you're sourcing from Korea, you'll eventually discover three dominant B2B directories: EC21, BuyKorea, and tradeKorea. All three are free to use as a buyer. Here's what actually matters when choosing between them.</p>

<h2>BuyKorea (KOTRA)</h2>
<p><strong>Operator:</strong> KOTRA (Korea Trade-Investment Promotion Agency) — a Korean government body with a mandate to promote Korean exports.</p>
<p><strong>Verification level:</strong> Medium-high. Suppliers must register as a Korean business with export history or intent. KOTRA actively curates some listings.</p>
<p><strong>Best categories:</strong> Manufacturing, industrial goods, materials, electronics. Strong B2B focus.</p>
<p><strong>Weaknesses:</strong> Dated UI, limited search filters, fewer listings than EC21, and some profiles are stale.</p>
<p><strong>Verdict:</strong> Use for verifying a supplier's legitimacy. If a company is on BuyKorea and has a filled profile, it's a reasonable trust signal.</p>

<h2>EC21</h2>
<p><strong>Operator:</strong> EC21 Inc. (private company), Korea's largest B2B marketplace.</p>
<p><strong>Verification level:</strong> Low. Companies self-register. There's a paid "Global Member" tier with light verification, but the majority of listings are unverified.</p>
<p><strong>Best categories:</strong> Everything. EC21 has the widest supplier selection by volume — cosmetics, food, machinery, textiles, electronics, and more.</p>
<p><strong>Weaknesses:</strong> Traders and re-exporters mixed in with manufacturers. Significant volume of inactive listings.</p>
<p><strong>Verdict:</strong> Use EC21 for initial discovery and volume of options. Always verify independently before trusting a profile.</p>

<h2>tradeKorea (KITA)</h2>
<p><strong>Operator:</strong> KITA (Korea International Trade Association) — another major Korean trade body.</p>
<p><strong>Verification level:</strong> Medium. KITA membership provides basic credibility. Supplier profiles tend to be more complete than EC21.</p>
<p><strong>Best categories:</strong> Similar to BuyKorea, with stronger presence in industrial and manufactured goods. Growing beauty and food sections.</p>
<p><strong>Weaknesses:</strong> Smaller listing volume than EC21. Less known outside Korea.</p>
<p><strong>Verdict:</strong> Use as a secondary check. Good for finding exporters that aren't on EC21.</p>

<h2>Comparison table</h2>
<table>
<thead><tr><th>Factor</th><th>EC21</th><th>BuyKorea</th><th>tradeKorea</th></tr></thead>
<tbody>
<tr><td>Operator</td><td>Private</td><td>Government (KOTRA)</td><td>Assoc. (KITA)</td></tr>
<tr><td>Listing volume</td><td>★★★★★</td><td>★★★</td><td>★★★</td></tr>
<tr><td>Verification level</td><td>★★</td><td>★★★★</td><td>★★★</td></tr>
<tr><td>UI / Usability</td><td>★★★</td><td>★★</td><td>★★★</td></tr>
<tr><td>Response rate</td><td>Variable</td><td>Generally good</td><td>Generally good</td></tr>
</tbody>
</table>

<h2>The practical approach: use all three</h2>
<p>Serious sourcing buyers don't pick one platform — they check all three and cross-reference results. A supplier appearing on all three with consistent information is a much stronger signal than one appearing only on EC21.</p>
<p>The problem: manually checking three platforms for every product category is time-consuming. GloSource AI searches all three simultaneously via Google Search grounding, ranks results, and cross-references certification signals — turning a 2-hour research process into under 2 minutes.</p>
    `.trim(),
  },
  {
    slug: 'korean-supplier-rfq-email-template',
    title: 'How to Write an RFQ Email to a Korean Manufacturer (With Template)',
    description: 'A practical guide to writing effective Request for Quotation (RFQ) emails to Korean manufacturers — with a copy-paste template, translation tips, and response-rate advice.',
    publishedAt: '2025-05-15',
    readingTimeMin: 4,
    category: 'Templates',
    content: `
<h2>Why your RFQ email matters</h2>
<p>Korean manufacturers receive hundreds of inquiry emails from international buyers each week. Vague, incomplete inquiries get deprioritized or ignored. A clear, structured RFQ signals that you're a serious buyer — and dramatically increases your response rate.</p>

<h2>The anatomy of a good RFQ</h2>
<p>A strong RFQ to a Korean manufacturer should include:</p>
<ol>
<li><strong>Buyer introduction</strong> — Who you are, where you're based, what you sell</li>
<li><strong>Product specification</strong> — As specific as possible</li>
<li><strong>Target quantity</strong> — Sample quantity and first order quantity</li>
<li><strong>Packaging requirements</strong> — OEM label, bulk, standard packaging</li>
<li><strong>Certifications required</strong> — MFDS, HACCP, KC, CE, FDA, etc.</li>
<li><strong>Pricing request</strong> — Ex-factory (FOB) unit price at your target MOQ</li>
<li><strong>Timeline</strong> — When you need samples, when you need first delivery</li>
<li><strong>Clear question at the end</strong> — "Can you manufacture this product?"</li>
</ol>

<h2>Copy-paste RFQ template</h2>
<pre>
Subject: RFQ — [Product Name] — [Your Company] — [Country]

Dear [Supplier Name] Team,

My name is [Your Name] from [Company Name], based in [Country].
We import [category] products and sell through [channel: e-commerce/retail/wholesale].

We are looking for a Korean manufacturer for the following product:

Product: [Specific product name]
Formulation/Spec: [Key specifications]
Packaging: [Container type, size, OEM label: Yes/No]
Certifications required: [e.g. MFDS, HACCP, KC, Vegan, HALAL]

Quantities:
- Sample: [Qty] units
- First order: [Qty] units
- Annual forecast: [Qty] units

Target price: USD [X.XX] per unit (ex-factory, FOB Busan/Incheon)
[Or: Please provide your best ex-factory price at the above quantities]

Timeline:
- Samples needed by: [Date]
- First order production: [Month/Year]

Questions:
1. Can you manufacture this product with the specifications above?
2. What is your standard lead time for samples and production?
3. Do you have [certification] certificates available?
4. What are your payment terms?

We look forward to your response.

Best regards,
[Your Name]
[Title], [Company]
[Email] | [Phone/WhatsApp]
[Website]
</pre>

<h2>Tips for higher response rates</h2>
<ul>
<li><strong>Send Monday–Wednesday Korean time (KST, UTC+9)</strong> — Korean business hours are 9am–6pm. Emails sent late Thursday or Friday often get delayed responses.</li>
<li><strong>Keep it under 300 words</strong> — Long emails with attachments get deferred. The template above is intentionally concise.</li>
<li><strong>WhatsApp or KakaoTalk ID</strong> — Including a messaging contact significantly increases response rates. Korean exporters often prefer quick messaging over email.</li>
<li><strong>Mention your country prominently</strong> — Manufacturers want to know export regulations and logistics upfront. Buyers from EU, US, Australia, Japan get faster responses due to familiar export docs.</li>
<li><strong>Follow up once after 5 business days</strong> — A single polite follow-up is appropriate and often effective.</li>
</ul>

<h2>Getting the RFQ pre-filled automatically</h2>
<p>GloSource AI generates a customized RFQ draft for each supplier candidate it returns — pre-filled with the supplier name, platform, detected certifications, and your product specification. It's ready to edit and send, rather than starting from a blank template.</p>
    `.trim(),
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
