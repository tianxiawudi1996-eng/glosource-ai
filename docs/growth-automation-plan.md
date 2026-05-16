# GloSource AI — Growth Automation Plan
> Target: glosource-ai.vercel.app | Korean supplier sourcing for international B2B buyers
> Date: 2026-05-16

---

## Overview

Three channels, one content engine. All three phases reuse the same raw material: actual GloSource AI searches. The work is recording/transcribing what the tool already does, then distributing it across formats.

```
Phase 1 — Blog/SEO    (Weeks 1–2)  Zero cost, compounding return
Phase 2 — YouTube     (Weeks 3–6)  Free distribution, trust building
Phase 3 — Community   (Weeks 7+)   Intent-driven, no cold outreach
```

---

## Phase 1 — Blog (SEO)

### File Structure

Add to the existing Next.js 15 app under `app/en/blog/`:

```
app/
└── en/
    └── blog/
        ├── page.tsx                    ← /en/blog index
        ├── [slug]/
        │   └── page.tsx                ← /en/blog/[slug] individual posts
        └── _components/
            └── BlogCard.tsx            ← reusable post card

lib/
└── blog.ts                             ← data loader (JSON-based, no CMS)

data/
└── blog/
    ├── index.ts                        ← post metadata registry
    └── posts/
        ├── find-korean-cosmetics-manufacturers.ts
        ├── korean-supplier-verification-mfds-haccp-kc.ts
        ├── ec21-vs-buykorea-vs-tradekorea.ts
        ├── korean-beauty-oem-moq-lead-times.ts
        └── rfq-email-to-korean-manufacturer.ts
```

**No MDX, no CMS.** Each post is a TypeScript file exporting a typed object with title, meta, and content as a string (HTML or structured sections). This fits the existing codebase (Next.js 15, no external dependencies needed) and keeps posts indexable at build time.

---

### Post Data Shape

```typescript
// lib/blog.ts
export interface BlogPost {
  slug: string;
  title: string;
  metaDescription: string;
  publishedAt: string;          // ISO date string
  updatedAt?: string;
  readingTimeMin: number;
  category: 'sourcing' | 'certification' | 'platforms' | 'rfq' | 'logistics';
  tags: string[];
  heroImageAlt: string;
  sections: BlogSection[];
  cta: {
    text: string;
    href: string;
  };
  faq?: Array<{ q: string; a: string }>;  // FAQ schema injection
}

export interface BlogSection {
  heading?: string;
  body: string;                 // plain text or minimal HTML (no JSX)
  type?: 'prose' | 'list' | 'table' | 'callout';
  items?: string[];             // for type: 'list'
  rows?: string[][];            // for type: 'table'
}
```

---

### Route Implementation

**`app/en/blog/page.tsx`** — index page:
```typescript
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Korean Supplier Sourcing Blog — GloSource AI',
  description: 'Practical guides for international buyers sourcing from Korea. Covers K-beauty OEM, supplier verification, MFDS/HACCP certifications, and RFQ templates.',
  alternates: { canonical: 'https://glosource-ai.vercel.app/en/blog' },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <main>
      {/* header + post grid using existing /en page styling */}
    </main>
  );
}
```

