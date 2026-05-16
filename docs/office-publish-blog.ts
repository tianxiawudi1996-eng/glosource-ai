/**
 * Office PC — Blog Publish Script
 * ================================
 * Converts a local .md file into a published GloSource blog post via the admin API.
 *
 * Setup (one-time on office PC):
 *   npm install -g tsx          # or: npx tsx works without global install
 *
 * Usage:
 *   ADMIN_SECRET=your_secret npx tsx docs/office-publish-blog.ts path/to/post.md
 *
 * .md file format — frontmatter at the top:
 *   ---
 *   slug: my-post-slug
 *   title: My Post Title
 *   description: One-sentence description for SEO
 *   category: Sourcing Guide
 *   lang: en
 *   publishedAt: 2026-05-16
 *   readingTimeMin: 6
 *   published: true
 *   ---
 *
 *   (everything below the closing --- is the post content, treated as HTML or Markdown)
 *
 * API endpoint: https://glosource-ai.vercel.app/api/admin/blog-posts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const API_URL = process.env.API_URL ?? 'https://glosource-ai.vercel.app';
const SECRET = process.env.ADMIN_SECRET ?? '';

if (!SECRET) {
  console.error('Error: set ADMIN_SECRET env var before running.');
  process.exit(1);
}

const mdPath = process.argv[2];
if (!mdPath) {
  console.error('Usage: ADMIN_SECRET=xxx npx tsx docs/office-publish-blog.ts path/to/post.md');
  process.exit(1);
}

const raw = readFileSync(resolve(process.cwd(), mdPath), 'utf-8');

// Parse frontmatter
const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!fmMatch) {
  console.error('Error: file must start with YAML frontmatter block (--- ... ---)');
  process.exit(1);
}

const [, fmBlock, content] = fmMatch;

function parseFm(block: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of block.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key) result[key] = val;
  }
  return result;
}

const fm = parseFm(fmBlock);

const required = ['slug', 'title', 'description', 'category'];
for (const field of required) {
  if (!fm[field]) {
    console.error(`Error: frontmatter missing required field: ${field}`);
    process.exit(1);
  }
}

const payload = {
  slug: fm.slug,
  title: fm.title,
  description: fm.description,
  category: fm.category,
  lang: fm.lang ?? 'en',
  publishedAt: fm.publishedAt ?? new Date().toISOString().slice(0, 10),
  readingTimeMin: parseInt(fm.readingTimeMin ?? '5', 10),
  published: fm.published !== 'false',
  content: content.trim(),
};

console.log(`Publishing "${payload.title}" (${payload.slug})...`);

async function publish() {
  const res = await fetch(`${API_URL}/api/admin/blog-posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json() as { success?: boolean; error?: string; slug?: string };

  if (!res.ok || !data.success) {
    console.error(`Failed (HTTP ${res.status}):`, data.error ?? JSON.stringify(data));
    process.exit(1);
  }

  console.log(`Done. Post live at: ${API_URL}/en/blog/${data.slug}`);
}

publish().catch(err => {
  console.error(err);
  process.exit(1);
});
