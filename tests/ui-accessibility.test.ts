import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { extractUnverifiedCertificationMentions } from '../app/lib/certification-signals';
import type { Supplier } from '../app/api/source/types';
import { SupplierCard as EnglishSupplierCard } from '../app/components/EnSourcingTool';

(globalThis as typeof globalThis & { React: typeof React }).React = React;

const sourcingTool = readFileSync('app/components/EnSourcingTool.tsx', 'utf8');
const landingPage = readFileSync('app/en/page.tsx', 'utf8');
const supplierCard = readFileSync('app/components/SupplierCard.tsx', 'utf8');
const enRegisterPage = readFileSync('app/en/register/page.tsx', 'utf8');
const koreanSourcingTool = readFileSync('app/HomePageClient.tsx', 'utf8');

test('sourcing form labels target named controls and region buttons expose selection', () => {
  for (const id of ['source-product', 'buyer-market', 'source-quantity', 'source-budget']) {
    assert.match(sourcingTool, new RegExp(`htmlFor=["']${id}["']`));
    assert.match(sourcingTool, new RegExp(`id=["']${id}["']`));
  }
  assert.match(sourcingTool, /aria-pressed=\{region === btn\.value\}/);
  assert.match(sourcingTool, /aria-live="polite"/);
});

test('dark landing sections avoid low-contrast slate text', () => {
  const darkRegistry = landingPage.slice(
    landingPage.indexOf('GOVERNMENT REGISTRY CROSS-CHECK'),
    landingPage.indexOf('CATEGORIES —'),
  );
  const footer = landingPage.slice(landingPage.indexOf('<footer'));
  assert.doesNotMatch(darkRegistry, /text-slate-[567]00/);
  assert.doesNotMatch(footer, /text-slate-[567]00/);
});

test('mobile supplier cards retain a visible verification-state chip', () => {
  const mobileView = supplierCard.slice(
    supplierCard.indexOf('모바일 카드 뷰'),
    supplierCard.indexOf('데스크탑 테이블'),
  );
  assert.match(mobileView, /verification\.label/);
});

test('Korean supplier risk and trust evidence are explicitly labeled as AI estimates', () => {
  assert.match(supplierCard, /낮음 \(AI 추정\)/);
  assert.match(supplierCard, /AI 추정 신뢰 신호/);
});

test('AI-detected certification mentions are labeled unverified on each English chip', () => {
  assert.match(sourcingTool, /extractUnverifiedCertificationMentions/);
  assert.match(sourcingTool, /AI-detected certification mentions — unverified/);
  assert.match(sourcingTool, /Government registry match/);
  assert.match(sourcingTool, /met: s\.govVerified === true/);
  assert.doesNotMatch(sourcingTool, /\{c\.label\}\s*<span[^>]*>~<\/span>/);

  const aiOnly = extractUnverifiedCertificationMentions(
    ['The listing mentions MFDS and HACCP certification.'],
  );
  assert.deepEqual(aiOnly.map(signal => signal.label), [
    'MFDS mentioned — unconfirmed',
    'HACCP mentioned — unconfirmed',
  ]);

  const registryMatched = extractUnverifiedCertificationMentions(
    ['The listing mentions MFDS and HACCP certification.'],
    ['MFDS', 'HACCP'],
  );
  assert.deepEqual(registryMatched, []);

  const partiallyMatched = extractUnverifiedCertificationMentions(
    ['The listing mentions MFDS and HACCP certification.'],
    ['MFDS'],
  );
  assert.deepEqual(partiallyMatched.map(signal => signal.label), [
    'HACCP mentioned — unconfirmed',
  ]);

  for (const registry of ['CGMP', 'Medical', 'Health-food', 'Quasi-drug']) {
    const mentions = extractUnverifiedCertificationMentions(
      ['The listing mentions KFDA, 식약처, and HACCP certification.'],
      [registry],
    );
    assert.deepEqual(
      mentions.map(signal => signal.label),
      ['HACCP mentioned — unconfirmed'],
    );
  }
});

test('English listing quality awards certification points only for a government match', () => {
  const baseSupplier: Supplier = {
    rank: 1,
    name: 'Signal Supplier',
    platform: 'Web',
    country: 'South Korea',
    url: 'https://signal.example',
    trustScore: 70,
    trustEvidence: ['The listing mentions MFDS certification.'],
    redFlags: [],
    productMatch: '',
    estimatedPrice: '',
    moq: '',
    summary: '',
    verificationStatus: 'grounding_confirmed',
    productStage: 'finished_product',
    leadTimeDays: '',
    hscode: '',
    exportToKoreaExperience: false,
  };
  const renderCard = (supplier: Supplier) => renderToStaticMarkup(
    React.createElement(EnglishSupplierCard, {
      s: supplier,
      rank: 1,
      keyword: 'serum',
      locked: false,
    }),
  );

  const aiOnly = renderCard(baseSupplier);
  assert.match(aiOnly, /MFDS mentioned — unconfirmed/);
  assert.match(aiOnly, />15\/100</);

  const governmentMatched = renderCard({
    ...baseSupplier,
    govVerified: true,
    govRegistries: ['MFDS'],
    govEvidence: ['MFDS registry match'],
  });
  assert.doesNotMatch(governmentMatched, /MFDS mentioned — unconfirmed/);
  assert.match(governmentMatched, />40\/100</);
});

test('English register page uses a responsive layout for the long consent form', () => {
  assert.match(enRegisterPage, /min-h-dvh/);
  assert.match(enRegisterPage, /max-w-5xl/);
  assert.match(enRegisterPage, /lg:grid-cols-\[0\.9fr_1\.1fr\]/);
  assert.match(enRegisterPage, /if \(!allConsents\)/);
  assert.match(enRegisterPage, /Please accept the required agreements to continue\./);
  assert.match(enRegisterPage, /disabled=\{isSubmitting\}/);
});

test('anonymous Korean searches require explicit terms and privacy consent', () => {
  assert.match(koreanSourcingTool, /sessionStatus !== 'authenticated'/);
  assert.match(koreanSourcingTool, /type="checkbox"/);
  assert.match(koreanSourcingTool, /href="\/terms"/);
  assert.match(koreanSourcingTool, /href="\/privacy"/);
  assert.match(koreanSourcingTool, /disabled=\{loading \|\| anonymousConsentRequired\}/);
  assert.match(
    koreanSourcingTool,
    /anonymousConsentRequiredRef\.current = anonymousConsentRequired/,
  );
  assert.match(
    koreanSourcingTool,
    /if \(!anonymousConsentRequiredRef\.current\) return false/,
  );
  assert.equal(
    [...koreanSourcingTool.matchAll(/if \(blockAnonymousSearchWithoutConsent\(\)\)/g)].length,
    3,
  );
  assert.match(koreanSourcingTool, /이용약관과 개인정보처리방침에 동의해주세요\./);
});
