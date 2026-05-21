---
name: claude-design-post-deploy
description: Use after a Vercel deployment completes (preview or production) to verify the deploy is healthy before declaring success. Runs HTTP smoke checks, optional Lighthouse audit, asset/route verification, env-var sanity, and rollback dry-run. Invoked by claude-design-vercel-deployment-orchestrator and any droid that needs the same gating checklist.
---

# Claude Design Post-Deploy Verification

Verify a Vercel deployment is genuinely production-ready before claiming success. This skill enforces the "Definition of Done" gating checklist used by the `claude-design-vercel-deployment-orchestrator` droid, but works standalone for any Vercel deployment.

## When to Use

- Right after `vercel deploy` or `vercel deploy --prod` returns a URL
- Before promoting a preview to production
- Before declaring any deploy "successful" to the user
- During incident response, to verify a rollback restored health

**Don't use:** Deployment still building (use `vercel-watch` first), non-Vercel platforms, pure local builds.

## Inputs

- `DEPLOY_URL` — required. The deployment URL to verify (e.g. `my-app-abc123.vercel.app`).
- `EXPECTED_ROUTES` — optional. Space-separated paths that must return 200/301/302 (default: `/`).
- `HEALTH_PATH` — optional. API health route (default: `/api/health`, skipped if 404).
- `RUN_LIGHTHOUSE` — optional. `true` to run Lighthouse against the URL (default: `false`).
- `LIGHTHOUSE_MIN_PERF` — optional. Minimum Lighthouse performance score 0-100 (default: `70`).
- `VERCEL_TOKEN` — required for rollback dry-run.
- `PROD_DOMAIN` — optional. Custom domain to verify resolves and serves valid TLS.

## Core Pattern

```bash
set -euo pipefail
URL="${DEPLOY_URL:?DEPLOY_URL required}"
ROUTES="${EXPECTED_ROUTES:-/}"
HEALTH="${HEALTH_PATH:-/api/health}"

# 1. HTTP smoke check on every expected route
for route in $ROUTES; do
  code=$(curl -fsS -o /dev/null -w "%{http_code}" "https://$URL$route" || echo "000")
  case "$code" in
    200|301|302) echo "OK   $route -> $code" ;;
    *)           echo "FAIL $route -> $code"; exit 1 ;;
  esac
done

# 2. Optional health endpoint (don't fail on 404 — route may not exist)
hc=$(curl -fsS -o /dev/null -w "%{http_code}" "https://$URL$HEALTH" || echo "000")
[ "$hc" = "200" ] && echo "OK   $HEALTH -> 200"
[ "$hc" = "404" ] && echo "SKIP $HEALTH -> not implemented"
[ "$hc" != "200" ] && [ "$hc" != "404" ] && { echo "FAIL $HEALTH -> $hc"; exit 1; }

# 3. TLS check on custom domain (if provided)
if [ -n "${PROD_DOMAIN:-}" ]; then
  curl -fsS -o /dev/null --max-time 10 "https://$PROD_DOMAIN" \
    || { echo "FAIL TLS/DNS for $PROD_DOMAIN"; exit 1; }
  echo "OK   TLS valid for $PROD_DOMAIN"
fi
```

## Lighthouse audit (optional)

```bash
if [ "${RUN_LIGHTHOUSE:-false}" = "true" ]; then
  npx -y lighthouse "https://$URL" \
    --only-categories=performance,accessibility,best-practices,seo \
    --chrome-flags="--headless --no-sandbox" \
    --output=json --output-path=/tmp/lh.json --quiet

  perf=$(jq -r '.categories.performance.score * 100' /tmp/lh.json)
  echo "Lighthouse perf: $perf"
  awk -v p="$perf" -v m="${LIGHTHOUSE_MIN_PERF:-70}" \
      'BEGIN{ exit !(p+0 >= m+0) }' \
    || { echo "FAIL Lighthouse perf $perf < ${LIGHTHOUSE_MIN_PERF:-70}"; exit 1; }
fi
```

## Rollback dry-run (verify rollback path exists)

```bash
# List recent prod deploys — confirms there's a previous deploy to roll back to
vercel ls --prod --token "$VERCEL_TOKEN" 2>/dev/null | head -5
prev=$(vercel ls --prod --token "$VERCEL_TOKEN" 2>/dev/null \
  | awk 'NR>1 && /https:\/\//{print $2; exit}')
if [ -n "$prev" ]; then
  echo "OK   rollback target available: $prev"
else
  echo "WARN no previous prod deploy — rollback unavailable on first deploy"
fi
```

## Output format

Emit one line per check, then a summary block:

```
OK   / -> 200
OK   /pricing -> 200
OK   /api/health -> 200
OK   TLS valid for example.com
Lighthouse perf: 92
OK   rollback target available: my-app-prev.vercel.app

PASS  claude-design-post-deploy: 6/6 checks
```

On any FAIL, exit non-zero and surface the failed check first. **Never** report PASS if any check failed.

## Outcomes

| Result | Action |
|--------|--------|
| All checks pass | Report PASS, return to caller, allow `--prod` promotion |
| HTTP smoke fails | Report failed routes; offer `vercel rollback` immediately |
| Lighthouse below threshold | Report scores; ask user whether to proceed or block |
| TLS/DNS fails | Report; verify `vercel domains inspect` and DNS records |
| No rollback target | Warn but don't fail (first deploy is legitimate) |

## Edge cases

- **Cold start delays:** Some preview URLs take 2-5s on first hit. Retry once with `--max-time 15` before failing.
- **Auth-protected previews:** If `curl` returns 401, the deployment has Vercel password protection enabled — surface that to the user, don't treat as failure.
- **Geographic redirects:** 301/302 to a localized path is healthy; follow with `-L` if `EXPECTED_ROUTES` includes it.
- **Lighthouse on tiny sites:** Static sites may score 100 trivially; don't celebrate, the threshold is a floor not a target.

## Composition with other skills

- Run **after** `vercel-watch` confirms `READY`.
- Run **before** the prod-deploy approval gate in `claude-design-vercel-deployment-orchestrator`.
- Pair with `agent-browser` for visual/interaction smoke checks beyond HTTP codes.
- Pair with `verification-before-completion` to enforce "no PASS without evidence."
