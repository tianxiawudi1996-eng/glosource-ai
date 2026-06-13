# LinkedIn Buffer Status - 2026-06-06

Status: blocked

## Finding

Buffer organization `My Organization` currently has 3 connected channels:

- Threads: `mubin_yijeong`
- Twitter/X: `glosource_ai`
- Instagram: `mubin_yijeong`

LinkedIn is not connected to Buffer, so `BUFFER_CHANNEL_LINKEDIN` cannot be populated from the current Buffer account.

## Work Completed

- Fixed `scripts/growth/list-buffer-channels.js` to use the current Buffer GraphQL schema:
  - `account { organizations { id name channelCount } }`
  - `channels(input: { organizationId })`
- Confirmed the channel list successfully with `npm run growth:buffer:channels`.
- Prepared today's LinkedIn manual post copy:
  - `reports/growth/linkedin-manual-posts-2026-06-06.md`

## Required External Action

Connect a LinkedIn profile or company page inside Buffer.

After it appears in `npm run growth:buffer:channels`, add:

```env
BUFFER_CHANNEL_LINKEDIN=<linkedin_channel_id>
```

Then run:

```powershell
node scripts\growth\linkedin-launch.js
```