**`app/en/blog/[slug]/page.tsx`** — individual post with schema.org `Article` JSON-LD:
```typescript
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.metaDescription,
    alternates: { canonical: `https://glosource-ai.vercel.app/en/blog/${post.slug}` },
  };
}
```

Use `generateStaticParams` so all 5 posts are statically generated at build time — zero runtime cost on Vercel.

---

### First 5 Posts — Full Specs

#### Post 1: Korean Cosmetics Manufacturers Private Label
**Slug:** `find-korean-cosmetics-manufacturers-private-label`
**Target keyword:** "how to find Korean cosmetics manufacturers for private label" (1,200 searches/mo, low competition)
**Word count:** 1,400–1,600 words
**Published:** 2026-05-20 (backdate slightly for freshness signal)

**Outline:**
1. Why Korea for private label cosmetics (MFDS context, K-beauty export data)
2. Four types of Korean cosmetics suppliers (brand owner, ODM, OEM, trader — with real differences)
3. Where to find them: EC21, BuyKorea, tradeKorea, direct factory search
4. What to check before contacting: MOQ, sample cost, lead time, MFDS documentation
5. What your first outreach email should say (link to Post 5)
6. How GloSource AI shortens this from days to 90 seconds
7. FAQ: minimum order, private label costs, branding options

**CTA:** "Search Korean cosmetics OEM suppliers now — 5 free searches"

---

```typescript
// data/blog/posts/find-korean-cosmetics-manufacturers.ts
export const post = {
  slug: 'find-korean-cosmetics-manufacturers-private-label',
  title: 'How to Find Korean Cosmetics Manufacturers for Private Label (2026 Guide)',
  metaDescription:
    'Step-by-step guide for international buyers: find Korean OEM/ODM cosmetics manufacturers via EC21, BuyKorea, and tradeKorea. Includes MFDS verification, MOQ expectations, and RFQ tips.',
  publishedAt: '2026-05-20',
  readingTimeMin: 7,
  category: 'sourcing',
  tags: ['K-beauty', 'OEM', 'private label', 'Korean cosmetics', 'MFDS'],
  heroImageAlt: 'Korean cosmetics lab — OEM manufacturing for private label brands',
  sections: [
    {
      heading: 'Why Korea for Private Label Cosmetics?',
      body: `Korea exported $8.5 billion in cosmetics in 2023, making it one of the world's top five cosmetics exporters. More relevant for private label buyers: Korea has a dense ecosystem of OEM and ODM manufacturers that have been supplying global brands for decades — from K-beauty giants to Amazon private label sellers who quietly source from Incheon and Suwon factories.\n\nThe two things that make Korean cosmetics different for private label:\n\n**MFDS registration infrastructure.** The Ministry of Food and Drug Safety (MFDS) maintains records for cosmetic formulations and manufacturers. Many Korean factories already hold the documentation international buyers need for FDA, EU Cosmetics Regulation, or ASEAN harmonization. You are not starting from zero.\n\n**ODM capability at realistic MOQs.** Unlike large Chinese OEM factories that often require 10,000-unit minimums, many Korean factories serve 500–3,000 unit orders because they built their business supplying Korean indie beauty brands first. If you are testing a new SKU, this matters.`,
      type: 'prose',
    },
    {
      heading: 'Four Types of Korean Cosmetics Suppliers',
      body: 'Before you start searching, know what you are looking for. Contacting the wrong type wastes time.',
      type: 'prose',
    },
    {
      heading: '',
      type: 'table',
      rows: [
        ['Type', 'What they do', 'Good for'],
        ['OEM manufacturer', 'Makes your formula to your spec', 'Custom formulation buyers'],
        ['ODM manufacturer', 'Offers ready-made formulas you brand', 'Fast to market, lower cost'],
        ['Brand owner', 'Sells their own brand, may do private label', 'White-label only'],
        ['Trader / agent', 'Middleman, not the factory', 'Usually avoid unless you need Korean-language support'],
      ],
      body: '',
    },
    {
      heading: 'Where to Find Korean Cosmetics Manufacturers',
      body: `**EC21.com** is the largest Korea-based B2B export marketplace. Search "cosmetics OEM" or "skincare ODM" and you will find hundreds of results — but quality varies. Look for suppliers with "OEM" or "ODM" explicitly in their product listings, not just traders.\n\n**BuyKorea (KOTRA)** is operated by the Korean government trade agency. Suppliers listed here have been through KOTRA's verification process. Smaller pool than EC21 but generally more established companies.\n\n**tradeKorea (KITA)** is run by the Korea International Trade Association. Stronger for manufacturing SMEs. Search "cosmetics manufacturer" or "skincare OEM" here as a second source.\n\n**Direct factory search** via Google: search "Korean skincare OEM manufacturer" + "MFDS" or "site:ec21.com cosmetics OEM." Factory websites often have English pages now.\n\nGloSource AI searches all four simultaneously and returns a scored shortlist in under 90 seconds — useful when you want to move fast.`,
      type: 'prose',
    },
    {
      heading: 'What to Check Before Contacting a Supplier',
      type: 'list',
      items: [
        'MOQ: Ask for minimum order quantity per SKU and whether it applies per formula or per batch.',
        'Sample cost: Most Korean OEM manufacturers charge for samples. Expect $50–300 per sample depending on complexity. This is normal.',
        'Lead time: Standard is 60–90 days for new formulas, 30–45 days for re-orders. Get this in writing.',
        'MFDS documentation: Ask if they can provide GMP certificates and product notification records. Legitimate manufacturers have these.',
        'English communication: Many Korean factories have English-speaking staff or agents. If they do not, consider whether that is a risk for your order.',
      ],
      body: '',
    },
    {
      heading: 'How to Use GloSource AI for This Search',
      body: `Type "Korean skincare serum OEM private label" into GloSource AI. The tool searches EC21, BuyKorea, tradeKorea, and direct factory sources simultaneously, scores each supplier 0–100 based on trust signals and certification evidence (MFDS, GMP references), and returns a shortlist with an RFQ draft pre-filled with supplier-specific details.\n\nThis does not replace your own due diligence. It cuts the manual research from 3–4 hours of tab-switching to under 5 minutes, leaving you more time to evaluate the actual suppliers.`,
      type: 'prose',
    },
    {
      heading: 'Next Steps',
      body: 'Once you have a shortlist, send an RFQ. See our guide: How to Write an RFQ Email to a Korean Manufacturer (with Template).',
      type: 'prose',
    },
  ],
  faq: [
    {
      q: 'What is the typical MOQ for Korean cosmetics OEM?',
      a: 'Most Korean OEM manufacturers start at 500–3,000 units per SKU for established formulas. Custom formulations usually require higher minimums (3,000–10,000 units). Always confirm directly with the supplier.',
    },
    {
      q: 'Do Korean cosmetics manufacturers speak English?',
      a: 'Many do, especially those with export experience listed on EC21 or BuyKorea. Some use agents or have dedicated export staff. Language is rarely a complete barrier, but response times can vary.',
    },
    {
      q: 'How long does Korean cosmetics OEM take?',
      a: 'New formula development and production: 60–120 days. Re-orders using the same formula: 30–45 days. Add shipping time (air: 5–7 days, sea: 20–40 days).',
    },
  ],
  cta: {
    text: 'Search Korean cosmetics OEM suppliers — 5 free searches',
    href: '/en#sourcing-tool',
  },
};
```

---

#### Post 2: Korean Supplier Verification (MFDS, HACCP, KC)
**Slug:** `korean-supplier-verification-mfds-haccp-kc-certification`
**Target keyword:** "Korean supplier verification" + "MFDS HACCP KC certification" (informational, low competition)
**Word count:** 1,600–1,800 words
**Published:** 2026-05-27

**Outline:**
1. Why certification verification matters specifically for Korea (export context)
2. MFDS — what it covers, how to check (actual MFDS portal URL), cosmetics vs food vs supplements
3. HACCP — food safety, which Korean products typically hold it, how to verify
4. KC — electronics/appliances only, what it does NOT cover (destination-market compliance)
5. KS — industrial standards, when it matters
6. Red flags: suppliers who claim certs but cannot produce documents
7. How GloSource AI surfaces certification signals (and its limitations — AI signals, not audited verification)

**CTA:** "Get supplier candidates with certification signals pre-flagged — 5 free searches"

```typescript
// data/blog/posts/korean-supplier-verification-mfds-haccp-kc.ts
export const post = {
  slug: 'korean-supplier-verification-mfds-haccp-kc-certification',
  title: 'Korean Supplier Verification: MFDS vs HACCP vs KC Certification Explained',
  metaDescription:
    'For international buyers: what MFDS, HACCP, KC, and KS certifications actually mean for Korean suppliers, how to verify them, and what they do not cover for your destination market.',
  publishedAt: '2026-05-27',
  readingTimeMin: 8,
  category: 'certification',
  tags: ['MFDS', 'HACCP', 'KC certification', 'Korean supplier verification', 'KS'],
  heroImageAlt: 'Korean manufacturer quality documentation — MFDS and HACCP certificates',
  sections: [
    {
      heading: 'Why Korean Certifications Are Different',
      body: `When you source from Korea, you are dealing with a country that has built export-oriented certification infrastructure over 30 years. Korean manufacturers in cosmetics, food, and electronics routinely hold formal certifications — not because importers asked, but because Korean domestic regulations required it and export customers came to expect it.\n\nThe practical implication for you as an international buyer: certification signals are more consistently present in Korean supplier documentation than in many other sourcing markets. But there are two things to understand before treating them as guarantees:\n\n1. Korean certifications confirm compliance with Korean standards. They do not automatically confirm compliance with your destination market's rules (FDA, EU regulations, UKCA, etc.).\n2. AI-based screening (including GloSource AI) surfaces certification signals from web content and supplier listings. This is a starting point for due diligence, not a substitute for requesting actual documentation.`,
      type: 'prose',
    },
    {
      heading: 'MFDS — Ministry of Food and Drug Safety',
      body: `MFDS is Korea's equivalent of the FDA. It covers cosmetics, food, health functional foods (supplements), pharmaceuticals, and medical devices.\n\n**What it means for cosmetics buyers:** Korean cosmetic manufacturers must notify MFDS for each product formulation before selling in Korea. For OEM buyers, this means your supplier likely has existing MFDS notifications for base formulas — which can be adapted for your product and referenced in documentation packages.\n\n**What it means for food buyers:** MFDS-registered Korean food manufacturers operate under Korean food safety standards. For US import, you will additionally need FDA Prior Notice and importer of record registration. MFDS compliance is a positive signal, not a replacement for US/EU import requirements.\n\n**How to verify:** Ask suppliers for their MFDS registration number. Legitimate manufacturers can provide this and you can cross-reference at the MFDS portal (nedrug.mfds.go.kr for drugs/cosmetics, foodsafetykorea.go.kr for food). If a supplier claims MFDS registration but cannot produce a number, that is a red flag.`,
      type: 'prose',
    },
    {
      heading: 'HACCP — Hazard Analysis Critical Control Points',
      body: `HACCP is an internationally recognized food safety management system. In Korea, HACCP certification for food manufacturers is managed by the Ministry of Food and Drug Safety and is mandatory for certain food categories (meat, dairy, eggs, fisheries, ready-to-eat foods).\n\nFor export buyers, HACCP is one of the strongest due diligence signals for Korean food suppliers because:\n- It requires an ongoing audit process, not a one-time certification\n- It is internationally recognized (Codex Alimentarius standard)\n- Korean food companies seeking export markets actively maintain it\n\n**How to verify:** Korean HACCP certificates have a registration number. Verify at haccp.or.kr (Korea HACCP Accreditation & Inspection Service). Ask for the certificate directly — legitimate suppliers provide it without hesitation.`,
      type: 'prose',
    },
    {
      heading: 'KC — Korea Certification (Electronics)',
      body: `KC certification is mandatory for electronics and electrical appliances sold in Korea. It covers safety testing — think of it as Korea's version of CE or UL listing.\n\n**What it covers:** Electrical safety, electromagnetic compatibility (EMC), radio frequency (for wireless products).\n\n**What it does NOT cover:** Your destination market requirements. A KC-certified product still needs CE for EU, FCC for US, UKCA for UK, and so on. Do not treat KC as a substitute for destination-market compliance.\n\n**Who it matters for:** Buyers importing Korean electronics, appliances, LED lighting, wearables, or electrical components. If your Korean supplier's product has KC certification, it confirms the product has been through Korean safety testing — useful context but not the end of your compliance work.`,
      type: 'prose',
    },
    {
      heading: 'KS — Korean Industrial Standard',
      body: `KS is the Korean equivalent of ISO for industrial and construction products. If you are sourcing Korean steel, construction materials, plastics, or industrial components, KS marking indicates the product meets Korean dimensional and quality standards.\n\nFor most K-beauty and K-food buyers, KS is not relevant. For industrial buyers sourcing Korean manufacturing inputs, it is a meaningful quality signal.`,
      type: 'prose',
    },
    {
      heading: 'Red Flags in Korean Supplier Certification Claims',
      type: 'list',
      items: [
        'Cannot provide registration number when asked — any legitimate MFDS/HACCP/KC holder has one.',
        'Certificate is expired — ask for issue and expiry dates.',
        'Certificate covers a different product category than what you are ordering.',
        'Supplier claims "equivalent to HACCP" rather than actual HACCP certification.',
        'Contact is via personal email/messaging app only, no company domain.',
      ],
      body: '',
    },
    {
      heading: 'How GloSource AI Surfaces Certification Signals',
      body: `GloSource AI scans supplier listings on EC21, BuyKorea, tradeKorea, and direct factory sources for references to MFDS, HACCP, KC, KS, ISO, and GMP. These appear as trust signals in the scored output for each supplier candidate.\n\nImportant caveat: these are AI-detected signals from web content, not verified against official registries. Use them to prioritize which suppliers to request documentation from — not as confirmation that a supplier holds a certification. The verification step is always yours.`,
      type: 'prose',
    },
  ],
  faq: [
    {
      q: 'Does MFDS certification mean the product is FDA-approved for the US?',
      a: 'No. MFDS confirms Korean regulatory compliance. For US import, cosmetics need to comply with FDA regulations (ingredient restrictions, labeling), and food products need FDA Prior Notice and importer registration. MFDS is a useful quality signal, not a US approval.',
    },
    {
      q: 'How do I verify a Korean supplier\'s HACCP certification?',
      a: 'Ask the supplier for their HACCP certificate number. You can cross-reference at haccp.or.kr (Korea HACCP Accreditation & Inspection Service). The certificate should show the manufacturer name, address, product scope, and validity dates.',
    },
    {
      q: 'Is KC certification required for electronics exported to Europe?',
      a: 'No. KC is for the Korean market. For EU, you need CE marking. For the UK, UKCA. For the US, FCC (for RF devices) or UL (for safety). Korean manufacturers experienced in export often hold multiple certifications — ask which ones they have.',
    },
  ],
  cta: {
    text: 'Find Korean suppliers with MFDS/HACCP signals pre-flagged — 5 free searches',
    href: '/en#sourcing-tool',
  },
};
```

---

#### Post 3: EC21 vs BuyKorea vs tradeKorea
**Slug:** `ec21-vs-buykorea-vs-tradekorea-comparison`
**Target keyword:** "EC21 vs BuyKorea" / "Korean B2B platform comparison" (very low competition, high buyer intent)
**Word count:** 1,200–1,400 words
**Published:** 2026-06-03

**Outline:**
1. The problem: most buyers open all three in tabs and get overwhelmed
2. Side-by-side comparison table (supplier count, verification, categories, UX for foreigners)
3. EC21: best for volume browsing, caveats with traders vs manufacturers
4. BuyKorea: government backing, more structured, smaller pool
5. tradeKorea: strongest for manufacturing SMEs
6. When to use all three vs just one
7. How GloSource AI collapses this into a single search

---

#### Post 4: Korean Beauty OEM MOQ and Lead Times
**Slug:** `korean-beauty-oem-minimum-order-quantities-lead-times`
**Target keyword:** "Korean beauty OEM minimum order quantity" (buying intent, low competition)
**Word count:** 1,000–1,200 words
**Published:** 2026-06-10

**Outline:**
1. Why MOQ varies so much in Korean cosmetics OEM (formula type, packaging, customization level)
2. Realistic MOQ ranges by product type (serum: 500–3,000, sheet mask: 1,000–5,000, etc.)
3. What drives lead times: new formula vs existing formula, packaging sourcing, labeling
4. How to negotiate: what Korean manufacturers will flex on vs what is fixed
5. Total timeline: from RFQ to delivery (sample → approval → production → shipping)

---

#### Post 5: How to Write an RFQ Email to a Korean Manufacturer
**Slug:** `rfq-email-korean-manufacturer-template`
**Target keyword:** "RFQ email Korean manufacturer" / "how to write RFQ Korea" (very low competition, high buyer intent)
**Word count:** 900–1,100 words
**Published:** 2026-06-17

**Outline:**
1. Why standard RFQ templates fail with Korean manufacturers (missing product-specific context)
2. The 7 fields every Korean manufacturer RFQ needs
3. Full email template (copy-paste ready, annotated)
4. What to expect in the response (timeline, typical follow-up)
5. Common mistakes: vague product specs, no MOQ context, no destination market info
6. How GloSource AI generates supplier-specific RFQs automatically

---

### SEO Implementation Notes

Each post page must include:
- `<article>` schema.org JSON-LD with `author`, `datePublished`, `dateModified`
- `FAQPage` JSON-LD if `faq` array present
- Canonical URL pointing to `/en/blog/[slug]`
- Internal link to `/en#sourcing-tool` as primary CTA
- Cross-links between posts (Post 1 links to Post 5, etc.)

