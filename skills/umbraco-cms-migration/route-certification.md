---
name: route-certification
description: >-
  Per-route certification using Graphify shortest-path queries. For every
  frontend route, trace every CMS field through the full consumption chain
  and produce a per-route certification score (0-100%). Gates routes below
  90% threshold. Use automatically after wiring verification (Skill 10.5)
  and before drift detection (Skill 13).
---

# Skill 12: route-certification

Use this skill automatically after wiring verification (Skill 10.5) and before drift detection (Skill 13). Also invoke manually via `"certify routes"`, `"per-route check"`, or `"route completeness"`.

**Goal:** For every frontend route, trace the full field consumption chain through Graphify shortest-path queries and produce a per-route certification score (0-100%). Verify that every CMS field associated with each route has a complete, traceable path from Umbraco through to rendered output. Routes below threshold are gated — they must be fixed before final certification (Skill 14).

**Steps:**

1. **LOAD route inventory from the frontend audit:**
   - Read the route list from Skill 1 audit output (`graphify-input/frontend/routes.md` or framework routing configuration).
   - For each route, identify: route path, page component file, expected document type alias, expected fetcher function.
   - Verify every route has a corresponding document type — no route should render with no CMS data source.

2. **For each route, trace the full consumption chain via Graphify:**
   - For each CMS field in the route's document type, run Graphify shortest-path queries to trace the field through the wiring graph:
     ```
     # Trace field through full chain
     mcp.shortest_path("<field>_cms", "<Route>_route")
     
     # Expected output example:
     # heroHeading_cms → ApiResponse_heroHeading → Interface_heroHeading
     #   → Component_heroHeading → RenderedElement_h1 → HomePage_route
     # → Path exists = field is consumed (EXTRACTED confidence)
     ```
   - If shortest-path returns no path: the field has a gap in its consumption chain.
   - If shortest-path returns a path with INFERRED or AMBIGUOUS confidence edges: the field is partially traced but unconfirmed.

3. **Verify fetcher-to-route binding:**
   - For each route, grep the page component file to confirm the correct page-level fetcher is imported and called.
   - Graphify query to confirm the edge exists: `FetcherFunction → Route [renders]`.
   - A route with no fetcher binding is fully hardcoded — a CRITICAL gap.

4. **Verify SEO field consumption per route:**
   - For each route's document type, check that all SEO fields (`seoTitle`, `seoDescription`, `ogTitle`, `ogDescription`, `ogImage`, `canonicalUrl`, `noIndex`, `noFollow`) have complete shortest-path traces to the route.
   - Graphify query: `shortest_path("seoTitle_cms", "<Route>_route")`.
   - Missing SEO consumption means the page renders with hardcoded or empty SEO tags — a HIGH gap.

5. **Verify Block List rendering per route:**
   - For routes that use Block Lists, confirm every block type defined in the document type has a corresponding rendering component with a verified consumption path.
   - Graphify query: for each `BlockType` node, verify the edge `BlockType → ComponentElement [rendered_by]` exists.
   - Missing block renderers mean Block List items returned by Delivery API are invisible — a HIGH gap.

6. **Calculate per-route certification score:**

   **Per-Route Score Formula:**
   ```
   Per-Route Score = (Fields with complete EXTRACTED-path traces / Total fields in document type) × 100

   Threshold Gates:
     ≥ 95% = CERTIFIED — Route is fully wired. No action required.
     90-94% = PASS — Minor gaps. Non-blocking; track for resolution.
     80-89% = WARN — Significant gaps. Must be fixed before certification, but does not block progression.
     60-79% = FAIL — Major gaps. GATE CLOSED for this route. Fix and re-certify.
     < 60% = CRITICAL — Route is substantially or entirely hardcoded. GATE CLOSED.
     0% = UNWIRED — Route has no CMS wiring at all. CRITICAL.

   Hard Gate: No route may proceed to final certification (Skill 14) with a score below 90%.
   Routes scoring 80-89% may proceed with documented exceptions but must be resolved post-certification.
   Routes below 80% BLOCK certification entirely.
   ```

