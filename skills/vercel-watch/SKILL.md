---
name: vercel-watch
description: Use when a Vercel deployment is in progress or just triggered and the user wants to monitor it until completion — user asks "watch the deployment", "monitor vercel", "check if build passed", "is it deployed yet", "wait for Vercel", or any variant of tracking Vercel deployment status to readiness or failure.
---

# Vercel Watch

Monitor a Vercel deployment from trigger until success or failure. Polls status, streams logs, reports outcome.

## When to Use

- User triggered `vercel`/`vercel --prod` and wants to know when it's done
- User asks "is it deployed yet?", "did the build pass?", "watch the deployment"
- CI/CD deploying and you need confirmation

**Don't use:** Deployment not yet triggered (trigger first), non-Vercel platforms, one-time status check (use `vercel list` directly).

## Core Pattern

```bash
# 1. Get latest production deployment URL
DEPLOY_URL=$(vercel list --environment=production 2>/dev/null | head -2 | tail -1 | awk '{print $1}')

# 2. Block until complete (preferred)
vercel inspect "$DEPLOY_URL" --wait --timeout 600 2>&1

# 3. Fallback: poll manually if --wait unavailable
while true; do
  STATUS=$(vercel list --environment=production 2>/dev/null | head -2 | tail -1 | awk '{print $2}')
  case "$STATUS" in READY|ERROR|CANCELED) break ;; *) sleep 5 ;; esac
done
```

**Always prefer `vercel inspect --wait`** — it blocks efficiently. Poll only as fallback.

## Implementation

**Primary — blocking wait:**
```bash
vercel inspect "$(vercel list --environment=production 2>/dev/null | head -2 | tail -1 | awk '{print $1}')" --wait --timeout 600 2>&1
```

**Fallback — polling loop (if --wait unsupported):**
```bash
URL=$(vercel list --environment=production 2>/dev/null | head -2 | tail -1 | awk '{print $1}')
for i in $(seq 1 120); do
  STATUS=$(vercel list --environment=production 2>/dev/null | head -2 | tail -1 | awk '{print $2}')
  echo "[$i] $STATUS"
  case "$STATUS" in READY|ERROR|CANCELED) break ;; esac
  sleep 5
done
```

**With log streaming (for debugging failures):**
```bash
vercel logs "$URL" -j & LOGS_PID=$!
vercel inspect "$URL" --wait --timeout 600
kill $LOGS_PID 2>/dev/null
```

## Outcomes

| Status | Action |
|--------|--------|
| `READY` | Report URL to user |
| `ERROR` | Run `vercel logs <url>`, extract first error, report file+line+message |
| `CANCELED` | Report, ask if redeploy wanted |
| `BUILDING`/`QUEUED` | Keep waiting |

## On Failure

1. `vercel logs <deployment-url>` for build output
2. Extract the **first error** (not warnings)
3. Report: file path, line number, error message
4. Do NOT try to fix unless user explicitly asks

## Edge Cases

- **No deployments yet:** `vercel list` empty → trigger `vercel --prod` first
- **Multiple concurrent:** Parse `vercel list` by date, watch most recent
- **Build >10 min:** Increase `--timeout` or fall back to polling
- **Not linked:** Run `vercel link` first in project directory
- **User interrupts:** Accept it. Deployment continues independently on Vercel.
