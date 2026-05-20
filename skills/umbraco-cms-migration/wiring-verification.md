---
name: wiring-verification
description: >-
  Prove every CMS field is consumed by the frontend through 6-layer verification:
  build-time, Delivery API responses, fetcher consumption, component binding,
  route-by-route analysis, and visual (deferred). Produces completeness score
  and gap manifest. Use automatically after Phase 7 (component wiring) and
  before Phase 8 (SEO wiring). Also invoke manually via "verify wiring" or
  "wiring completeness".
---

# Skill 10.5: wiring-verification

Use this skill automatically after Phase 7 (Frontend Component Wiring) and before Phase 8 (SEO Wiring). Also invoke manually via `"verify wiring"`, `"check field consumption"`, or `"wiring completeness"`.

**Goal:** Prove that every CMS field is consumed by the frontend — not just that "pages render" or "build passes." Every field must have a traceable consumption path through all 6 verification layers.

**6-Layer Verification Framework (Bottom-Up):**

```
Layer 6: VISUAL VERIFICATION (DEFERRED PLACEHOLDER)
  └─ DOM content inspection via agent-browser
     └─ "Does the rendered HTML contain the CMS text value?"
     └─ STATUS: Deferred to future milestone. Placeholder only — no procedure yet.

Layer 5: ROUTE-BY-ROUTE VERIFICATION
  └─ For each route: trace field → fetcher → component → rendered output
     └─ "Does /about render all aboutPage fields?"

Layer 4: COMPONENT BINDING VERIFICATION
  └─ For each CMS property in TypeScript interface: grep component JSX
     └─ "Is seoTitle referenced in generateMetadata()?"

Layer 3: FETCHER CONSUMPTION VERIFICATION
  └─ For each exported fetcher: verify imported AND called by a page
     └─ "Is getEventsPage() imported by app/events/page.tsx?"

Layer 2: DELIVERY API RESPONSE VERIFICATION
  └─ curl every document type endpoint, verify 200 + properties present
     └─ "Does /api/content/homePage return heroHeading with a non-null value?"

Layer 1: BUILD-TIME VERIFICATION
  └─ TypeScript compilation, ESLint, typecheck
     └─ "Does the code compile with zero errors?"
```

**Steps:**

---

**Step 1: Layer 1 — Build-Time Verification**

Run the framework-specific build, typecheck, and lint commands.

- **Next.js / React / Vue / Svelte / Astro:** `npm run build && npm run typecheck && npm run lint`
- **Angular:** `ng build --prod && ng lint`
- **.NET MVC:** `dotnet build && dotnet format --verify-no-changes`
- **Vanilla JS:** `npm run build && npm run lint` (skip typecheck if no TS/Flow)

**Gate:** Zero errors from all three commands. Warnings are acceptable but must be counted.

**Evidence to capture:**
- Build exit code (must be 0)
- Typecheck exit code (must be 0, or N/A for vanilla JS)
- Lint exit code (must be 0)
- Count of warnings (build + typecheck + lint combined)

---

**Step 2: Layer 2 — Delivery API Response Verification**

For EVERY document type alias created in the schema, curl the Delivery API and verify:
1. HTTP 200 response
2. Properties object is present and non-empty
3. Each property has a non-null value (test content from seeding should be visible)
4. Block List properties have `items` array with `count > 0`
5. Media properties return valid URLs (not null, not empty string)

**Procedure:**

```bash
# For each document type alias:
for alias in homePage aboutPage contactPage ...; do
  echo "=== Checking: $alias ==="
  curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -H "Api-Key: $UMBRACO_DELIVERY_API_KEY" \
    -H "Start-Item: $UMBRACO_START_ITEM_GUID" \
    "$UMBRACO_DELIVERY_API_URL/content?filter=contentType:$alias" \
    | jq '.items[0].properties | keys | length'
done
```

**For each document type, verify:**
- `HTTP_STATUS` is 200
- Property count matches the expected count from the approved schema (Skill 2)
- All property values are present (not null, not empty)
- Block List item arrays have `items.length > 0`
- Media URLs are valid (start with `http` or `/media/`)

**Gate:** ALL document types return HTTP 200 with all expected properties present and non-null. Any document type returning 4xx/5xx, missing properties, or null values is a CRITICAL gap. Block Lists with zero items are a HIGH gap.

---

**Step 3: Layer 3 — Fetcher Consumption Verification (Dead Fetcher Detection)**

