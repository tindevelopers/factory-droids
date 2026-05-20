---
name: final-migration-certification
description: >-
  20-item Definition of Done certification producing auditable evidence that
  every CMS field has a verified, traceable consumption path from Umbraco
  through Delivery API through TypeScript interface through component binding
  through rendered output. Includes hard gates (D1-D10), soft gates (D11-D20),
  weighted scoring, and Graphify visual certification. Use after all
  implementation phases complete, before declaring migration done.
---

# Skill 14: final-migration-certification

Use this skill after all implementation phases complete (Phases 1-13), before declaring migration done. Also invoke manually via `"certify migration"`, `"final check"`, or `"is it done?"`.

**Goal:** Produce an auditable, visual certification that the migration is complete and correct. Every CMS field must have a verified, traceable consumption path from Umbraco through Delivery API through TypeScript interface through component binding through rendered output, confirmed by fresh verification evidence.

**Definition of Done (Permanent DoD Rule):**

*A migration is NOT complete unless every CMS field created has a verified, traceable consumption path from Umbraco through Delivery API through TypeScript interface through component binding through rendered output, confirmed by fresh verification evidence.*

**DoD Checklist — 20 Items:**

---

#### TIER 1 — HARD GATES (D1–D10, must pass, cannot override)

*Every item in this tier gates certification. Any failure BLOCKS certification regardless of overall score.*

| # | Check | Verification Method | How It Would Have Caught Black Ivory Failures |
|---|-------|--------------------|---------------------------------------------|
| **D1** | Build passes | `npm run build` (or framework equivalent) — exit code 0, zero errors | — |
| **D2** | Typecheck passes | `npm run typecheck` (or `tsc --noEmit`) — exit code 0 | — |
| **D3** | Lint passes | `npm run lint` — exit code 0, zero warnings above threshold | — |
| **D4** | Delivery API works for all document types | `curl -H "Api-Key: $KEY" -H "Start-Item: $GUID" "$API_URL/content?filter=contentType:$alias"` for every docType — HTTP 200, non-null properties, expected property count matches schema | Start-Item header missing would show 404/empty response |
| **D5** | Management API not exposed to client code | `grep -r "umbraco-management-api\|/umbraco/backoffice\|Api-Key.*umbraco" app/ --include="*.ts" --include="*.tsx" --include="*.js"` — zero matches | — |
| **D6** | No secrets in repository | `grep -rE "(Api-Key|Bearer|SECRET|PASSWORD|TOKEN)\s*=" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.env*"` — zero matches in committed files | — |
| **D7** | Every exported fetcher is imported AND called | `grep -r "import.*getXxxPage" app/` AND `grep -r "getXxxPage()" app/` for every exported fetcher — each fetcher has ≥1 import site AND ≥1 call site | 2 dead fetchers (getEventsPage, getJournalPage) |
| **D8** | Every CMS field consumed by at least one component | Per-field `grep -rw "fieldName" app/ --include="*.ts" --include="*.tsx"` — every field has ≥1 code reference with context-appropriate search | 72 dead SEO fields |
| **D9** | Every route wired to its page-level fetcher | Per-route verification: page imports its fetcher, calls it, reads ≥80% of available fields | 2 pages entirely hardcoded |
| **D10** | All Block List items visible in rendered output | Delivery API response `items.length > 0` AND page component maps over block items AND each block type has a corresponding component in code | 92/111 invisible Block List items |

---

#### TIER 2 — SOFT GATES (D11–D20, should pass, can override with documented exceptions)

*Items in this tier do not block certification but lower the certification score if failing. Any soft gate failure must be documented with a reason and a remediation plan.*

