# China Sourcing Channel Analysis for GloSource AI

Date: 2026-05-03

## Positioning Guardrail

GloSource AI should stay in the pre-order matching layer:

- Discover supplier candidates.
- Translate Korean requests into Chinese sourcing keywords.
- Compare supplier evidence, price signals, MOQ, lead time, certifications, and red flags.
- Generate RFQ emails and supplier question lists.
- Produce a Korean decision report.

GloSource AI should not present itself as handling delivery, customs, logistics, QC inspection, dispute resolution, or transaction guarantees.

## Channel Split

### 1. China-local channels used by domestic buyers

These are useful for finding earlier-stage, lower-price, factory-direct candidates. They are less friendly to foreigners and often require Chinese search terms, Chinese UI, platform chat, and manual verification.

| Channel | Use in GloSource | Strength | Weakness / Risk | Best Query Pattern |
| --- | --- | --- | --- | --- |
| 1688 | Primary local factory discovery | Strong factory-direct price signal, broad categories, domestic wholesale | Many traders, Chinese-first UX, account/chat friction, international buying friction | `{中文品名} 厂家直销 site:1688.com`, `{中文品名} 源头工厂 1688`, `{中文品名} 诚信通` |
| 1688 找工厂 / factory channel | Factory-candidate filter | Better for source factory/OEM/ODM discovery | Still needs validation; not every listing is a true manufacturer | `{中文品名} 找工厂 1688`, `{中文品名} OEM 工厂 1688` |
| 百度爱采购 | Baidu-native B2B discovery | Strong for Chinese-language search behavior and Baidu traffic; buyer app supports product search, inquiries, IM, phone contact | May surface SEO-heavy suppliers and resellers; must verify business scope | `{中文品名} 百度爱采购 厂家`, `{中文品名} 爱采购 生产厂家` |
| 供应商网 / 中国供应商 | Baidu AiCaigou partner and broad B2B directory | Large category coverage, supplier directories, purchasing posts | Directory quality varies; needs cross-checking | `{中文品名} 供应商网 厂家`, `{中文品名} 中国供应商 生产厂家` |
| 慧聪网 / HC360 | Legacy Chinese B2B | Useful for industrial/equipment categories | Older listings and variable data freshness | `{中文品名} 慧聪网 厂家` |
| 搜了网 / 马可波罗网 / 黄页88 / 顺企网 | Long-tail supplier discovery | Good for finding alternate company names and phone/contact clues | High noise, SEO pages, duplicate listings | `{中文品名} 搜了网`, `{中文品名} 马可波罗 厂家`, `{公司名} 营业执照` |
| WeChat 公众号 / Sogou WeChat | Factory promotion and sales contact intelligence | Finds recent factory posts, product photos, contact hints | Not structured; supplier identity must be cross-checked | `{中文品名} 工厂 微信`, `{中文品名} 厂家 公众号` |

### 2. Foreign-buyer channels preferred by overseas buyers

These are easier for non-Chinese buyers and have more English-facing trust badges. They are usually more expensive or more trade-company-heavy.

| Channel | Use in GloSource | Strength | Weakness / Risk | Best Query Pattern |
| --- | --- | --- | --- | --- |
| Alibaba.com | Global baseline comparison | English UI, RFQ workflow, Trade Assurance/Verified Supplier signals | More traders and export markups; not always factory-direct | `{English product} Alibaba verified supplier`, `{English product} Trade Assurance manufacturer` |
| Made-in-China.com | Verification-heavy export supplier discovery | Audited Supplier reports, SGS/BV/TUV/CTI audit signals, export market filters | Often export-oriented pricing; may still include trading companies | `{English product} site:made-in-china.com audited supplier` |
| Global Sources | Export supplier discovery | Historically strong in electronics, gifts, hardware, trade-show style suppliers | Smaller pool than Alibaba in some categories | `{English product} Global Sources verified supplier` |
| DHgate | Small MOQ / sample-like discovery only | Low MOQ and easy foreign buyer flow | Counterfeit/quality risk, weaker B2B fit for construction materials | Use only for non-critical sample or consumer-like products |

## Matching Logic Recommendation

GloSource should score channels differently by user intent:

1. If the user wants lowest factory-direct price:
   - Search 1688, 1688 factory, Baidu AiCaigou, supplier directories first.
   - Compare against Alibaba/Made-in-China as export price baselines.

2. If the user wants safer export-facing supplier:
   - Search Made-in-China Audited Supplier, Alibaba Verified/Trade Assurance, Global Sources first.
   - Add 1688/Baidu local candidates as price discovery references.

3. If the item is construction material or industrial component:
   - Prioritize 1688, Baidu AiCaigou, Made-in-China, Global Sources.
   - Downrank DHgate unless the item is a small off-the-shelf accessory.

4. If exact product identification is weak:
   - Generate Chinese terms first.
   - Use synonyms: `厂家`, `源头工厂`, `生产厂家`, `批发`, `定制`, `OEM`, `规格`, material name, region/industry cluster.

## Supplier Verification Signals

Use these as evidence fields in the AI report:

- Manufacturer evidence: business scope includes `生产`, `制造`, `加工`; factory photos; equipment; production capacity; factory card.
- Platform trust: 诚信通 years, 实力商家, 超级工厂, Verified Supplier, Audited Supplier, Gold Member.
- Export readiness: English page, export markets, FOB/CIF terms, export certificates, Korea/Japan export references.
- Product fit: exact specs, material grade, certification references, MOQ compatibility.
- Red flags: no URL, no platform badge, newly established company, only sales/trading scope, absurdly low price, no reviews, duplicated listings, mismatched category.

## Prompt Upgrade Direction

Current prompts should explicitly include China-local search paths:

- `site:1688.com {中文品名} 厂家直销`
- `site:factory.1688.com {中文品名} 源头工厂`
- `{中文品名} 百度爱采购 生产厂家`
- `{中文品名} 供应商网 厂家`
- `{中文品名} 慧聪网 厂家`
- `{中文品名} 马可波罗 厂家`
- `{中文品名} 微信 公众号 工厂`

The AI should not claim these platforms were definitely searched unless it has URL/evidence. If the source is inferred, set `verificationStatus` to `ai_estimated` and leave `url` empty.

## UI Recommendation

Recommended UI labels:

- `중국 내수 소싱`
- `수출형 B2B 비교`
- `WeChat 공장 홍보`
- `사진으로 찾기`

Recommended trust copy:

- `1688 · Baidu 爱采购 · Made-in-China · Global Sources 후보 비교`
- `공급자 매칭과 RFQ 작성까지만 지원합니다. 거래 실행은 사용자가 직접 결정합니다.`

Avoid:

- `납품`, `물류`, `통관`, `QC 대행`, `하자 중재`, `거래 보증`.

## Sources Checked

- 1688 app listings describe 1688 as factory-direct/wholesale procurement with Chinese-market and global-buyer friction signals.
- Baidu AiCaigou app listing describes product search, inquiries, IM, and phone contact for buyers.
- 供应商网/中国供应商 pages show Baidu AiCaigou official partner positioning, broad categories, purchase posting, and buyer/seller tools.
- Made-in-China Audited Supplier pages show third-party audit reports by SGS, Bureau Veritas, TUV Rheinland, and CTI, plus audit dimensions such as general information, foreign trade capacity, production capacity, certifications, and quality control.
- Alibaba/Global Sources/DHgate references were used to distinguish export-facing platforms and small-MOQ/consumer-like risks.