Add `/en/blog` to `app/sitemap.ts` with all post slugs.

---

## Phase 2 — YouTube Automation

### Channel Concept

**Channel name:** GloSource AI (same as product)
**Upload target:** 2 shorts/week + 1 long-form/month (sustainable solo cadence)
**Core format:** Screen recording of actual GloSource AI tool + voiceover

### Short Clip Format (60–90 seconds)

**Title pattern:** "How to source [product] from Korea in 90 seconds with AI"

**Script Template:**
```
[0–5s]  Hook: "Most buyers spend 3 hours finding Korean suppliers. 
               Here is how to do it in 90 seconds."

[5–15s] Problem: "[Product type] from Korea — [specific buyer pain]. 
                  You have to check EC21, BuyKorea, tradeKorea separately."

[15–60s] Demo: Screen recording — type product into GloSource AI,
               watch results appear. Narrate what the tool is doing:
               - "It's checking EC21 right now"
               - "Here's the trust score — 78 out of 100"
               - "MFDS signal detected — that's what you want for cosmetics"
               - "Here's the RFQ draft — already filled with the supplier name"

[60–80s] CTA:  "Link in bio — 5 free searches. 
                No credit card, no signup, just search."
```

**Video 1:** Korean collagen serum OEM (targets K-beauty buyers)
**Video 2:** Korean HACCP food manufacturer (targets food importers)
**Video 3:** EC21 vs BuyKorea explained (targets skeptical buyers)
**Video 4:** RFQ email generated in 60 seconds (product feature demo)
**Video 5:** Korean electronics KC certification check (targets electronics buyers)