| # | Check | Verification Method |
|---|-------|--------------------|
| **D11** | SEO fields consumed by `generateMetadata()` | `grep -rn "seoTitle\|seoDescription\|ogImage\|canonicalUrl" app/ --include="*.ts" --include="*.tsx"` — every page has metadata function consuming CMS SEO fields |
| **D12** | SiteSettings fields consumed by layout/header/footer | `grep -rn "siteSettings\." app/ --include="*.ts" --include="*.tsx"` — navigation, footer, social links, and global settings consumed by shared layout components |
| **D13** | Sitemap includes all CMS-driven routes | `curl "$FRONTEND_URL/sitemap.xml"` — all routes present, no broken URLs | 
| **D14** | Robots.txt respects `noIndex`/`noFollow` from CMS | `curl "$FRONTEND_URL/robots.txt"` — content matches CMS SiteSettings robots configuration |
| **D15** | Revalidation webhook functional | `curl -X POST "$WEBHOOK_URL" -H "Authorization: Bearer $SECRET" -d '{"type":"test"}'` — HTTP 200, frontend rebuild triggered or cache cleared |
| **D16** | All media URLs resolved through resolver | `grep -rn "\.url\b" app/ --include="*.ts" --include="*.tsx"` — all `image.url` accesses go through `resolveUmbracoMediaUrl()` |
| **D17** | Preview mode functional (if enabled) | Navigate preview route with valid token → CMS draft content renders. Exit preview → published content renders. |
| **D18** | No broken internal links | `grep -rn "href=" app/ --include="*.tsx" --include="*.jsx"` — all internal links point to existing routes, no 404s on navigation |
| **D19** | All images have alt text | `grep -rn "<img\|<Image\|next/image" app/ --include="*.tsx" --include="*.jsx"` — every `<img>` or `<Image>` has `alt` prop, either from CMS or a sensible fallback |
| **D20** | Dynamic routes resolve correctly | `curl "$API_URL/content?filter=contentType:$entityType"` for each dynamic entity type (blogPost, journalPost, event, etc.) — all slug-based routes return content |

---

**Certification Score Thresholds:**

The certification score is computed as a weighted average of: wiring completeness score (Skill 10.5, weighted 2.0) + route certification score (Skill 12, weighted 1.5) + drift alignment score (Skill 13, weighted 1.5) + DoD checklist completion (weighted 1.0). Hard gate failures (D1-D10) zero out their category weight and block certification.

| Score Range | Verdict | Action |
|------------|---------|--------|
| **95–100%** | **CERTIFIED** | Migration is complete. All hard gates pass. Zero CRITICAL gaps. Proceed to completion. |
| **80–94%** | **CONDITIONAL PASS** | Non-critical gaps are documented. Some soft gates may have documented exceptions. All hard gates pass. User decides. |
| **60–79%** | **FAIL** | Significant gaps exist. Fix all CRITICAL and HIGH gaps before re-running certification. |
| **< 60%** | **BLOCKED** | Critical gaps exist. At least one hard gate has failed. Do NOT deploy. |

**Additional Hard Gate Override Rules (override percentage score):**

- Any D1-D10 hard gate failure → **BLOCKED**
- Any CRITICAL gap from Skills 10.5, 12, or 13 → **BLOCKED**
- Zero routes below 90% from Skill 12
- Zero HIGH-severity drifts from Skill 13
- Wiring completeness score (Skill 10.5) below 95% → maximum certification is CONDITIONAL, not CERTIFIED
- Graphify visual certification unavailable or graph not updated → cannot achieve CERTIFIED (downgrades to CONDITIONAL at best)

**Steps:**

1. **GATHER ALL VERIFICATION EVIDENCE:** Collect wiring completeness, route certification, drift detection, and all phase retrospectives. Verify all evidence is FRESH.

2. **RUN THE 20-ITEM DoD CHECKLIST:** Work through D1-D10 (Hard Gates) then D11-D20 (Soft Gates). Hard gate failures are terminal. For each check: record command, output, timestamp, confidence.

3. **GENERATE GRAPHIFY VISUAL CERTIFICATION (if available):** Build final wiring graph, generate coverage graphs. Output: interactive HTML graph with color-coded nodes. If Graphify unavailable: note degraded mode.

4. **CALCULATE CERTIFICATION SCORE:**
   ```
   Weighted Certification Score = 
     (Wiring Score × 2.0 + Route Score × 1.5 + Drift Score × 1.5 + DoD Score × 1.0) / 6.0
   
   DoD Score = (Hard Gate Score × 0.7 + Soft Gate Score × 0.3)
   ```

5. **APPLY GATE RULES:** Block if any D1-D10 failure or CRITICAL gap; CERTIFIED if ≥ 95% and all hard gates pass.

6. **PRODUCE CERTIFICATION REPORT:** JSON report with all scores, checklist items, gaps, verdict, and recommendations.

**Guardrails:**
- Certification is the FINAL gate — nothing proceeds past it without a passing verdict
- Evidence must be FRESH — re-run EVERY verification command
- Hard gate failures (D1-D10) override ALL score calculations
- Do NOT proceed to production with a FAIL or BLOCKED verdict
- CONDITIONAL PASS requires explicit user approval
- Graphify visual certification is strongly recommended but not mandatory — unavailable degrades max verdict to CONDITIONAL
- The certification report is an auditable artifact — include exact commands, outputs, and timestamps
- Independent verification (Rule 12): run certification as if you had never seen the codebase before
- If re-running certification after fixes, run the FULL checklist again
- The certification score is a measurement, not a negotiation — if it says BLOCKED, it means BLOCKED
