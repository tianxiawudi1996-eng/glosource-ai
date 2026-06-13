# GloSource AI Daily Automation

Date added: 2026-05-28

## Local Command

Run today's scheduled growth work:

```bash
npm run growth:today
```

This reads:

```text
data/growth/automation-schedule.json
```

It runs all items due for the current day in `Asia/Seoul`, continues after failures, and writes:

```text
reports/growth/scheduled-growth-run-YYYY-MM-DD.json
```

## What It Automates

The current daily sequence is:

1. Revenue and funnel safety:
   - `npm run growth:audit`
   - `npm run growth:payments`
2. Evidence pipeline:
   - `npm run growth:cases`
3. Acquisition readiness:
   - `npm run growth:social:dry-run`
   - `npm run growth:acquisition:gate`

Weekly jobs still run only on their configured weekday unless you pass:

```bash
node scripts/growth/run-scheduled-growth.js --include-weekly
```

Manual pre-deploy gates can be included with:

```bash
node scripts/growth/run-scheduled-growth.js --include-manual
```

## Windows Task Scheduler

Create a daily task that runs from the repo root:

```powershell
$action = New-ScheduledTaskAction -Execute "npm" -Argument "run growth:today" -WorkingDirectory "C:\Users\ddedi\safedoc-ai"
$trigger = New-ScheduledTaskTrigger -Daily -At 9:00am
Register-ScheduledTask -TaskName "GloSource AI Daily Growth" -Action $action -Trigger $trigger -Description "Runs GloSource AI daily growth gates and reports" -User $env:USERNAME
```

Use the Task Scheduler UI if PowerShell registration is blocked by permissions.

## Important Limits

This cannot safely publish or spend money automatically yet.

Blocked until payment health passes:

- Paid ads
- Product Hunt launch
- High-volume outbound

Blocked until evidence exists:

- Testimonials
- Public case studies
- Claims that suppliers are verified

Current known blocker:

- Polar product API returns `403 insufficient_scope` for `POLAR_ACCESS_TOKEN`.
- Fix by creating a Polar Organization Access Token for the same organization with `products:read` or `products:write`, then update `.env.local`.
