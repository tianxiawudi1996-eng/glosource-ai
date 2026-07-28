/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * GloSource AI Shorts Automation Script Generator
 * Generates structured Meta-Prompts (Google AI Studio / Flow / Runway compatible),
 * second-by-second storyboards, narration scripts, and Remotion composition props.
 */

const fs = require('fs');
const path = require('path');
const { root, ensureDir, today, writeJsonReport } = require('./_utils');

// Default presets based on glosource-ai-shorts-plan.md & growth-automation-plan.md
const CATEGORY_PRESETS = {
  sunscreen: {
    category: 'K-Beauty / Skincare',
    query: 'Korean sunscreen OEM',
    persona: 'Amazon FBA Seller / Indie Beauty Brand Founder',
    painPoint: 'Comparing OEM sources, claims, MOQ, and risks across 10 tabs',
    solutionHighlight: 'OEM/ODM signals, MOQ context, certification mentions, official source links',
  },
  food: {
    category: 'K-Food / Snacks',
    query: 'Korean food manufacturer HACCP',
    persona: 'Food Importer / Distributor',
    painPoint: 'Verifying manufacturer vs middleman status and HACCP credentials',
    solutionHighlight: 'Public Korean government data signals, MFDS/HACCP status, risk signals',
  },
  electronics: {
    category: 'Korean Electronics / Accessories',
    query: 'Korean wireless charger manufacturer KC',
    persona: 'Hardware Importer / Electronics Retailer',
    painPoint: 'Checking KC compliance and export-ready manufacturer credentials',
    solutionHighlight: 'KC/ISO certification signals, supplier status, ready-to-edit RFQ draft',
  },
};

function generateStructuredMetaPrompt({ query, category, painPoint, solutionHighlight }) {
  return `[META-PROMPT FOR GOOGLE AI STUDIO / FLOW / RUNWAY]

PURPOSE:
Create a vertical 9:16 B2B SaaS promotional short video for GloSource AI demonstrating how international buyers find ${category} supplier candidates in seconds instead of searching across 10 browser tabs.

DESIGN SYSTEM & VISUAL CONSTRAINTS (REQUIRED):
- Aspect Ratio: Vertical 9:16 (Shorts/Reels/TikTok)
- Visual Style: Modern B2B SaaS, clean vector overlays, high-contrast dark theme, crisp UI typography, smooth transitions.
- Background Color: Deep Navy/Black (#0B0F19)
- Primary Accent Color: Electric Blue (#0052FF) & Cyan (#00F0FF)
- Text Color: Crisp White (#FFFFFF) & Soft Gray (#9CA3AF)
- Tone & Mood: Professional, trustworthy, fast-paced, factual. No 3D cartoonish avatars, no exaggerated claims.

SCENE-BY-SCENE SEQUENCE:

1. SCENE 1 (0-3s) - HOOK:
   - Visual: An international buyer overwhelmed by 10+ open browser tabs (EC21, BuyKorea, Google Search). Cursor moving frantically.
   - Text Overlay: "Finding Korean manufacturers shouldn't take 10 tabs."
   - Camera: Fast-paced cut zooming into the browser header.

2. SCENE 2 (3-7s) - PAIN POINT:
   - Visual: Product images for "${query}" with manual checklist overlays showing red X marks over "Verify Sources", "Check MOQ", "Risk Signals".
   - Text Overlay: "Comparing ${painPoint} manually is exhausting."
   - Camera: Split-screen transition showing spreadsheet chaos vs. unverified factory claims.

3. SCENE 3 (7-12s) - SOLUTION DEMO:
   - Visual: Transition into GloSource AI clean dark dashboard. Search bar highlights with typed query: "${query}".
   - Text Overlay: "One product brief ➔ Korean supplier shortlist"
   - Camera: Smooth zoom-in on the AI search bar as Enter is pressed.

4. SCENE 4 (12-20s) - EVIDENCE & FEATURES:
   - Visual: Clean supplier candidate cards appear with green badges: "Official Source Evidence", "Public Data Signals", "MOQ Context", "${solutionHighlight}".
   - Text Overlay: "Official Sources • Public Data • Risk Signals • MOQ Notes"
   - Camera: Highlighting cards sequentially with subtle glowing borders.

5. SCENE 5 (20-26s) - ACTIONABLE OUTPUT:
   - Visual: An English RFQ draft drawer slides up from bottom right with auto-filled text and a glowing "Copy RFQ" button.
   - Text Overlay: "Ready-to-edit English RFQ Draft 📝"
   - Camera: Close-up on the RFQ document completion.

6. SCENE 6 (26-32s) - OUTRO & CTA:
   - Visual: GloSource AI logo centered with glowing URL bar.
   - Text Overlay: "Find Korean supplier candidates faster. Try free at glosourceai.com/en"
   - Camera: Clean hold on final brand logo and URL.

NEGATIVE PROMPTS / STRICT COMPLIANCE:
- Do NOT use phrases: "100% verified suppliers", "government-approved factories", "guaranteed quality", "safe transaction".
- Use ONLY: "Korean supplier candidates", "official source evidence", "public data signals", "first-pass sourcing research".`;
}

