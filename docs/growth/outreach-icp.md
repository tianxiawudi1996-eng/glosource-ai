# GloSource AI — Outreach ICP (Ideal Customer Profile)

Date added: 2026-06-13

The one question that defines fit: **"Does this entity need to FIND Korean suppliers?"**
Being in the K-beauty space is NOT the signal. Many K-beauty companies have already solved
the problem GloSource solves and are therefore weak targets.

## Strong fit — target these

Buyers/resellers who do **not** yet have a locked Korean supply chain:

- Indie / DTC beauty brand founders exploring Korean OEM/ODM
- Amazon FBA sellers in beauty or food testing a Korean product line
- Small importers / retailers adding a Korean category for the first time
- Procurement managers newly tasked with sourcing from Korea
- E-commerce operators validating Korean suppliers before committing

Why: they have intent and a real gap. A free supplier shortlist + RFQ draft directly removes work they would otherwise do manually.

## Poor fit — do NOT cold-email (skip or de-prioritize)

Entities that already source Korea directly, or that are themselves in the sourcing business:

- Established K-beauty distributors with direct Korean brand/OEM relationships (**this is the BLIFE USA case** — they already partner with a leading Korean OEM/ODM and sell their own house brand)
- Sourcing agencies, trading companies, export operators (peers/competitors, not customers)
- Korean manufacturers / suppliers themselves
- Large distributors with locked supply chains

Why: GloSource solves a problem they have already solved. Even a reply rarely converts, and emailing peers/competitors dilutes the list and the brand.

## How the score encodes this

`scripts/growth/score-outreach-leads.js` reads `data/growth/lead-sources.json`. Each lead is a set of booleans:

| Field | Effect | Meaning |
| --- | --- | --- |
| `exploringKoreanSuppliers` | +35 | strongest intent signal |
| `isBuyerOrReseller` | +15 | buyer, not an operator |
| `sellsKoreanProducts` | +20 | in the space |
| `recentLaunch` | +15 | supply not locked yet |
| `hasWholesaleLanguage` | +10 | import/wholesale intent |
| `usesMarketplace` | +10 | reachable, transacting |
| `contactVisible` | +15 / −25 | has / lacks a contact path |
| `alreadySourcesKoreaDirect` | **−45** | weak fit (the BLIFE killer) |
| `isSourcingOperatorOrExporter` | **−35** | peer/competitor, not a customer |

Any lead with `alreadySourcesKoreaDirect` or `isSourcingOperatorOrExporter` is tagged
`fitTier: "poor"` and sorted to the bottom regardless of raw points.

Tiers: `strong` (≥60), `maybe` (30–59), `weak` (<30), `poor` (anti-fit flag set).
**Only email `strong` (and hand-picked `maybe`).** Never cold-email `poor`.

## The lesson behind this

On 2026-06-06, BLIFE USA was emailed (scored 75 under the old model). Investigation showed
BLIFE USA already has a direct Korean OEM/ODM partner and even helps others export from Korea —
a Korea-sourcing operator, not a buyer who needs supplier discovery. The old scorer rewarded
"in the K-beauty space" and missed fit entirely. Under this model BLIFE-type leads score negative
and are excluded. Curate `lead-sources.json` to this ICP before the next send, and gate every send
with `npm run growth:outreach:preflight`.