Verify every exported fetcher function is imported by at least one page/component AND is actually called (invoked).

**Procedure — Dead Fetcher Detection (export → import → call chain):**

1. **IDENTIFY all exported fetchers:** Extract all exported function names from the fetcher/query module.
   ```bash
   grep -oP 'export (async )?function \K\w+' lib/umbraco/queries.ts
   # or for const exports:
   grep -oP 'export const \K\w+' lib/umbraco/queries.ts
   ```

2. **IMPORT CHECK — for each fetcher, verify it is imported:**
   ```bash
   for fetcher in $(list_exported_fetchers); do
     echo "=== Import check: $fetcher ==="
     grep -r "import.*$fetcher" app/ --include="*.ts" --include="*.tsx" || echo "  DEAD: not imported"
   done
   ```

3. **CALL CHECK — for each fetcher, verify it is invoked:**
   ```bash
   for fetcher in $(list_exported_fetchers); do
     echo "=== Call check: $fetcher ==="
     grep -r "$fetcher()" app/ --include="*.ts" --include="*.tsx" || echo "  DEAD: imported but never called"
   done
   ```

4. **CLASSIFY each fetcher:**
   - **CONSUMED:** Imported AND called by at least one page → PASS
   - **ORPHANED:** Imported but never called → HIGH gap (dead code)
   - **DEAD:** Not imported at all → CRITICAL gap (unwired fetcher)
   - **DUPLICATE:** Multiple fetchers for the same document type → HIGH gap (confusion)

**Gate:** Zero DEAD fetchers (not imported) and zero ORPHANED fetchers (imported but uncalled). Every exported fetcher must have at least one import site AND at least one call site.

---

**Step 4: Layer 4 — Component Binding Verification (Per-Field Consumption Check)**

For every CMS property defined in every TypeScript interface, verify it is referenced somewhere in the component code.

**Procedure — Per-Field grep-based Consumption Check:**

1. **EXTRACT all CMS properties** from each TypeScript interface:
   ```bash
   # List all interface property names for a given document type
   grep -A 50 'interface HomePage' app/types/umbraco.ts | grep -oP '^\s+\w+' | tr -d ' ' | sort
   ```

2. **CHECK each property** for consumption in the component tree:
   ```bash
   for prop in $(list_properties_for_type "HomePage"); do
     echo "=== Field: $prop ==="
     grep -r "$prop" app/ --include="*.tsx" --include="*.ts" | head -5 || echo "  UNCONSUMED: no references found"
   done
   ```

3. **CATEGORIZE each property:**
   - **WIRED:** Found in component JSX or logic → PASS (count the reference sites)
   - **INTERFACE-ONLY:** In interface but not in component code → HIGH gap
   - **UNCONSUMED:** Nowhere in the frontend codebase → CRITICAL gap
   - **AMBIGUOUS:** Generic name like `title` that matches many files → manual review needed

4. **SPECIAL CHECKS for shared fields:**
   - **SEO fields** (`seoTitle`, `seoDescription`, `ogTitle`, `ogDescription`, `ogImage`, `canonicalUrl`, `noIndex`, `noFollow`): Must be consumed by `generateMetadata()` or equivalent. Grep the metadata function for each field.
   - **SiteSettings fields** (navigation, footer, socialLinks, etc.): Must be consumed in layout/header/footer components. Grep layout files for each field.
   - **Block List fields**: Each block type must have a corresponding rendering component. Grep for the Block List property name in the page component to verify block iteration.

5. **PER-TYPE SUMMARY:**
   ```
   aboutPage: 14/14 wired (100%) — PASS
   homePage: 18/20 wired (90%) — 2 UNCONSUMED
   eventsPage: 0/12 wired (0%) — CRITICAL: page is hardcoded entirely
   ```

**Gate:** Zero UNCONSUMED fields (CRITICAL). Zero INTERFACE-ONLY fields (HIGH). Every CMS property must be referenced somewhere in the component code. If a field exists in CMS and TypeScript but has zero code references, it is a dead field — a Rule 7 violation.

---

**Step 5: Layer 5 — Route-by-Route Verification**

For each frontend route, verify the full consumption chain: route → page component → fetcher import → fetcher call → field consumption → rendered output.

**Procedure:**

1. **LIST all frontend routes** from the audit (Skill 1 output or framework routing configuration).

