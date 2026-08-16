# GloSource AI KR/EN Visual Alignment — Meta Prompt & Plan

## ROLE

Act as a senior product UI engineer refining the existing GloSource AI landing
pages without replacing their route structure, working features, or buyer-facing
copy.

## GOAL

Make the existing landmark imagery match the Korean and English buyer contexts
more clearly while preserving all existing visible page text.

## USERS

- KR: Korean businesses exploring overseas sourcing channels.
- EN: Overseas buyers evaluating Korean manufacturers and registry evidence.

## CONTEXT

`/` and `/en` share `HeroSection` and `KoreaJourneySection`, but their visual
priority differs. KR should lead with local discovery and a warm Korean editorial
tone; EN should lead with English buyer comprehension and a cooler evidence-led
tone. The prior HTML mock is a placement reference, not a route replacement.

## SCOPE

- Pass `lang` into the seasonal hero cover.
- Keep all existing visible hero and page copy unchanged.
- Order new landmark labels by buyer language: KR first on `/`, EN first on `/en`.
- Give EN a restrained cooler crop/light treatment and journey paper tone.
- Give KR a warm local-discovery treatment while keeping the same approved assets.
- Preserve bilingual image alt text and responsive card behavior.
- Keep the seasonal host face clear of the desktop proof panel and preserve the
  stacked mobile reading order.

## OUT OF SCOPE

- No route replacement or deletion.
- No pricing, quota, CTA, supplier claim, or legal-copy changes.
- No new provider, database, payment, analytics, deployment, or external-posting work.
- No claim that generated editorial imagery is official tourism verification.

## CONSTRAINTS

- Existing working-tree changes belong to the user and must be preserved.
- KR/EN product boundaries remain separate.
- Landmark labels remain small, readable, bilingual, and non-interactive.
- `prefers-reduced-motion`, keyboard focus, and 390px/1440px layouts remain valid.

## TOOLS

- Next.js 16 App Router, React 19, TypeScript, Tailwind/global CSS.
- `agent-browser` for local desktop/mobile visual QA.
- TypeScript, lint, test, build, lifecycle and sensitive-string checks.

## WORKFLOW

1. Inspect existing copy, route wiring, assets, lifecycle state, and dirty scope.
2. Apply additive language-aware visual classes and label ordering only.
3. Run typecheck, lint, build, tests, and harness checks sequentially/independently.
4. Inspect `/` and `/en` at desktop and mobile widths; test landmark label order and no horizontal overflow.
5. Record evidence and keep P10 external gates unchanged.

## SUCCESS CRITERIA

- Existing visible KR/EN copy is unchanged.
- `/` shows `서울 · SEOUL / 경복궁 · Gyeongbokgung` and warm local journey styling.
- `/en` shows `SEOUL · 서울 / Gyeongbokgung · 경복궁` and restrained cool evidence styling.
- Regional cards retain bilingual names and accessible alt/ARIA text.
- Typecheck, tests, build, browser QA, and harness checks pass.

## FAILURE CRITERIA

- Existing copy or route behavior is changed unintentionally.
- KR and EN sourcing direction, quotas, or legal state are mixed.
- A label collides with copy, disappears on mobile, or causes horizontal overflow.
- The proof panel covers the seasonal host face or becomes clipped at the
  desktop viewport edge.
- A test/build/harness check fails without a documented blocker.

## OUTPUTS

- Updated `HeroSection.tsx`, `KoreaJourneySection.tsx`, and `globals.css`.
- This plan plus status/test/task-queue evidence.

## VERIFICATION

- `npx tsc --noEmit`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run lifecycle:validate`
- state/placeholder/sensitive/diff checks
- `agent-browser` `/` and `/en` at 1440px and 390px

## MEMORY UPDATE

Record only the durable distinction that the mock is a placement reference and
that KR/EN use the same approved landmarks with different language-first visual
treatment. Do not record credentials, private data, or unverified user metrics.

## STOP CONDITION

Stop after local verification. Do not commit, push, deploy, publish, send, or
advance P10 without separate user approval and lifecycle evidence.
