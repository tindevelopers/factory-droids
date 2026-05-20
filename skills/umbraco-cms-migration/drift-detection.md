---
name: drift-detection
description: >-
  Compare the Umbraco CMS schema graph against the frontend wiring graph to
  detect misalignments: alias mismatches, type incompatibilities, orphaned
  fields, stale content references, unconsumed interfaces, dead fetchers,
  block drift, and SEO drift. Produces drift manifest with severity
  classifications and fix recommendations. Use after route certification
  (Skill 12) and before final certification (Skill 14).
---

# Skill 13: drift-detection

Use this skill after route certification (Skill 12) and before final certification (Skill 14). Also invoke manually via `"detect drift"`, `"alignment check"`, `"schema vs frontend"`, or `"find mismatches"`.

**Goal:** Compare the Umbraco CMS schema graph against the frontend wiring graph to detect misalignments between what the CMS defines and what the frontend consumes. Detect alias mismatches, type incompatibilities, orphaned fields, stale content references, unconsumed interfaces, and dead fetchers. Produce a drift manifest with severity classifications and fix recommendations.

**What Drift Detection Catches:**

| Drift Type | Description | Example | Severity |
|-----------|-------------|---------|----------|
| **Alias Mismatch** | CMS property alias does not match the frontend interface property name | `hireSteps` (CMS) vs `steps` (interface) | HIGH |
| **Type Incompatibility** | CMS data type does not match the frontend TypeScript type | CMS returns `string`, frontend expects `number` | HIGH |
| **Orphaned CMS Field** | Field exists in CMS schema but has no consumption path in the frontend wiring graph | `seoDescription` defined in CMS, never read by frontend | CRITICAL |
| **Orphaned Frontend Field** | Frontend component reads a property that has no corresponding CMS field | `heroSubtitle` used in JSX, no CMS field defined | HIGH |
| **Stale Content Reference** | Frontend references a CMS document type or property that was renamed/removed | `/about` fetches `aboutPage` but CMS renamed it to `aboutUsPage` | CRITICAL |
| **Unconsumed Interface** | TypeScript interface exists for a document type but no component imports or uses it | `EventsPage` interface defined but no page imports it | HIGH |
| **Dead Fetcher** | Fetcher function exported but never imported by any page or component | `getEventsPage()` exported but zero import sites | CRITICAL |
| **Block Drift** | Block type defined in CMS but no frontend renderer component exists (or vice versa) | CMS defines `heroBlock` but frontend has no `HeroBlock` component | HIGH |
| **SiteSettings Drift** | SiteSettings field defined in CMS but never consumed in layout/header/footer | `socialLinks` in CMS, no component reads it | MEDIUM |
| **SEO Drift** | SEO field exists in CMS document type but metadata function never reads it | `ogImage` in CMS, `generateMetadata()` ignores it | HIGH |

**Steps:**

1. **BUILD current state graphs via Graphify:**
   - Invoke Graphify on the latest CMS schema input files: `/graphify ./graphify-input/cms/` → produces CMS Schema Graph
   - Invoke Graphify on the latest wiring input files: `/graphify ./graphify-input/wiring/ --mode deep` → produces Frontend Wiring Graph
   - Store graph snapshots with timestamps for future drift comparison.

2. **COMPARE schema graph vs wiring graph — Alias Alignment:**
   - Extract all `CmsField` node labels from the CMS Schema Graph.
   - Extract all `InterfaceProperty` node labels from the Frontend Wiring Graph.
   - Compare: flag every `CmsField` label that has no matching `InterfaceProperty` label (and vice versa).
   - Graphify query: `pairs:(CmsField, InterfaceProperty) WHERE CmsField.label != InterfaceProperty.label AND NOT edge:typed_as BETWEEN (CmsField, InterfaceProperty)`
   - **Alias Mismatch Detection:**
     - `CmsField` with no matching `InterfaceProperty` → field exists in CMS but frontend has no type for it → ORPHANED CMS FIELD
     - `InterfaceProperty` with no matching `CmsField` → frontend expects a type but CMS doesn't define it → ORPHANED FRONTEND FIELD
     - Both exist but labels differ → ALIAS MISMATCH