2. **For each route, verify the chain:**
   - **Route file exists** → check the page/route file is present
   - **Page imports its fetcher** → grep the page file for `import.*getXxxPage`
   - **Page calls its fetcher** → grep the page file for `getXxxPage()`
   - **Page reads CMS fields** → count how many CMS properties from the interface are referenced in the page component
   - **SEO fields consumed** → verify the page's metadata function reads CMS SEO fields
   - **Block Lists rendered** → verify the page maps over Block List items and renders each block

3. **Calculate per-route field coverage score:**
   ```
   Per-Route Score = (Fields consumed in component code / Total fields in document type) × 100

   Thresholds:
     ≥ 90% = PASS (fully wired)
     80-89% = WARN (minor gaps — flag but don't block)
     60-79% = FAIL (significant gaps — must fix)
     < 60% = CRITICAL (page is mostly hardcoded — blocked)
     0% = CRITICAL (page is entirely hardcoded — blocked)
   ```

4. **Per-route verification table:**

| Route | DocType | Fields (wired/total) | Score | SEO | Blocks | Status |
|-------|---------|---------------------|-------|-----|--------|--------|
| `/` | homePage | 20/20 | 100% | ✓ | ✓ | PASS |
| `/about` | aboutPage | 14/14 | 100% | ✓ | ✓ | PASS |
| `/events` | eventsPage | 0/12 | 0% | ✗ | ✗ | CRITICAL |
| `/contact` | contactPage | 9/10 | 90% | ✓ | ✓ | PASS |
| `/journal` | journalListingPage | 6/8 | 75% | ✓ | ✓ | FAIL |

**Gate:** Zero routes below 80%. Any route below 60% is a CRITICAL gate-blocker. Routes at 80-89% are warnings that must be tracked for resolution before final certification (Skill 14).

---

**Step 6: Layer 6 — Visual Verification (Deferred Placeholder)**

**Status:** DEFERRED. This layer is a placeholder for a future milestone where `agent-browser` will be used to load each route in a real browser, inspect the DOM, and verify that CMS content values appear in the rendered HTML.

**Future procedure (not yet implemented):**
- Load each route via `agent-browser`
- Inspect DOM for CMS text values using selectors
- Compare rendered text against Delivery API response values
- Verify images render with correct alt text
- Verify Block List items are visible in the DOM

**Current action:** Skip this layer. Record `"status": "DEFERRED"` in the wiring completeness report. This layer does not block the gate.

---

**Step 7: Calculate Wiring Completeness Score**

Combine results from all active layers (1-5) into an overall wiring completeness score.

**Scoring Formula:**

```
Layer Score = (Passing checks / Total checks) for that layer

Overall Score = weighted average of active layer scores:
  Layer 1 (build): weight 1.0  — gate layer, all-or-nothing
  Layer 2 (api):   weight 1.0  — gate layer, all endpoints must respond
  Layer 3 (fetcher): weight 1.5 — double-weighted: dead fetchers are critical
  Layer 4 (component): weight 1.5 — double-weighted: per-field consumption is core
  Layer 5 (route): weight 1.0  — per-route coverage
  Layer 6 (visual): weight 0.0 — deferred

Overall Score = Σ(Layer Score × weight) / Σ(weights)
              = (L1×1.0 + L2×1.0 + L3×1.5 + L4×1.5 + L5×1.0) / 5.0
              = percentage 0–100%
```

**Gate Thresholds:**

| Overall Score | Verdict | Action |
|--------------|---------|--------|
| 95–100% | **PASS** — Wiring verified | Proceed to next phase (SEO Wiring) |
| 80–94% | **WARN** — Minor gaps | Fix gaps OR document as deferred issues; proceed with caution |
| 60–79% | **FAIL** — Significant gaps | GATE CLOSED. Fix all CRITICAL and HIGH gaps, then re-run Skill 10.5 |
| < 60% | **CRITICAL** — Severely incomplete | GATE CLOSED. Do NOT proceed. Full wiring pass required. |

**Additional hard gate conditions (override the percentage score):**
- Any Layer 1 failure (build/typecheck/lint error) → GATE CLOSED regardless of score
- Any Layer 2 endpoint returning 4xx/5xx → GATE CLOSED regardless of score
- Any DEAD fetcher (Layer 3, not imported) → GATE CLOSED regardless of score
- Any route at < 60% (Layer 5) → GATE CLOSED regardless of score
- Layer 6 (visual) is deferred — never blocks the gate

**Gap Severity Classification:**

