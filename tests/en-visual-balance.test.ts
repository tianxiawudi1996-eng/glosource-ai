import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const enPage = readFileSync('app/en/page.tsx', 'utf8');
const hero = readFileSync('app/components/HeroSection.tsx', 'utf8');
const journey = readFileSync('app/components/KoreaJourneySection.tsx', 'utf8');

test('EN keeps evidence and category proof ahead of the cultural journey', () => {
  const heroIndex = enPage.indexOf('<HeroSection lang="en" />');
  const evidenceIndex = enPage.indexOf('GOVERNMENT REGISTRY CROSS-CHECK');
  const categoriesIndex = enPage.indexOf('CATEGORIES — jogakbo patchwork grid');
  const journeyIndex = enPage.indexOf('<KoreaJourneySection lang="en" />');
  const problemIndex = enPage.indexOf('PROBLEM ─');

  assert.ok(heroIndex >= 0);
  assert.ok(heroIndex < evidenceIndex);
  assert.ok(evidenceIndex < categoriesIndex);
  assert.ok(categoriesIndex < journeyIndex);
  assert.ok(journeyIndex < problemIndex);
});

test('EN uses a compact three-stop, manually controlled Korea journey', () => {
  assert.match(journey, /\['seoul', 'busan', 'jeju'\]/);
  assert.match(journey, /if \(lang === 'en'\) return;/);
  assert.match(journey, /data-journey-count=\{journeySpots\.length\}/);
});

test('EN hero uses a static palace scene without the KR host or season controls', () => {
  assert.match(hero, /EN_HERO_IMAGE = '\/images\/korea-journey\/seoul-gyeongbokgung\.png'/);
  assert.match(hero, /data-motion-mode=\{lang === 'en' \? 'static' : 'ambient'\}/);
  assert.match(hero, /data-cultural-density=\{lang === 'en' \? 'restrained' : 'expressive'\}/);
  assert.match(hero, /\{lang === 'ko' && \(\s*<div className="gs-host-welcome/);
  assert.match(hero, /\{lang === 'ko' && \(\s*<div className="gs-season-switcher/);
  assert.match(hero, /if \(lang === 'en'\) return;/);
});

test('EN mobile navigation preserves the primary shortlist action at 360px', () => {
  assert.match(
    enPage,
    /href="\/en\/register" className="hidden min-\[400px\]:inline-flex/,
  );
  assert.match(
    enPage,
    /<ScrollCTA targetId="sourcing-tool" className="whitespace-nowrap/,
  );
});
