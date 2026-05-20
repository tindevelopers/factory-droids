---
name: generate-umbraco-schema
description: >-
  Analyze all frontend pages and generate dedicated Umbraco document types — one
  per major page. Produces block types, entity types, revalidation mapping, and
  Graphify CMS input files. Use when converting a hardcoded frontend into Umbraco
  document types.
---

# Skill 2: generate-umbraco-schema-from-frontend

Use this skill when converting a hardcoded frontend into Umbraco document types.

**Goal:** Analyze ALL frontend pages and generate dedicated Umbraco document types — one per major page. Never propose reusing `marketingPage` for multiple pages.

**Steps:**
1. **Confirm the project name** (detected in Skill 1) — this will become the new Umbraco site/root node name.
2. List ALL frontend routes/pages.
3. For each route, identify visible sections, editable content, images, CTAs.
4. Assign each route a dedicated document type alias (see Rule 2 mapping table).
5. Group fields into logical tabs per document type.
6. Choose Umbraco data types.
7. Add SEO fields to every document type.
8. Add media fields.
9. Identify reusable block/element types for repeatable sections.
10. Identify reusable entity types for collections (blog posts, journal posts, events).
11. Create typed interface/model proposal (adapt to framework language).
12. Create Delivery API fetcher proposal.
13. Create revalidation/cache-invalidation mapping proposal.
14. **Generate Graphify CMS input files** — produce structured markdown files for Graphify ingestion under `graphify-input/cms/`:

   a. **`document-types.md`** — For every proposed document type, record: alias, route, tab count, property count, property names with data types. Format as: `| DocType | Route | Tabs | Properties |`.

   b. **`block-types.md`** — For every proposed block type, record: block alias, element types it accepts, properties per element type, which pages use it. Format: `| BlockType | AcceptsElements | Properties | UsedBy |`.

   c. **`entity-types.md`** — For every proposed reusable entity type, record: alias, properties, which listing pages reference it. Format: `| EntityType | Properties | ReferencedBy |`.

   d. **`site-settings.md`** — For every SiteSettings field, record: field name, data type, intended consumer (header/footer/layout/page). Format: `| Field | Type | Consumer |`.

   **File format:** All files use markdown tables. Files are written fresh to `graphify-input/cms/` in the project root.

   **Note:** This step documents the proposed schema in a machine-readable format that Graphify will later ingest to build the CMS schema relationship graph. It does NOT call Umbraco APIs.

15. **Invoke Graphify for schema analysis (optional, if Graphify is installed):** Run `/graphify ./graphify-input/cms/` to build the CMS schema graph. Query for structural issues: orphaned block types (defined but unused), missing property-to-datatype edges, document types with zero properties. Use MCP queries: `graph_stats` for node/edge counts, `god_nodes` for high-connectivity document types.

**Required output table:**

```
| Frontend Route | New Umbraco Document Type | Content Node Name | Reusable Blocks | Revalidation Path |
|---|---|---|---|---|
| / | homePage | Home | heroBlock, featureGridBlock, testimonialBlock, ctaBlock | / |
| /about | aboutPage | About | heroBlock, richTextBlock, imageTextBlock | /about |
| /contact | contactPage | Contact | heroBlock, contactInfoBlock, openingHoursBlock | /contact |
| ... | ... | ... | ... | ... |
```

**Response:**

```
Project: <project name>
New Site Root: <project name> (new root node, NOT reusing existing)
Summary: <N> dedicated document types for <N> routes

Document Types (one per page):
- <alias>: <route> — <tab count> tabs, <property count> properties
- ...

Reusable Block Types: <list or "none">
Reusable Entity Types: <list or "none">

Site Setup Plan:
- Root node: <project name>
- siteSettings: <new or extended properties>
- Navigation: <navLinkItem block list>
- Footer: <footer properties>
- SEO Defaults: <default SEO fallback values>
- Media folder: /media/<project-slug>/
- Start item: <Delivery API start item GUID or path>
- Revalidation: <path mapping count> routes mapped

Approval Required:
- All document type aliases
- All property aliases
- Site root name
- Whether to create draft or publish
```

**Verification Gate (Skill 2):** Before presenting schema for approval:

1. **IDENTIFY:** Compare every proposed document type alias against frontend TypeScript interfaces or component props. Every CMS property alias must have a matching frontend interface property.
2. **RUN:** `grep` for every proposed alias in the frontend codebase. Verify the alias naming convention matches frontend expectations (camelCase vs PascalCase).
3. **READ:** Full grep output — which aliases match, which are missing from frontend, which are extra.
4. **VERIFY:** Every proposed document type has a 1:1 mapping to a frontend route. Every property has a corresponding TypeScript interface field. No aliases conflict with existing types.
5. **ONLY THEN:** Present schema for user approval. Proceed to Skill 2.5 (spec-review) if available, otherwise directly to approval gate.
