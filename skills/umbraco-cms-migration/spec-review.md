---
name: spec-review
description: >-
  10-point automated quality review on a proposed Umbraco schema. Catches
  Rule 2 violations, missing SEO fields, alias mismatches, and structural
  gaps before user approval. Use automatically after Skill 2 and before
  presenting schema for approval or proceeding to Management API creation.
---

# Skill 2.5: spec-review

Use this skill automatically after generating a schema proposal (Skill 2) and BEFORE presenting it for user approval or proceeding to Management API creation (Skill 3).

**Goal:** Run a 10-point automated quality review on the proposed Umbraco schema. Catch structural violations, missing fields, alias mismatches, and SEO gaps before the user reviews the proposal. HIGH-severity violations BLOCK progression to Phase 3 (Management API writes).

**When to invoke:**
- Automatically after Skill 2 generates a schema proposal (Rule 9)
- On manual request: `"review the schema"`, `"spec review"`, `"quality check"`
- Before any Management API write operation (Skill 3)

**10-Point Quality Checklist:**

| # | Check | What to Verify | Severity if Failed |
|---|---|---|---|
| 1 | **Rule 1-2: Site Root + DocType Architecture** | New project has a unique site/root node (never reused). Every major route has a dedicated document type — no `marketingPage` reused for multiple page shells. | **CRITICAL** |
| 2 | **Rule 3-4: Reusable Types + Project Isolation** | Only block types and entity types are shared across pages. No content bleed from previous projects — all content nodes, media, navigation are project-scoped. | **CRITICAL** |
| 3 | **Rule 5-6: Setup Checklist + API Separation** | All 12 Site Setup Checklist items are present (root node, siteSettings, page docTypes, content nodes, media folder, navigation, footer, SEO defaults, start item, revalidation map, sitemap, preview config). Management API is never proposed for frontend rendering — Delivery API only. | **CRITICAL** |
| 4 | **Field Coverage** | Every visible content area on every frontend page has a corresponding CMS property. No frontend sections are left hardcoded with no CMS mapping. Count fields per page; verify no gaps. | **HIGH** |
| 5 | **Alias Consistency** | Every CMS property alias matches the corresponding frontend TypeScript interface property or component prop. Naming convention is consistent (camelCase vs PascalCase aligned with framework). No orphaned aliases that exist in CMS but have no frontend consumer. | **HIGH** |
| 6 | **Block List Composition** | Block List items are correctly typed (each block references the right element type). Min/max constraints are sensible (0+ for optional, 1+ for required). Block types are grouped logically (hero, content, CTAs). No block type is defined but unused by any page. | **HIGH** |
| 7 | **SEO Completeness** | Every page document type includes: `seoTitle`, `seoDescription`, `ogTitle`, `ogDescription`, `ogImage`, `canonicalUrl`, `noIndex`, `noFollow`. JSON-LD structured data types are identified for relevant pages (Article for blog posts, Organization for home, FAQPage for FAQs, etc.). | **HIGH** |
| 8 | **Revalidation Mapping** | Every document type has a route path mapping for cache invalidation. Slug-based types (blogPost, journalPost, event) have dynamic path templates. Multi-locale sites have locale-expanded paths. No document type is left without a revalidation entry. | **MEDIUM** |
| 9 | **Media Coverage** | All image/media fields include alt text properties (not just URL). A media URL resolver (`resolveUmbracoMediaUrl()`) is planned. Framework-specific image optimization config is identified (Next.js `remotePatterns`, Nuxt image domains, etc.). No raw `image.url` usage is planned in the frontend. | **MEDIUM** |
| 10 | **SiteSettings + Frontend Alignment** | SiteSettings document type covers navigation, footer, and global defaults. Every CMS field traces to a frontend consumption path: CMS property → Delivery API response → TypeScript interface → component prop → rendered output. No CMS field exists without a corresponding frontend consumer. | **MEDIUM** |

**Severity Levels:**

| Level | Meaning | Action |
|---|---|---|
| **CRITICAL** | Core Rule violation — fundamental architecture error | BLOCKS progression. Must fix and re-run spec-review. |
| **HIGH** | Significant gap — missing fields, broken aliases, incomplete coverage | BLOCKS progression. Must fix and re-run spec-review. |
| **MEDIUM** | Improvement needed — incomplete mappings, missing optimizations | Flagged. Does not block progression but must be tracked for resolution. |
| **LOW** | Minor — naming convention nit, documentation gap | Noted. Non-blocking. |

**Hard Gate — HIGH and CRITICAL violations:**

```
┌─────────────────────────────────────────────────────────┐
│  HARD GATE: Any CRITICAL or HIGH severity finding       │
│  BLOCKS progression to Skill 3 (Management API writes). │
│                                                         │
│  The schema MUST NOT be created via Management API      │
│  until all CRITICAL and HIGH violations are resolved    │
│  and spec-review is re-run with a passing score.        │
│                                                         │
│  Presenting a schema with unresolved HIGH violations    │
│  to the user for approval is a Rule 9 violation.        │
└─────────────────────────────────────────────────────────┘
```

