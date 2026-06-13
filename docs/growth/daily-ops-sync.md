# GloSource AI Daily Ops Sync

`npm run growth:today` now ends with a daily ops log sync.

## What It Writes

- `reports/growth/daily-ops-log-YYYY-MM-DD.md`
- `reports/growth/daily-ops-sync-YYYY-MM-DD.json`

The log summarizes:

- scheduled growth run status
- daily funnel/payment gate status
- payment health
- Polar dummy webhook status when present
- acquisition readiness
- buyer activity
- Buffer launch audit
- weekly report link when present
- warnings and manual follow-up

## Default Local Destinations

The sync must never stop just because an external account is not connected.

When no external settings are present, it creates:

- Obsidian-compatible vault folder: `ops/obsidian/GloSource AI/Daily Ops/`
- Slack outbox payloads: `reports/growth/outbox/slack/`
- Notion-ready Markdown: `reports/growth/outbox/notion/`

## Slack

Add this to `.env.local`:

```bash
SLACK_GLOSOURCE_WEBHOOK_URL=https://hooks.slack.com/services/...
```

When set, `npm run growth:ops:sync` posts the daily summary to Slack.

When missing, the script creates a Slack JSON payload in `reports/growth/outbox/slack/`.

## Obsidian

Add this to `.env.local`:

```bash
OBSIDIAN_GLOSOURCE_LOG_DIR=C:\Path\To\Obsidian\Vault\GloSource AI\Daily Ops
```

When set, `npm run growth:ops:sync` copies the Markdown log into that folder.

When missing, the script creates and uses `ops/obsidian/GloSource AI/Daily Ops/`.

## Notion

The script always produces Notion-ready Markdown at:

```bash
reports/growth/daily-ops-log-YYYY-MM-DD.md
```

Notion publishing currently needs either:

- an active Codex Notion connector session, or
- a dedicated Notion API integration added later.

Until then, the Notion source of truth is the generated Markdown file.

The script also writes a Notion outbox copy to `reports/growth/outbox/notion/`.