3. **CHECK Type Compatibility:**
   - For every `CmsField → InterfaceProperty [typed_as]` edge, compare the CMS data type against the TypeScript type.
   - Flag mismatches.
   - **Type Compatibility Matrix:**

   | CMS Data Type | Expected TypeScript Type | Mismatch If |
   |--------------|------------------------|-------------|
   | `Umbraco.TextBox` | `string` | Not `string` |
   | `Umbraco.TextArea` | `string` | Not `string` |
   | `Umbraco.RichText` | `{ markup: string }` or `string` | Not handled |
   | `Umbraco.Integer` | `number` | Not `number` |
   | `Umbraco.Decimal` | `number` | Not `number` |
   | `Umbraco.TrueFalse` | `boolean` | Not `boolean` |
   | `Umbraco.DateTime` | `string` (ISO 8601) | Not `string` |
   | `Umbraco.MediaPicker3` | `{ url: string, ... }` | Not `object` with `url` |
   | `Umbraco.BlockList` | `{ items: T[] }` | Not `object` with `items` array |
   | `Umbraco.ContentPicker` | `{ name: string, url: string }` | Not `object` |

4. **DETECT Stale Content References:**
   - Compare current document type aliases against the frontend's fetcher targets.
   - For each `FetcherFunction → CmsType [fetches]` edge, verify the CMS document type still exists with that alias.
   - Graphify query: `nodes:CmsType WHERE NOT EXISTS(edge:fetches FROM FetcherFunction)` → document types with no fetcher.
   - Graphify query: `nodes:FetcherFunction WHERE target_CmsType NOT IN (SELECT label FROM CmsType)` → fetchers targeting removed/renamed types.

5. **DETECT Unconsumed Interfaces and Dead Fetchers:**
   - For every `InterfaceProperty` node, verify at least one `bound_to` edge to a `ComponentProperty`.
   - For every `FetcherFunction` node, verify at least one outgoing edge to a `PageComponent` or `Route`.
   - Graphify queries: `nodes:InterfaceProperty WHERE out_degree == 0`, `nodes:FetcherFunction WHERE out_degree == 0`

6. **DETECT Block Drift:**
   - For each `BlockType` node in the CMS graph, verify a `BlockType → ComponentElement [rendered_by]` edge exists in the wiring graph.
   - For each `ComponentElement` that renders blocks, verify a corresponding `BlockType` exists in CMS.

7. **DETECT SiteSettings and SEO Drift:**
   - For every `SiteSettingsField` node, verify at least one outgoing `consumed_by` edge.
   - For every `SeoField` node, verify an outgoing `read_by` edge to a `MetadataFunction`.
   - Graphify queries: `nodes:SiteSettingsField WHERE out_degree == 0`, `nodes:SeoField WHERE out_degree == 0`

8. **CALCULATE Drift Scores and Produce Manifest:**

   **Overall Drift Score:**
   ```
   Drift Score = (Aligned edges / Total expected edges) × 100
   ```

   **Drift Severity Classification:**

   | Severity | Criteria | Action |
   |----------|----------|--------|
   | **CRITICAL** | Orphaned CMS field with zero consumption paths, stale content reference, dead fetcher | BLOCKS certification. Must fix immediately. |
   | **HIGH** | Alias mismatch, type incompatibility, orphaned frontend field, unconsumed interface, block drift, SEO drift | BLOCKS certification. Fix before Skill 14. |
   | **MEDIUM** | SiteSettings drift, reverse block drift, INFERRED-confidence gaps | Flagged. Does not block but must be tracked. |
   | **LOW** | Naming convention inconsistency | Noted. Non-blocking. |

9. **PRODUCE the Drift Manifest**

10. **Gate enforcement:**
    - If ANY CRITICAL or HIGH drift exists: GATE CLOSED. Fix all CRITICAL and HIGH drifts, then re-run Skill 13.
    - If only MEDIUM and LOW drifts: GATE OPEN. Track MEDIUM drifts for resolution before certification (Skill 14).
    - If zero drifts of any severity: GATE OPEN. Schema and frontend are fully aligned.

**Guardrails:**
- Drift detection requires BOTH the CMS schema graph AND the frontend wiring graph
- If Graphify is not available, drift detection degrades to manual alias comparison and grep-based checks
- Graph snapshots are timestamped — always compare the LATEST snapshots
- Alias mismatch detection is case-sensitive — `heroHeading` ≠ `heroheading`
- Type compatibility is structural, not nominal — check actual data shapes
- Fix recommendations must be specific — "fix alias" is insufficient
- Never auto-fix drifts without user review
- Re-run drift detection after ANY schema or frontend wiring change

**Degraded Mode (when Graphify is unavailable):** Manual drift detection with grep/curl comparisons.

**Drift Re-Check Trigger Events:** Re-run after any schema change, property alias rename, frontend wiring change, new route added, block type change, SiteSettings field change, or SEO field configuration change.