**Claude API automation for shorts scripts:**
- Input: product category + buyer persona
- Output: 90-second script following above template
- Can batch-generate 10 scripts in one API call
- Prompt template stored in `lib/youtube/scriptGenerator.ts`

### Long-Form Format (5–8 minutes)

**Title pattern:** "Complete guide: Importing [category] from Korea (sourcing step by step)"

**Script Template:**
```
[0–30s]    Hook + channel credibility statement
[30s–1m]  Why Korea for [category] (data, K-wave context)
[1–2m]    Where buyers go wrong (3 common mistakes)
[2–4m]    Full demo: GloSource AI search, explain each result
[4–5m]    Certification breakdown for this category
[5–6m]    RFQ walkthrough — actual email they can copy
[6–7m]    What happens after you send the RFQ
[7–8m]    Summary + CTA (free searches link)
```

**Long-form #1:** "Complete guide: Importing K-beauty from Korea"
**Long-form #2:** "Korean food manufacturer sourcing (HACCP verified suppliers)"
**Long-form #3:** "EC21 vs BuyKorea vs tradeKorea — which platform actually works?"

### Production Workflow

**Tools:**
- OBS Studio (free) — screen recording
- Descript or Riverside.fm — voiceover recording + auto-captions
- CapCut (free) — shorts editing (captions, zoom, B-roll cuts)

