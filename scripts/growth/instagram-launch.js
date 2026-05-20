/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * GloSource AI — Instagram 자동 포스팅
 * Pipeline: Gemini Imagen 4 → ImgBB (이미지 호스팅) → Buffer → Instagram
 *
 * Required env vars:
 *   BUFFER_API_KEY, BUFFER_CHANNEL_INSTAGRAM
 *   GEMINI_API_KEY
 *   IMGBB_API_KEY  ← imgbb.com 무료 계정에서 발급
 */
const fs   = require('fs');
const path = require('path');
const https = require('https');

const envPath = path.join(__dirname, '../../.env.local');
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const m = line.match(/^\s*([^#][^=]+)=(.+)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
});

const BUFFER_API_KEY   = process.env.BUFFER_API_KEY;
const INSTAGRAM_ID     = process.env.BUFFER_CHANNEL_INSTAGRAM;
const GEMINI_API_KEY   = process.env.GEMINI_API_KEY;
const IMGBB_API_KEY    = process.env.IMGBB_API_KEY;
const DRY_RUN          = process.argv.includes('--dry-run');

// ── Post content (text + image prompt pairs) ──────────────────────────────
const POSTS = [
  {
    caption: `🇰🇷 Source Korean suppliers in 90 seconds

GloSource AI searches EC21 · BuyKorea (KOTRA) · tradeKorea simultaneously — AI trust scores, cert signals (MFDS, HACCP, KC), and a ready-to-send English RFQ.

5 free searches → glosource-ai.vercel.app/en

#KBeauty #Sourcing #B2B #AmazonFBA #KoreanSuppliers #ImportExport`,
    imagePrompt: `Professional Instagram square image for a Korean B2B sourcing AI platform called GloSource AI. Dark navy background (#0D1B2A), orange accent color (#EA580C). Show floating product cards with Korean supplier names, trust score badges (0-100), certification badges (MFDS, HACCP, KC), and a glowing search bar. Minimalist tech startup aesthetic. No text overlay needed. High-end commercial photography style. 1:1 square ratio.`,
  },
  {
    caption: `Stop spending hours on Korean supplier research 🔍

✅ EC21 · BuyKorea · tradeKorea searched at once
✅ AI trust score 0–100 per supplier
✅ MFDS / HACCP / KC cert detection
✅ English RFQ auto-generated in 90 seconds

Free: glosource-ai.vercel.app/en

#Sourcing #KBeauty #FBA #B2BSourcing #Korea #Wholesale`,
    imagePrompt: `Clean infographic-style Instagram image for a Korean supplier sourcing tool. Dark background with orange and white UI elements. Show a workflow: Korean flag → AI processing animation → English RFQ document with checkmarks. Modern flat design with subtle grid lines. Include certification badge icons (MFDS, HACCP, KC) floating around. Tech startup feel. 1:1 square composition. No text overlay.`,
  },
  {
    caption: `Korean manufacturer research in 90 seconds 🏭🇰🇷

GloSource AI ranks Korean suppliers by real trust signals — not just listing position — and writes your outreach email automatically.

Link in bio for 5 free searches.

#KoreanManufacturers #OEM #KBeauty #ImportBusiness #Sourcing #B2B #SmallBusiness`,
    imagePrompt: `Stylized photo-realistic Instagram square image: Korean factory building exterior with modern design, Korean flag subtly visible, overlaid with holographic data visualizations showing supplier trust scores and certification badges. Dark tech aesthetic with orange glow effects. High-end commercial photography blended with UI elements. Professional sourcing platform branding feel. 1:1 ratio.`,
  },
];

// ── Utilities ──────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function httpsPost(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: 'POST', headers: { 'Content-Type': 'application/json', ...headers } },
      res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { resolve(data); }
        });
      }
    );
    req.on('error', reject);
    req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

function httpsPostForm(url, formData) {
  return new Promise((resolve, reject) => {
    const boundary = '----FormBoundary' + Date.now();
    let body = '';
    for (const [key, value] of Object.entries(formData)) {
      body += `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`;
    }
    body += `--${boundary}--\r\n`;

    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { resolve(data); }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Step 1: Gemini Imagen 4 이미지 생성 ───────────────────────────────────
async function generateImage(prompt) {
  console.log('  🎨 Generating image with Gemini Imagen 4...');
  const result = await httpsPost(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${GEMINI_API_KEY}`,
    {
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: '1:1' },
    }
  );

  if (result.error) throw new Error(`Imagen error: ${result.error.message}`);

  const b64 = result.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error('No image returned from Imagen');

  console.log(`  ✓ Image generated (${(b64.length * 0.75 / 1024).toFixed(0)} KB)`);
  return b64;
}

// ── Step 2: ImgBB에 업로드 → 공개 URL 획득 ────────────────────────────────
async function uploadToImgBB(base64Image) {
  if (!IMGBB_API_KEY) throw new Error('IMGBB_API_KEY not set in .env.local — get free key at imgbb.com/api');

  console.log('  ☁️  Uploading to ImgBB...');
  const result = await httpsPostForm(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    { image: base64Image }
  );

  if (!result.success) throw new Error(`ImgBB upload failed: ${JSON.stringify(result)}`);

  const url = result.data?.url;
  console.log(`  ✓ Image hosted at: ${url}`);
  return url;
}

// ── Step 3: Buffer → Instagram 포스팅 ────────────────────────────────────
async function postInstagram(caption, imageUrl) {
  const mutation = `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post { id status }
        }
        ... on MutationError {
          message
        }
      }
    }
  `;
  const result = await httpsPost(
    'https://api.buffer.com',
    {
      query: mutation,
      variables: {
        input: {
          channelId: INSTAGRAM_ID,
          text: caption,
          mediaUrls: [imageUrl],
          schedulingType: 'automatic',
          mode: 'shareNow',
        },
      },
    },
    { Authorization: `Bearer ${BUFFER_API_KEY}` }
  );

  if (result.errors) throw new Error(JSON.stringify(result.errors));
  return result.data?.createPost;
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  if (!BUFFER_API_KEY || !INSTAGRAM_ID) {
    console.error('❌ BUFFER_API_KEY or BUFFER_CHANNEL_INSTAGRAM missing');
    process.exit(1);
  }
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY missing');
    process.exit(1);
  }

  console.log(DRY_RUN
    ? `\n--- DRY RUN — ${POSTS.length} Instagram posts (image generation skipped) ---\n`
    : `\n--- LIVE — ${POSTS.length} Instagram posts via Imagen 4 + ImgBB + Buffer ---\n`
  );

  for (let i = 0; i < POSTS.length; i++) {
    const post = POSTS[i];
    console.log(`\n[${i + 1}/${POSTS.length}] Processing...`);

    if (DRY_RUN) {
      console.log('Caption:', post.caption.slice(0, 80) + '...');
      console.log('Image prompt:', post.imagePrompt.slice(0, 80) + '...');
      continue;
    }

    try {
      const b64 = await generateImage(post.imagePrompt);
      const imageUrl = await uploadToImgBB(b64);
      const result = await postInstagram(post.caption, imageUrl);
      console.log(`  ✓ Posted to Instagram:`, JSON.stringify(result));
    } catch (err) {
      console.error(`  ✗ Post ${i + 1} failed: ${err.message}`);
    }

    if (i < POSTS.length - 1) await sleep(5000);
  }

  console.log('\n✅ Done.');
}

main();
