---
name: umbraco-cms-migration
description: >-
  Master/umbrella skill for the Umbraco CMS migration droid. Lists all sub-skills
  covering the full CMS migration lifecycle from frontend audit through schema
  generation, Management API creation, Delivery API wiring, content seeding, SEO,
  revalidation, media handling, preview mode, verification, retrospective,
  certification, and dependency refresh.
---

# Umbraco CMS Migration — Umbrella Skill

This is the master skill for the `umbraco-cms-migration-droid`. It lists all sub-skills that comprise the full CMS migration lifecycle. Invoke individual sub-skills based on the user's request or the current lifecycle phase.

## Sub-Skills

| # | Skill | File | When to Use |
|---|-------|------|-------------|
| 1 | **audit-hardcoded-frontend** | `skills/umbraco-cms-migration/audit-hardcoded-frontend.md` | User wants to inspect a frontend before CMS migration. Detects framework, catalogs hardcoded content, generates Graphify frontend input files. |
| 2 | **generate-umbraco-schema** | `skills/umbraco-cms-migration/generate-umbraco-schema.md` | User wants to convert a hardcoded frontend into Umbraco document types — one per major page, plus block types, entity types, and revalidation mapping. |
| 2.5 | **spec-review** | `skills/umbraco-cms-migration/spec-review.md` | Automatically after Skill 2, before user approval. 10-point automated quality review: Rule violations, field coverage, alias consistency, SEO completeness. |
| 3 | **create-umbraco-schema** | `skills/umbraco-cms-migration/create-umbraco-schema.md` | User approved a schema proposal. Creates site/root node, document types, properties, block types, and content nodes via Management API. |
| 4 | **wire-umbraco-delivery-api** | `skills/umbraco-cms-migration/wire-umbraco-delivery-api.md` | User wants to connect frontend to Umbraco published content. Creates fetch layer, typed interfaces, fetchers, media resolver, and Graphify wiring input files. |
| 5 | **seed-content** | `skills/umbraco-cms-migration/seed-content.md` | User wants to move hardcoded frontend content into Umbraco. Seeds one test value per field, validates pipeline, then optionally migrates full content. |
| 6 | **cms-seo-wiring** | `skills/umbraco-cms-migration/cms-seo-wiring.md` | User wants to add or audit SEO for CMS-driven pages — meta tags, OpenGraph, Twitter cards, canonical URLs, sitemap, JSON-LD. |
| 7 | **cms-revalidation-webhook** | `skills/umbraco-cms-migration/cms-revalidation-webhook.md` | User wants to add or debug cache invalidation after Umbraco publish — ISR, webhooks, path mapping. |
| 8 | **umbraco-media-handling** | `skills/umbraco-cms-migration/umbraco-media-handling.md` | User asks about broken images, media URLs, or image optimization for Umbraco media. |
| 9 | **cms-preview-mode** | `skills/umbraco-cms-migration/cms-preview-mode.md` | User wants editors to preview unpublished Umbraco content — draft/preview mode, token-protected routes. |
| 10.5 | **wiring-verification** | `skills/umbraco-cms-migration/wiring-verification.md` | After Phase 7 (component wiring), before Phase 8 (SEO). 6-layer verification: build → Delivery API → fetchers → components → routes → visual. |
| 11 | **phase-retrospective** | `skills/umbraco-cms-migration/phase-retrospective.md` | After every lifecycle phase. Captures patterns, API quirks, and reusable techniques before context is lost. |
| 12 | **route-certification** | `skills/umbraco-cms-migration/route-certification.md` | After wiring verification, before drift detection. Per-route field tracing via Graphify shortest-path queries. |
| 13 | **drift-detection** | `skills/umbraco-cms-migration/drift-detection.md` | After route certification, before final certification. Compares CMS schema graph vs frontend wiring graph for misalignments. |
| 14 | **final-migration-certification** | `skills/umbraco-cms-migration/final-migration-certification.md` | After all implementation phases complete. 20-item DoD checklist, auditable evidence, Graphify visual certification. |
| 15 | **refresh-dependencies** | `skills/umbraco-cms-migration/refresh-dependencies.md` | On session start (if last check > 7 days) or manual. Checks/updates/reconciles Superpowers plugin and Graphify pip package. |

## Lifecycle Order

The sub-skills should be invoked in this order for a full migration:

```
Skill 1 (audit) → Skill 2 (schema) → Skill 2.5 (spec review) → Skill 3 (create)
→ Skill 5 (seed) → Skill 4 (wire) → Skill 10.5 (wiring verification)
→ Skill 6 (SEO) → Skill 7 (revalidation) → Skill 8 (media) → Skill 9 (preview)
→ Skill 12 (route certification) → Skill 13 (drift detection) → Skill 14 (certification)
```

**After every phase:** Run Skill 11 (retrospective).
**On session start / periodically:** Run Skill 15 (refresh dependencies).