**Workflow per short (target: 45 min total production):**
1. Generate script with Claude API (5 min)
2. Record screen in GloSource AI tool (10 min)
3. Record voiceover over screen (10 min)
4. Edit in CapCut: captions + 2–3 zoom cuts (15 min)
5. Upload with title/description/tags (5 min)

**Workflow per long-form (target: 3 hours total):**
1. Generate full script with Claude API (15 min)
2. Record full screen demo (30 min)
3. Record voiceover (30 min)
4. Edit: cuts, B-roll, lower thirds, end screen (90 min)
5. Upload (15 min)

### YouTube SEO Tags (per video)

```
korean supplier sourcing, korean manufacturers, k-beauty oem, 
buykorea, ec21, tradekorea, korean b2b, sourcing from korea,
korean cosmetics oem, korean food manufacturer, mfds certification,
haccp korea, korean supplier verification, rfq template, 
glosource ai, ai sourcing, korean supplier ai
```

### Claude API Script Generator

```typescript
// lib/youtube/scriptGenerator.ts
import Anthropic from '@anthropic-ai/sdk';

interface ScriptInput {
  productCategory: string;
  buyerPersona: 'kbeauty' | 'food' | 'fashion' | 'electronics' | 'industrial';
  format: 'short' | 'longform';
  targetKeyword: string;
}

interface ScriptOutput {
  title: string;
  description: string;
  tags: string[];
  script: string;
  chapterTimestamps?: string[];  // long-form only
}

export async function generateVideoScript(input: ScriptInput): Promise<ScriptOutput> {
  const client = new Anthropic();
  
  const systemPrompt = format === 'short'
    ? SHORT_SCRIPT_SYSTEM_PROMPT
    : LONGFORM_SCRIPT_SYSTEM_PROMPT;
  
  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `Product: ${input.productCategory}\nBuyer: ${input.buyerPersona}\nKeyword: ${input.targetKeyword}`,
    }],
  });
  
  // Parse structured JSON response
  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  return JSON.parse(content.text) as ScriptOutput;
}

const SHORT_SCRIPT_SYSTEM_PROMPT = `You generate 90-second YouTube Shorts scripts for GloSource AI, 
a Korean supplier sourcing tool. Output valid JSON matching ScriptOutput interface.
The script must: start with a concrete hook, demo the actual tool, end with CTA to free searches.
Never make false claims. Do not guarantee supplier quality. 
Tone: knowledgeable, direct, no hype.`;
```

