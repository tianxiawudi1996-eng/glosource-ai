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
  {
    slug: 'how-to-verify-korean-supplier-certifications',
    title: 'MFDS, HACCP, KC, KS: How to Verify Korean Supplier Certifications',
    description: 'A practical guide to the four main Korean supplier certifications — MFDS, HACCP, KC, and KS — including what they mean, how to verify them, and which products require them.',
    publishedAt: '2026-05-16',
    readingTimeMin: 6,
    category: 'Compliance',
    content: `
<h2>Why Korean certifications matter for importers</h2>
<p>When sourcing from Korea, certifications are one of the most important supplier screening signals you have. Korean manufacturers serving the export market hold a range of certifications that tell you about product safety, manufacturing standards, and regulatory compliance.</p>
<p>But there is an important distinction: a Korean certification is a signal, not a guarantee of compliance in your market. You always need to verify destination-country requirements separately. This guide explains the four most common Korean certifications and how to check them.</p>

<h2>MFDS (Ministry of Food and Drug Safety)</h2>
<p><strong>What it is:</strong> MFDS is Korea's regulatory body for food, cosmetics, pharmaceuticals, and medical devices — roughly equivalent to the US FDA or the EU's EMA/EFSA combined.</p>
<p><strong>What it covers:</strong> Cosmetics and skincare, food and dietary supplements, pharmaceuticals, medical devices, and health functional foods.</p>
<p><strong>What to look for:</strong></p>
<ul>
<li>MFDS-registered cosmetics manufacturer (화장품 제조업 등록): The manufacturer is registered with MFDS to produce cosmetics. This is a base-level requirement for any serious Korean cosmetics exporter.</li>
<li>MFDS-approved health functional food: For supplements, MFDS approval is a stronger signal than just manufacturing registration.</li>
<li>GMP (Good Manufacturing Practice) certification from MFDS: Shows the facility has passed a manufacturing standards audit.</li>
</ul>
<p><strong>How to verify:</strong> Ask the supplier for their MFDS registration number. You can search the MFDS OPEN data portal (<a href="https://www.mfds.go.kr" target="_blank" rel="noopener noreferrer">mfds.go.kr</a>) by company name or registration number.</p>
<p><strong>Relevant for:</strong> K-beauty buyers (essential), K-food supplement buyers (important), medical device buyers (essential).</p>

<h2>HACCP (Hazard Analysis and Critical Control Points)</h2>
<p><strong>What it is:</strong> HACCP is an internationally recognized food safety management system. In Korea, HACCP certification is issued by the Ministry of Food and Drug Safety and is mandatory for certain food categories.</p>
<p><strong>What it covers:</strong> Processed food manufacturers, meat and poultry, instant noodles, sauces and condiments, beverages, packaged snacks.</p>
<p><strong>What to look for:</strong></p>
<ul>
<li>HACCP-certified facility: The plant's production line is HACCP certified. This is the main signal for food safety due diligence.</li>
<li>HACCP-certified product: Some products have individual product-level HACCP certification in addition to facility certification.</li>
</ul>
<p><strong>How to verify:</strong> Ask the supplier for their HACCP certificate with issue date. The Korea Food Safety Information Service (<a href="https://www.foodsafetykorea.go.kr" target="_blank" rel="noopener noreferrer">foodsafetykorea.go.kr</a>) maintains a public database of HACCP-certified companies.</p>
<p><strong>Important note:</strong> HACCP does not guarantee compliance with your country's food import rules. EU, US, and Australian food importers must separately ensure the product meets destination-market labeling, ingredient, and additive regulations.</p>
<p><strong>Relevant for:</strong> All K-food buyers — instant noodles, snacks, sauces, condiments, beverages, and health foods.</p>

<h2>KC (Korea Certification)</h2>
<p><strong>What it is:</strong> KC is Korea's mandatory safety mark for consumer electronics, electrical appliances, and related products sold in Korea. It is managed by the National Radio Research Agency (RRA) and the Korean Agency for Technology and Standards (KATS).</p>
<p><strong>What it covers:</strong> Consumer electronics, power adapters and chargers, LED lighting, kitchen appliances, cables, wearables, and children's toys (KC-certified under a separate children's product safety standard).</p>
<p><strong>What to look for:</strong></p>
<ul>
<li>KC mark on the product or packaging: The "KC" mark (a stylized circle with KC inside) indicates compliance with Korean safety standards.</li>
<li>KC certificate number: Each product gets a specific certificate number from RRA or KATS. Ask for the full certificate document.</li>
</ul>
<p><strong>How to verify:</strong> Search the RRA's e-Label / KC certificate database at <a href="https://rra.go.kr" target="_blank" rel="noopener noreferrer">rra.go.kr</a> using the manufacturer name or certificate number.</p>
<p><strong>Critical limitation:</strong> KC certification is for the Korean domestic market only. For export, buyers need CE (EU), FCC (US), UKCA (UK), RCM (Australia), or other market-specific certifications. Always ask "Do you hold CE / FCC / [your market] certification for this product?" separately.</p>
<p><strong>Relevant for:</strong> Electronics, components, lighting, appliances, wearables.</p>

<h2>KS (Korean Industrial Standard)</h2>
<p><strong>What it is:</strong> KS is the Korean national standard for industrial products, construction materials, and manufactured goods. It is managed by KATS (Korean Agency for Technology and Standards) and is equivalent to ISO for industrial categories.</p>
<p><strong>What it covers:</strong> Steel and metal products, construction materials, plastics, rubber, chemical products, industrial machinery, and building components.</p>
<p><strong>What to look for:</strong></p>
<ul>
<li>KS certification mark: The "KS" mark on the product means it meets the relevant Korean industrial standard for that product category.</li>
<li>Specific KS standard number: For example, KS D 3503 is the standard for structural carbon steel. Ask which specific KS standard applies to the product.</li>
</ul>
<p><strong>How to verify:</strong> KATS maintains a public database of KS-certified companies and products. Ask the supplier for their KS certificate and confirm the certification is current (not expired).</p>
<p><strong>Relevant for:</strong> Industrial parts buyers, construction material importers, B2B buyers of materials and components.</p>

<h2>Comparing the four certifications</h2>
<table>
<thead><tr><th>Certification</th><th>Sector</th><th>Verification database</th><th>Export equivalent</th></tr></thead>
<tbody>
<tr><td>MFDS</td><td>Cosmetics, food, pharma, medical</td><td>mfds.go.kr</td><td>FDA (US) / EU EFSA/EMA</td></tr>
<tr><td>HACCP</td><td>Food processing</td><td>foodsafetykorea.go.kr</td><td>Codex HACCP (international)</td></tr>
<tr><td>KC</td><td>Electronics, appliances</td><td>rra.go.kr</td><td>CE / FCC / UKCA (market-specific)</td></tr>
<tr><td>KS</td><td>Industrial, construction</td><td>KATS portal</td><td>ISO / ASTM / EN (market-specific)</td></tr>
</tbody>
</table>

<h2>How GloSource AI surfaces certification signals</h2>
<p>When you run a sourcing search, GloSource AI flags AI-detected certification signals in each supplier result — for example, "MFDS registered" or "HACCP certified." These are AI-detected signals based on Google Search data and supplier platform profiles, not independently verified certificates.</p>
<p>Use these signals as a starting filter — to shortlist suppliers who are likely to have the relevant certifications — then request the actual certificate documents from the supplier before making any sourcing decision.</p>
    `.trim(),
  },
  {
    slug: 'korean-food-manufacturer-guide-haccp-moq-export',
    title: 'How to Find Korean Food Manufacturers for Import (HACCP, MOQ, Export Guide)',
    description: 'A step-by-step guide for international food importers looking for Korean food manufacturers — covering HACCP certification, MOQ ranges, payment terms, and how to evaluate suppliers.',
    publishedAt: '2026-05-19',
    readingTimeMin: 7,
    category: 'Sourcing Guide',
    content: `
<h2>Korea's food export market: what importers need to know</h2>
<p>Korea exported $9.6 billion in food products in 2023, making it one of Asia's top food exporters. K-food — including instant noodles, snacks, sauces, beverages, and health foods — has seen sustained global demand growth driven by Korean pop culture.</p>
<p>Unlike Chinese food sourcing, Korean food manufacturing has distinct characteristics: high HACCP compliance rates, strong OEM capability, and manufacturers accustomed to export documentation requirements for the US, EU, and Southeast Asian markets.</p>

<h2>Main food categories to source from Korea</h2>
<ul>
<li><strong>Instant noodles and ramen:</strong> Korea is the world's 8th largest instant noodle market per capita, with manufacturers ranging from OEM-friendly mid-size plants to large exporters serving 50+ countries.</li>
<li><strong>Snacks and crackers:</strong> Korean seaweed snacks, rice crackers, and sweet potato snacks are among the fastest-growing imported snack categories in the US and EU.</li>
<li><strong>Sauces and condiments:</strong> Gochujang (red pepper paste), doenjang (soybean paste), and soy sauce variants are seeing mainstream grocery placement outside Korea for the first time.</li>
<li><strong>Health functional foods:</strong> Korean red ginseng, collagen drinks, and fermented food supplements (kimchi extract, probiotics) have strong market positioning in Japan, Southeast Asia, and the West.</li>
<li><strong>Beverages:</strong> Makgeolli (Korean rice wine), traditional teas, and functional drinks (honeycomb water, yuzu beverages) for specialty retail and restaurant channels.</li>
<li><strong>Confectionery:</strong> Chocolate-coated snacks, traditional Korean sweets (tteok-based), and premium candies for gift retail and Asian grocery chains.</li>
</ul>

<h2>Understanding HACCP for Korean food sourcing</h2>
<p>HACCP (Hazard Analysis and Critical Control Points) certification is the most important safety signal to look for in a Korean food manufacturer. In Korea, HACCP is managed by the Ministry of Food and Drug Safety (MFDS) and is mandatory for certain food categories including meat products, milk, and some processed foods.</p>
<p>For export-focused manufacturers, HACCP certification is a strong signal that the facility follows documented food safety procedures, has passed a third-party audit, and maintains traceability records. Most serious Korean food exporters will have this.</p>
<p><strong>What to ask:</strong></p>
<ol>
<li>Do you have HACCP certification for this production line?</li>
<li>Can you provide a copy of your HACCP certificate (with issue date and validity)?</li>
<li>Which specific products and production lines are HACCP-certified?</li>
</ol>

<h2>Typical MOQ ranges for Korean food products</h2>
<table>
<thead><tr><th>Category</th><th>MOQ range</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>Instant noodles / ramen</td><td>2,000–10,000 cases</td><td>High volume needed for competitive pricing</td></tr>
<tr><td>Seaweed snacks</td><td>500–3,000 cases</td><td>Lower MOQ common; OEM labels from 1,000 pcs</td></tr>
<tr><td>Sauces (gochujang, doenjang)</td><td>500–5,000 units</td><td>Varies by container size</td></tr>
<tr><td>Red ginseng products</td><td>200–2,000 boxes</td><td>Premium priced; lower MOQ acceptable</td></tr>
<tr><td>Beverages (makgeolli)</td><td>1,000–5,000 bottles</td><td>Alcohol export license required</td></tr>
<tr><td>Confectionery / candy</td><td>500–5,000 boxes</td><td>OEM label from 3,000 units typically</td></tr>
</tbody>
</table>

<h2>Regulatory requirements by destination market</h2>
<p>Korean HACCP certification helps with supplier screening but does not substitute for destination-market compliance. Here are the key requirements by region:</p>
<h3>United States (FDA)</h3>
<ul>
<li>FSVP (Foreign Supplier Verification Program): US importers must verify foreign suppliers comply with FSMA rules</li>
<li>Facility registration with FDA (required for food exporters)</li>
<li>Labeling: English-language Nutrition Facts panel, allergen declarations per FDA rules</li>
<li>No prohibited additives or colorings (check specific product regulations)</li>
</ul>
<h3>European Union</h3>
<ul>
<li>EU food safety regulations differ from Korean standards — ingredient restrictions (certain additives permitted in Korea are not in EU)</li>
<li>Labeling must include EU-compliant nutrition table, allergen declarations in 14-allergen format</li>
<li>Some Korean fermented products may require specific import approvals</li>
</ul>
<h3>Australia / New Zealand (FSANZ)</h3>
<ul>
<li>Biosecurity Import Conditions (BICON) for certain food types</li>
<li>FSANZ labeling requirements including prescribed format nutrition panel</li>
</ul>

<h2>Payment terms: what's standard</h2>
<p>Korean food manufacturers typically expect:</p>
<ul>
<li><strong>First order:</strong> 30–50% deposit, balance before shipment (T/T in advance)</li>
<li><strong>Established relationship:</strong> 30% deposit, 70% against B/L (bill of lading copy)</li>
<li><strong>Large volume buyers:</strong> L/C (letter of credit) at sight accepted by most exporters</li>
</ul>
<p>Avoid requesting pure OA (open account) terms with a first-time Korean supplier — it is not standard practice and will likely disqualify you as a buyer.</p>

<h2>What to include in your RFQ</h2>
<ol>
<li><strong>Exact product spec:</strong> Product name, formulation or recipe requirements (e.g., vegan, no MSG, halal)</li>
<li><strong>Destination market:</strong> Country and relevant regulatory requirements (FDA, EU, etc.)</li>
<li><strong>Target quantity:</strong> Sample order and first production order</li>
<li><strong>OEM or private label:</strong> Will you use your own brand label on the product?</li>
<li><strong>Certifications required:</strong> HACCP, Halal, Vegan, Organic, etc.</li>
<li><strong>Packaging:</strong> Retail packaging dimensions, language requirements for label</li>
<li><strong>Lead time:</strong> When do you need first shipment?</li>
</ol>

<h2>Finding Korean food manufacturers</h2>
<p>The main channels for finding Korean food manufacturers are:</p>
<ul>
<li><strong>BuyKorea (KOTRA):</strong> Government-backed directory of Korean exporters with basic company verification. Good starting point for credible food manufacturers.</li>
<li><strong>tradeKorea (KITA):</strong> KITA's export directory, strong in processed food and health food categories.</li>
<li><strong>EC21:</strong> Wider selection including smaller manufacturers; verification level is lower, so cross-reference with other sources.</li>
</ul>
<p>GloSource AI searches all three channels simultaneously and returns a shortlist of Korean food manufacturer candidates with HACCP and MFDS signals, estimated MOQ, and a ready-to-use English RFQ — cutting hours of manual research to under 2 minutes.</p>
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