**Steps:**

1. **LOAD the schema proposal** — read the full Skill 2 output: document types, property lists, block types, entity types, site setup plan.
2. **RUN each of the 10 checklist items** — for each check, examine the proposal against the verification criteria. Be systematic: work through checks 1-10 in order.
3. **ASSIGN severity** to each finding using the severity table above. A single check item can produce multiple findings (e.g., two pages missing SEO fields = two HIGH findings under check 7).
4. **CALCULATE quality score** — see scoring formula below.
5. **PRODUCE the Spec Review Report** — output the findings table, quality score, and gate verdict.
6. **If CRITICAL or HIGH findings exist:** DO NOT proceed to Skill 3. Fix the issues in the schema proposal and re-run Skill 2.5. Loop until the gate is clear.
7. **If only MEDIUM or LOW findings:** flag them for tracking but allow progression. Note them in the report's "Deferred Issues" section.

**Quality Score Formula:**

```
Score = (Checks with zero CRITICAL/HIGH findings / Total checks) × 100

Thresholds:
  100%  = CLEAN — All 10 checks pass with no CRITICAL or HIGH findings
  90%   = GOOD — 9 of 10 checks pass; at most 1 check has HIGH findings
  80%   = ACCEPTABLE — 8 of 10 checks pass; at most 2 checks have HIGH findings
  70%   = NEEDS WORK — 7 of 10 checks pass; 3+ checks have HIGH findings
  <70%  = FAIL — 4+ checks have CRITICAL or HIGH findings

Gate: Score must be 100% AND zero CRITICAL AND zero HIGH findings to pass.
Any CRITICAL or HIGH finding = GATE CLOSED.
```

**Response Template:**

```
Spec Review Report — Skill 2.5
───────────────────────────────
Project: <project name>
Schema: <N> document types, <N> block types, <N> entity types
Review Date: <ISO 8601 timestamp>

Quality Score: <N>/10 checks passing = <percentage>%
Gate Verdict: <GATE OPEN — proceed to approval / GATE CLOSED — fix violations>

┌────┬────────────────────────────────┬──────────┬──────────────────────────────────────┐
│  # │ Check                          │ Severity │ Finding                              │
├────┼────────────────────────────────┼──────────┼──────────────────────────────────────┤
│  1 │ Rule 1-2: Root + DocType       │ PASS     │ All routes have dedicated docTypes   │
│  2 │ Rule 3-4: Reuse + Isolation    │ PASS     │ Only block/entity types shared       │
│  3 │ Rule 5-6: Setup + API Sep      │ CRITICAL │ Missing revalidation path map        │
│  4 │ Field Coverage                 │ HIGH     │ /events page: 3 hardcoded sections   │
│  5 │ Alias Consistency              │ PASS     │ All aliases match frontend interfaces│
│  6 │ Block List Composition         │ HIGH     │ heroBlock missing min/max constraints│
│  7 │ SEO Completeness               │ HIGH     │ /contact page missing ogImage field  │
│  8 │ Revalidation Mapping           │ MEDIUM   │ blogPost slug template not defined   │
│  9 │ Media Coverage                 │ MEDIUM   │ No alt text field on gallery images  │
│ 10 │ SiteSettings + Frontend        │ PASS     │ Navigation/footer mapped, all fields │
│    │                                │          │ have consumption paths               │
└────┴────────────────────────────────┴──────────┴──────────────────────────────────────┘

Summary:
  CRITICAL: 1 — Site setup checklist incomplete (missing revalidation path map)
  HIGH: 3 — Field coverage gaps, Block List constraints, SEO field missing
  MEDIUM: 2 — Revalidation slug template, media alt text
  LOW: 0

Gate: CLOSED — 1 CRITICAL + 3 HIGH violations must be resolved before Skill 3.

Required Actions (to re-open gate):
  1. [CRITICAL] Add revalidation path map to site setup plan (Check 3)
  2. [HIGH] Add CMS fields for 3 hardcoded sections on /events (Check 4)
  3. [HIGH] Set min=0 max=10 on heroBlock Block List (Check 6)
  4. [HIGH] Add ogImage field to contactPage document type (Check 7)

Deferred Issues (non-blocking):
  - blogPost slug template → address before revalidation wiring
  - Gallery image alt text → address during media handling (Skill 8)

Next Step: Fix all CRITICAL and HIGH violations, then re-run Skill 2.5.
```

**Guardrails:**
- Never skip spec-review before presenting a schema for approval — Rule 9 is MANDATORY
- Never proceed to Skill 3 with unresolved CRITICAL or HIGH findings
- Never downgrade a finding's severity to pass the gate — the gate exists for a reason
- Run spec-review FRESH every time the schema proposal changes — do not cache results
- The quality score is a measurement tool, not a negotiation — if it says FAIL, it fails
- MEDIUM findings are tracked but do not block — they must be resolved before Skill 14 (certification)
- If spec-review is re-run after fixes, all 10 checks must be re-evaluated — fixes can introduce new issues
- The response table must list ALL findings, not just failures — passing checks are evidence of quality