---

## Phase 3 — Community

### Reddit Strategy

**Target subreddits:**
- r/dropshipping (335K members) — buyers asking about Korea sourcing
- r/smallbusiness (900K members) — private label questions
- r/ecommerce (200K members) — international sourcing discussions
- r/kbeauty (630K members) — ingredient/supplier questions from formulators
- r/importing (14K members) — direct target audience

**Rules:**
- Never post promotional links unprompted
- Answer the actual question first, completely
- Only mention GloSource AI if directly relevant and disclosed
- No copy-paste responses — each reply is original

**Post monitoring method:**
Search daily for new posts containing:
```
"Korean supplier" OR "source from Korea" OR "Korean manufacturer" OR 
"Korean cosmetics OEM" OR "BuyKorea" OR "EC21" OR "Korean factory"
```

Use saved Reddit search URLs or track via RSS (Reddit supports RSS for searches).

**Response template structure:**
```
1. Direct answer to their question (3–5 sentences)
2. Specific context they might have missed (1–2 sentences)
3. [Optional, only if asked or very relevant]: "I built a tool for this — glosource-ai.vercel.app — 5 free searches. Not spam, just relevant here."
```

**Volume target:** 5 genuine answers/week. Quality over quantity.

### LinkedIn Strategy

**Weekly post format:** "Korean Supplier Tip #[N]"
**Day:** Tuesday 9am (highest B2B engagement)
**Length:** 150–300 words, no hashtag stuffing (max 3)

