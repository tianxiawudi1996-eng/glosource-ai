import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  expectedCountryPreference,
  resolveSourcingRouteContract,
} from '../app/lib/product-contracts';

test('server-owned product surfaces enforce opposite sourcing directions', () => {
  assert.equal(expectedCountryPreference('kr'), 'china');
  assert.equal(expectedCountryPreference('en'), 'korea');
  assert.deepEqual(resolveSourcingRouteContract('kr', 'china'), {
    surface: 'kr',
    countryPreference: 'china',
    outputLanguage: 'ko',
  });
  assert.deepEqual(resolveSourcingRouteContract('en', 'korea'), {
    surface: 'en',
    countryPreference: 'korea',
    outputLanguage: 'en',
  });
  assert.equal(resolveSourcingRouteContract('kr', 'korea'), null);
  assert.equal(resolveSourcingRouteContract('en', 'china'), null);
});

test('route wrappers pass explicit trusted surfaces to quota checks', () => {
  const chat = readFileSync('app/lib/chatRouteWrapper.js', 'utf8');
  const image = readFileSync('app/lib/imageAnalyzeRouteWrapper.js', 'utf8');

  assert.match(chat, /checkAuthAndQuota\(request,\s*'chat',\s*'en'\)/);
  assert.match(image, /checkAuthAndQuota\(request,\s*'image_analyze',\s*'kr'\)/);
});

test('KR and EN clients call separate server-owned sourcing routes', () => {
  const sourceRoute = readFileSync('app/api/source/route.ts', 'utf8');
  const sourceHandler = readFileSync('app/api/source/handler.ts', 'utf8');
  const enRoute = readFileSync('app/api/en/source/route.ts', 'utf8');
  const enClients = [
    'app/components/EnSourcingTool.tsx',
    'app/en/assistant/AssistantExperience.tsx',
  ].map((path) => readFileSync(path, 'utf8')).join('\n');

  assert.match(sourceRoute, /handleSourcingPost\(request,\s*'kr'\)/);
  assert.match(enRoute, /handleSourcingPost\(request,\s*'en'\)/);
  assert.doesNotMatch(sourceHandler, /surface\s*=\s*lang\s*===/);
  assert.match(enClients, /fetch\('\/api\/en\/source'/);
  assert.doesNotMatch(enClients, /fetch\('\/api\/source'/);
});
