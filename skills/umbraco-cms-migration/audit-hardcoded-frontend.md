---
name: audit-hardcoded-frontend
description: >-
  Inspect a frontend before CMS migration. Detects the framework, catalogs all
  hardcoded content (text, images, SEO, CTAs), and generates Graphify frontend
  input files for relationship analysis. Use when the user wants to audit a
  frontend before migrating to Umbraco CMS.
---

# Skill 1: audit-hardcoded-frontend

Use this skill when the user wants to inspect a frontend before CMS migration.

**Goal:** Find all hardcoded content, detect the framework, and determine what should move into Umbraco CMS.

**Steps:**
1. **Detect the frontend framework** — check `package.json`, config files, file extensions, and directory structure to identify: Next.js, React (CRA/Vite), Vue/Nuxt, Angular, Svelte/SvelteKit, Astro, .NET MVC, Remix, Gatsby, or vanilla HTML/CSS/JS. Record the framework and version.
2. Inspect all route/page files (adapt path conventions per framework).
3. Inspect all layout/template files.
4. Inspect all components.
5. Inspect metadata/SEO functions (e.g., `generateMetadata` in Next.js, `useHead`/`useSeoMeta` in Nuxt, `<meta>` tags in vanilla HTML, `Meta`/`Title` in Angular).
6. Inspect navbar/footer.
7. Inspect fallback/default content files.
8. Inspect image usage.
9. Inspect sitemap and robots.
10. Inspect env files.
11. Inspect existing CMS/API fetchers.
12. **Generate Graphify frontend input files** — produce structured markdown files for Graphify ingestion under `graphify-input/frontend/`:

   a. **`routes.md`** — For every frontend route, record: route path, page component file, layout component (if any), detected CMS type alias (or "HARDCODED" if none), fetcher function name (or "NONE"). Format as a markdown table: `| Route | PageComponent | Layout | CmsType | Fetcher |`.

   b. **`components.md`** — For every component that renders content, record: component name, file path, CMS fields consumed (list property names), hardcoded content found (string literals, image refs, SEO values). Format: `| Component | File | CmsFieldsConsumed | HardcodedContent |`.

   c. **`interfaces.md`** — For every TypeScript interface (or framework-equivalent type), record: interface name, property names, property types, corresponding CMS document type (if known). Format: `| Interface | Property | Type | CmsDocType |`.

   d. **`fetchers.md`** — For every API fetcher found, record: function name, HTTP method, endpoint URL, CMS document type targeted (if identifiable). Format: `| Fetcher | Method | Endpoint | Targets |`.

   **File format:** All files use markdown tables with the specified columns. Node names encode type using `|` separator (e.g., `HomePage|Route`, `heroHeading|CmsField`). Files are written fresh (overwrite, not append) to a `graphify-input/frontend/` directory in the project root.

   **Note:** This step is read-only — it documents what exists, never modifies frontend code or calls Umbraco APIs. Graphify will later ingest these files to build the frontend dependency graph.

**Response:**

```
Framework Detected: <framework> <version>
Summary: <one-line audit scope and key finding>

Hardcoded Content Inventory:
- <file>:<line> — <content type> — <recommendation>

Priority:
1. <highest priority migration item>
2. <next>
3. <next>

Next Step: <recommended follow-up skill>
```

**Verification Gate (Skill 1):** Before claiming audit complete:

1. **IDENTIFY:** Count frontend routes vs. detected pages — every route must have a corresponding page file. Extract all hardcoded strings to a manifest and verify count matches audit inventory.
2. **RUN:** Re-run the framework detection command (check `package.json` again, verify file extensions). Run `find` or `grep` to count all detected hardcoded content locations.
3. **READ:** Full output — route count, hardcoded string count, framework version string.
4. **VERIFY:** Output confirms the framework is correctly identified, every route is accounted for, and the hardcoded content inventory is complete (no missing pages or components).
5. **ONLY THEN:** Claim audit phase complete. Proceed to Skill 2 (schema specification).