function generateShortsPlan({ categoryKey = 'sunscreen', customQuery, customPersona } = {}) {
  const preset = CATEGORY_PRESETS[categoryKey] || CATEGORY_PRESETS.sunscreen;
  const query = customQuery || preset.query;
  const persona = customPersona || preset.persona;

  const title = `Stop searching Korean suppliers across 10 tabs - ${query}`;
  const videoAiPrompt = generateStructuredMetaPrompt({
    query,
    category: preset.category,
    painPoint: preset.painPoint,
    solutionHighlight: preset.solutionHighlight,
  });

  const script = {
    generatedAt: new Date().toISOString(),
    metadata: {
      categoryKey,
      query,
      persona,
      targetLengthSec: 32,
      aspectRatio: '9:16',
      serviceUrl: 'https://glosourceai.com/en',
    },
    storyboard: [
      {
        timestamp: '0-3s',
        visual: 'Multiple browser tabs opening frantically (EC21, BuyKorea, Google). Cursor roaming confusedly.',
        overlayText: "Finding Korean manufacturers shouldn't take 10 tabs.",
        narration: "Finding Korean manufacturers shouldn't take 10 tabs.",
        sfx: 'Fast typing, tab clicks, error beep',
      },
      {
        timestamp: '3-7s',
        visual: `Product images related to ${query} flashing quickly with manual checklist X marks.`,
        overlayText: `Comparing ${preset.painPoint} manually is overwhelming.`,
        narration: 'But buyers still have to compare sources, claims, MOQ, and risks manually.',
        sfx: 'Negative buzzer, page flip',
      },
      {
        timestamp: '7-12s',
        visual: `GloSource AI search UI zooming in smoothly. Cursor typing "${query}".`,
        overlayText: `One product brief ➔ Korean supplier shortlist`,
        narration: `GloSource AI turns one product brief into a Korean supplier candidate shortlist.`,
        sfx: 'Swoosh, clean mechanical keyboard typing',
      },
      {
        timestamp: '12-20s',
        visual: 'Supplier candidate cards highlighting official source links, risk signals, MOQ notes, and certification context.',
        overlayText: '✅ Official source links\n✅ Public data signals\n✅ Certification & MOQ context',
        narration: 'It checks official sources, public data, company signals, and certification context.',
        sfx: 'Positive notification chime (ding, ding)',
      },
      {
        timestamp: '20-26s',
        visual: 'English RFQ draft drawer sliding up with editable text and a Copy button flashing.',
        overlayText: 'Ready-to-edit English RFQ Draft 📝',
        narration: 'You get source links, risk notes, MOQ context, and an English RFQ draft.',
        sfx: 'Document ready swoosh',
      },
      {
        timestamp: '26-32s',
        visual: 'GloSource AI logo with URL in search bar.',
        overlayText: 'Find Korean supplier candidates faster.\nTry free: glosourceai.com/en',
        narration: 'Start your first Korean supplier search at glosourceai.com slash en.',
        sfx: 'Final click, music fade out',
      },
    ],
    videoAiPrompt,
    remotionProps: {
      title,
      query,
      ctaUrl: 'glosourceai.com/en',
      primaryColor: '#0052FF',
      theme: 'dark',
    },
  };

  return script;
}

function main() {
  const args = process.argv.slice(2);
  let categoryKey = 'sunscreen';

  for (const arg of args) {
    if (arg.startsWith('--category=')) {
      categoryKey = arg.split('=')[1];
    }
  }

  console.log(`[Shorts] Generating GloSource AI Shorts plan for category: ${categoryKey}`);
  const plan = generateShortsPlan({ categoryKey });

  // Save report
  const relPath = writeJsonReport(`shorts-${categoryKey}`, plan);
  console.log(`[Shorts] JSON report generated at: ${relPath}`);

  // Also save a markdown version in reports/growth
  const mdPath = path.join(root, 'reports', 'growth', `shorts-${categoryKey}-${today()}.md`);
  ensureDir(path.dirname(mdPath));

  const mdContent = `# GloSource AI Shorts Plan & Meta-Prompt: ${plan.metadata.query}

- **Category**: ${plan.metadata.categoryKey}
- **Persona**: ${plan.metadata.persona}
- **Target Duration**: ${plan.metadata.targetLengthSec}s (9:16 Vertical)
- **CTA URL**: ${plan.metadata.serviceUrl}

---

## 🎨 Google AI Studio / Flow / Runway Meta-Prompt

\`\`\`text
${plan.videoAiPrompt}
\`\`\`

---

## 🎬 Storyboard & Script

${plan.storyboard
  .map(
    (step) => `### [${step.timestamp}]
- **Visual**: ${step.visual}
- **On-Screen Text**: ${step.overlayText.replace(/\n/g, ' / ')}
- **Narration**: "${step.narration}"
- **SFX**: ${step.sfx}`
  )
  .join('\n\n')}
`;

  fs.writeFileSync(mdPath, mdContent);
  console.log(`[Shorts] Markdown report generated at: ${path.relative(root, mdPath)}`);
}

if (require.main === module) {
  main();
}

module.exports = { generateShortsPlan, generateStructuredMetaPrompt, CATEGORY_PRESETS };