| Severity | Definition | Example |
|----------|-----------|---------|
| **CRITICAL** | Dead fetcher (not imported), entirely hardcoded route, build failure, 4xx/5xx API response, field with zero code references | `getEventsPage()` exported but never imported |
| **HIGH** | Orphaned fetcher (imported but uncalled), unconsumed field (in interface but not in component), Block List with zero visible items | `getJournalPage()` imported but never called |
| **MEDIUM** | Route below 90% but above 80%, field consumed but with naming mismatch, lint warning count above threshold | `/journal` at 85% coverage |
| **LOW** | Naming convention inconsistency, missing alt text on images, redundant interface fields | `hero_kicker` vs `heroKicker` snake_case mismatch |

---

**Response Template:**

```json
{
  "project": "<project name>",
  "timestamp": "<ISO 8601>",
  "overall_score": 0.0,
  "gate_verdict": "<PASS | WARN | FAIL | CRITICAL>",
  "layers": {
    "layer_1_build": {
      "score": 0.0,
      "status": "<PASS | FAIL>",
      "build_exit_code": 0,
      "typecheck_exit_code": 0,
      "lint_exit_code": 0,
      "warnings": 0,
      "errors": 0
    },
    "layer_2_delivery_api": {
      "score": 0.0,
      "status": "<PASS | FAIL>",
      "endpoints_checked": 0,
      "endpoints_passing": 0,
      "endpoints_failing": [],
      "missing_properties": [],
      "null_values": []
    },
    "layer_3_fetcher_consumption": {
      "score": 0.0,
      "status": "<PASS | FAIL>",
      "fetchers_total": 0,
      "fetchers_consumed": 0,
      "fetchers_orphaned": [],
      "fetchers_dead": [],
      "dead_fetcher_count": 0
    },
    "layer_4_component_binding": {
      "score": 0.0,
      "status": "<PASS | FAIL>",
      "fields_total": 0,
      "fields_wired": 0,
      "fields_unconsumed": [],
      "per_type_summary": [
        { "docType": "homePage", "wired": 20, "total": 20, "score": 1.0 },
        { "docType": "aboutPage", "wired": 14, "total": 14, "score": 1.0 }
      ]
    },
    "layer_5_route_by_route": {
      "score": 0.0,
      "status": "<PASS | FAIL | WARN>",
      "routes_total": 0,
      "routes_passing": 0,
      "routes_below_threshold": [],
      "per_route_summary": [
        { "route": "/", "docType": "homePage", "wired": 20, "total": 20, "score": 1.0, "seo": true, "blocks": true }
      ]
    },
    "layer_6_visual": {
      "score": null,
      "status": "DEFERRED",
      "note": "Visual verification via agent-browser is deferred to a future milestone."
    }
  },
  "gaps": [
    {
      "severity": "CRITICAL",
      "layer": 3,
      "type": "dead_fetcher",
      "fetcher": "getEventsPage",
      "description": "Fetcher exported but never imported by any page"
    },
    {
      "severity": "HIGH",
      "layer": 4,
      "type": "unconsumed_field",
      "docType": "homePage",
      "field": "heroKicker",
      "description": "Field in CMS and interface but not referenced in component code"
    }
  ],
  "gap_summary": {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0
  }
}
```

**Guardrails:**
- Never skip a layer — all 5 active layers must be run, even if earlier layers pass
- Layer 6 (visual) is explicitly deferred — do not attempt DOM verification
- Dead fetchers are CRITICAL, not warnings — a fetcher that is never imported means a page is entirely hardcoded
- Per-field consumption is non-negotiable — every CMS field must have at least one code reference
- The grep for field consumption must be case-sensitive and exact-match — `heroTitle` matches `heroTitle` but NOT `heroTitleText` (use `grep -w` for word-boundary matching)
- Generic field names (`title`, `description`, `image`) require context-aware grep — check the importing file to narrow scope
- Block List rendering verification requires BOTH: (a) Delivery API `items.length > 0` AND (b) page component maps over items
- Route coverage below 60% means the page is still substantially hardcoded — do not let it pass
- Re-run all verification commands FRESH — never use cached results from earlier skill invocations
- The wiring completeness score is a measurement tool, not a negotiation — if it says FAIL, it fails
- If gaps are found, fix them and re-run Skill 10.5 from scratch — partial re-runs miss cascading issues
- This skill is a hard gate — Skill 14 (certification) depends on a passing wiring verification score