7. **Produce the Route Certification Report:**

   Report format:

   ```
   Route Certification Report — Skill 12
   ─────────────────────────────────────
   Project: <project name>
   Timestamp: <ISO 8601>
   Total Routes: <N>

   ┌──────────┬──────────┬───────────────┬───────┬──────┬────────┬──────────────┐
   │ Route    │ DocType  │ Fields        │ Score │ SEO  │ Blocks │ Verdict      │
   │          │          │ (wired/total) │       │      │        │              │
   ├──────────┼──────────┼───────────────┼───────┼──────┼────────┼──────────────┤
   │ /        │ homePage │ 20/20         │ 100%  │ ✓    │ ✓      │ CERTIFIED    │
   │ /about   │ aboutPage│ 14/14         │ 100%  │ ✓    │ ✓      │ CERTIFIED    │
   │ /events  │ eventsPg │ 6/12          │ 50%   │ ✗    │ ✗      │ CRITICAL     │
   │ /contact │ contactPg│ 9/10          │ 90%   │ ✓    │ ✓      │ PASS         │
   │ /journal │ journalPg│ 7/8           │ 87%   │ ✓    │ ✓      │ WARN         │
   └──────────┴──────────┴───────────────┴───────┴──────┴────────┴──────────────┘

   Certification Summary:
     CERTIFIED: <N> routes
     PASS: <N> routes
     WARN: <N> routes
     FAIL: <N> routes
     CRITICAL: <N> routes
     UNWIRED: <N> routes

   Overall Route Health Score: <average of all per-route scores>%

   Gaps by Route:
     /events (50% — CRITICAL):
       - [CRITICAL] getEventsPage() fetcher exported but never imported by events page
       - [HIGH] 6 CMS fields (heroHeading, heroKicker, ctaText, seoTitle, seoDescription, ogImage) have no consumption traces
       - [HIGH] No metadata function reads SEO fields — page renders with hardcoded <title>
       - [HIGH] Block List items returned by Delivery API but no block renderer component found
     /contact (90% — PASS):
       - [MEDIUM] ogImage field traced as INFERRED — naming match but no grep confirmation
     /journal (87% — WARN):
       - [MEDIUM] featuredImage field traced as AMBIGUOUS — multiple possible component matches

   Gate Verdict: <GATE OPEN — all routes ≥ 90% / GATE CLOSED — N routes below threshold>

   Next Steps:
     - <Fix actions for each failed route>
   ```

8. **Gate enforcement:**
   - If ANY route scores below 80%: GATE CLOSED. Fix the unwired/hardcoded routes and re-run Skill 12.
   - If ALL routes score ≥ 90%: GATE OPEN. Proceed to drift detection (Skill 13).
   - If some routes score 80-89%: WARN but GATE OPEN. Document the gaps; they must be resolved before Skill 14 certification.
   - Routes scoring 90-94% are PASS but track MEDIUM findings for pre-certification resolution.

**Guardrails:**
- Every route MUST be certified — no route is excluded from the per-route check, even "simple" pages
- Shortest-path queries require Graphify to be installed and the wiring graph to be built (from Skill 4 input files)
- If Graphify is not available, fall back to Layer 5 manual route-by-route checks from Skill 10.5 as a degraded mode
- Per-route scores require fresh Graphify queries — cached graph results from earlier phases may be stale
- SEO field consumption is mandatory for every route — a route with no SEO consumption is a HIGH gap even if its content fields are wired
- Block List rendering verification requires both: (a) BlockType → ComponentElement edge exists AND (b) the page component maps over block items
- A route scoring 0% means the page is entirely hardcoded — it is consuming nothing from CMS
- Routes that share a document type (e.g., blog posts, journal posts) should be spot-checked: at least 3 instances to confirm dynamic routing
- The route certification score feeds directly into the final certification score (Skill 14) — per-route scores are aggregated for overall certification
- Do NOT claim a route is wired based on "the page renders fine" — only Graphify shortest-path traces or verified grep evidence count

**Confidence Classification for Per-Route Traces:**

| Edge Confidence | Meaning for Route Certification | Counts Toward Score? |
|----------------|-------------------------------|---------------------|
| EXTRACTED | Field consumption confirmed by grep/import/curl | YES — fully counts |
| INFERRED | Naming convention match, no code-level confirmation | YES — counts at 50% weight |
| AMBIGUOUS | Uncertain relationship, multiple interpretations | NO — must be manually verified |
| MISSING | No path found — field is unconsumed | NO — gap detected |

**Score Adjustment for Confidence:**
```
Adjusted Score = (EXTRACTED fields + INFERRED fields × 0.5) / Total fields × 100

Example:
  homePage: 18 EXTRACTED + 2 INFERRED out of 20 total
  Adjusted Score = (18 + 2×0.5) / 20 × 100 = 95% → CERTIFIED
```

**Graphify MCP queries used:**
- `shortest_path("<field>_cms", "<Route>_route")` — trace individual field to route
- `get_neighbors("<Route>_route")` — find all components and fetchers connected to a route
- `graph_stats` — summary statistics for confidence distribution
- `god_nodes` — identify routes with highest/lowest connectivity