**Monthly content calendar:**
```
Week 1: Certification tip (MFDS/HACCP/KC practical insight)
Week 2: Platform comparison (EC21 vs BuyKorea — one specific insight)
Week 3: RFQ tip (one specific thing most buyers miss)
Week 4: Data/market insight (Korean export stats, K-wave data)
```

**Automation:** Draft posts with Claude API weekly, human review before posting. Do not auto-post without review.

**Target connections:** Sourcing agents, Amazon private label sellers, cosmetics formulators, food importers. Search LinkedIn for "Korean supplier" and connect with people who post about it.

### ProductHunt Launch

**When:** After reaching 50 registered users (credibility threshold)
**Timing:** Tuesday or Wednesday, 12:01am PST (PT timezone, first-post advantage)

**Launch checklist:**
- [ ] Pre-ship to 20+ users, collect 3 written testimonials
- [ ] Prepare all 5 screenshots (search interface, results page, RFQ output, cert signals, pricing)
- [ ] Write tagline: "Source Korean suppliers with AI — 5 free searches"
- [ ] Write description: problem → solution → differentiation → CTA
- [ ] Line up 10+ supporters to upvote on launch day (existing users, LinkedIn contacts)
- [ ] Respond to every comment within 2 hours on launch day

**Hunter:** Post yourself (founder-hunted performs comparably to being hunted)

