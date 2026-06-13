# Outreach Reply Automation (inbound)

Date added: 2026-06-13

Automates the **inbound** side of cold outreach: detect lead replies, classify them,
and write **Gmail drafts** for review. It never sends — a human (or the cloud agent)
reviews each draft and clicks send. This matches the schedule principle:
*"Keep human approval before public community posts, cold outreach, or social publishing."*

## What it does

| Step | Who | Action |
| --- | --- | --- |
| 1. Fetch | `npm run growth:replies` | Reads the outreach Gmail account, finds threads where we sent a message and the lead replied last, classifies each reply, writes an audit + a draft queue. |
| 2. Draft | Cloud Claude agent (or you) | Replaces each `draftBody` in the queue with a personalized reply. |
| 3. Create drafts | `npm run growth:replies:draft` | Creates an in-thread Gmail **draft** for each queue item. |
| 4. Send | You | Review drafts in Gmail and send the good ones. |

Outputs:

```text
reports/growth/outreach-replies-YYYY-MM-DD.json     # full audit (every matched thread + skip reasons)
data/growth/outreach-reply-queue-YYYY-MM-DD.json    # items needing a reply, with a template draftBody
```

Classification labels: `interested`, `question`, `objection`, `unsubscribe`, `auto_reply` (skipped), `needs_review`.

## Why Gmail API and not the MCP

The claude.ai Gmail MCP requires interactive auth and is **absent in headless / cron / cloud runs**.
So this uses the Gmail REST API with an OAuth refresh token — works locally, in cron, and in cloud `/schedule`.
It also keeps to the LLM-matrix rule: **no LLM API keys**. The "intelligence" (classification refinement,
personalized drafting) is done by the cloud Claude Code agent itself, not by an API call in the script.

## One-time setup (≈5–10 min, only you can do this)

The outreach is sent from **tianxiawudi1996@gmail.com**, so the token must be for that account.

1. **Google Cloud Console** (https://console.cloud.google.com), signed in as tianxiawudi1996:
   - Create/select a project.
   - **APIs & Services → Library → Gmail API → Enable.**
2. **OAuth consent screen:**
   - User type: External.
   - Add scope: `https://www.googleapis.com/auth/gmail.modify` (covers read + draft create).
   - **Set publishing status to "In production."** (Testing-mode refresh tokens expire after 7 days.
     You will click through a one-time "Google hasn't verified this app → Advanced → Go to (unsafe)" warning
     because it's your own unverified personal app. That is expected and fine for single-user use.)
3. **Credentials → Create credentials → OAuth client ID → Desktop app.** Copy the **Client ID** and **Client secret**.
4. **Get a refresh token** via the OAuth Playground (no code):
   - In the OAuth client, add `https://developers.google.com/oauthplayground` as an authorized redirect URI.
   - Open https://developers.google.com/oauthplayground → gear icon (top right) → check
     **"Use your own OAuth credentials"** → paste Client ID + secret.
   - Left panel scope box: enter `https://www.googleapis.com/auth/gmail.modify` → **Authorize APIs** →
     sign in as tianxiawudi1996 → allow.
   - **Step 2 → "Exchange authorization code for tokens"** → copy the **`refresh_token`**.
5. **Add to `.env.local`** (local) — `.env.local` is gitignored, so the token never gets committed:

   ```bash
   GMAIL_OAUTH_CLIENT_ID=xxxxx.apps.googleusercontent.com
   GMAIL_OAUTH_CLIENT_SECRET=GOCSPX-xxxxx
   GMAIL_OAUTH_REFRESH_TOKEN=1//xxxxx
   GMAIL_ACCOUNT=tianxiawudi1996@gmail.com
   # optional — defaults shown:
   # OUTREACH_QUERY=label:GloSource/Outreach newer_than:30d
   # GMAIL_SENDER_NAME=GloSource AI
   ```

6. **Verify:**

   ```bash
   npm run growth:env          # GMAIL_* should show present
   npm run growth:replies      # should list any pending replies (0 is fine)
   npm run growth:replies:draft -- --dry-run   # shows what drafts would be created
   ```

## Cloud /schedule routine

After setup, the four `GMAIL_*` values must be provided as **environment secrets to the cloud routine**
(the cloud run has no `.env.local`). Suggested routine prompt:

```
Run `npm run growth:replies`. Read the newest data/growth/outreach-reply-queue-*.json.
For each item, rewrite draftBody as a concise, personalized English reply in the GloSource voice
(a free first-pass research shortcut, not a supplier audit; offer a free sample shortlist for one
product category; never overclaim verification). Leave auto_reply / unsubscribe items as-is
(empty or polite removal). Save the queue file, then run `npm run growth:replies:draft`.
Report a one-line summary per reply. Do NOT send anything — drafts only.
```

Cadence is registered in `data/growth/automation-schedule.json` as `daily-outreach-replies` (11:00 KST).

## Safety

- **Never sends.** Only `drafts.create` is called. Sending stays a human action in Gmail.
- **No duplicate drafts.** Threads that already contain a draft are skipped on re-runs.
- **Already-replied threads skipped.** Only threads whose last message is from the lead are queued.
- **`auto_reply` / OOO replies get no draft.**
- Scope is limited to threads matched by `OUTREACH_QUERY` (the `GloSource/Outreach` label by default),
  so general inbox mail is never touched.