---

## Automation vs Manual Summary

| Task | Automation | Manual |
|------|-----------|--------|
| Blog post first draft | Claude API (batch generate outlines + draft) | Review, fact-check, publish |
| YouTube short scripts | Claude API (scriptGenerator.ts) | Review, record, edit |
| YouTube long-form scripts | Claude API (base draft) | Significant editing, recording |
| Reddit monitoring | RSS feed / saved searches | Reading, writing each reply |
| LinkedIn posts | Claude API (weekly draft) | Review, approve, post |
| ProductHunt launch | N/A | Fully manual |
| Blog SEO metadata | Automated from post data structure | First-time schema setup |
| Sitemap updates | `generateStaticParams` auto-builds | Initial sitemap.ts setup |

---

## Weekly Execution Schedule

```
Monday
  09:00  Check Reddit saved searches — answer 1–2 questions
  10:00  Generate 2 YouTube short scripts via Claude API

Tuesday
  09:00  Post LinkedIn tip (pre-drafted previous week)
  14:00  Record + edit 1 YouTube short

Wednesday
  10:00  Check Reddit saved searches — answer 1–2 questions

Thursday
  14:00  Record + edit 1 YouTube short
  16:00  Upload both shorts with tags/descriptions

Friday
  10:00  Write or review 1 blog post section
  14:00  Generate next week's LinkedIn post draft
```

**Monthly:**
- Publish 1 long-form YouTube video
- Publish 1 blog post
- Review which blog posts are ranking (Google Search Console)
- Review YouTube analytics — double down on highest-retention format

---

## Metrics to Track

| Channel | Metric | Target (Month 3) |
|---------|--------|-----------------|
| Blog | Organic clicks (GSC) | 200/month |
| Blog | Keyword rankings (top 10) | 3 of 5 target keywords |
| YouTube Shorts | Views per short | 500+ average |
| YouTube | Subscribers | 100 |
| Reddit | Profile karma from sourcing answers | 500+ |
| All channels | Signups attributed | 20/month |

---

## Implementation Order (Exact)

1. Create `lib/blog.ts` + `data/blog/index.ts`
2. Create `app/en/blog/page.tsx` (index)
3. Create `app/en/blog/[slug]/page.tsx` (post template)
4. Add `data/blog/posts/` directory with Post 1 data file
5. Update `app/sitemap.ts` to include blog posts
6. Publish Post 1 — verify at `/en/blog/find-korean-cosmetics-manufacturers-private-label`
7. Submit to Google Search Console — `https://glosource-ai.vercel.app/en/blog`
8. Create Post 2–5 data files (can be done in one session)
9. Set up OBS, record first YouTube short using GloSource AI
10. Start Reddit monitoring (save search URLs)

**Do not start Phase 2 until Phase 1 has 3 posts live.** Blog posts give YouTube videos something to link to and vice versa.
