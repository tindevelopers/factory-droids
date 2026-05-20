---
name: wire-umbraco-delivery-api
description: >-
  Connect the frontend to Umbraco published content via Delivery API.
  Creates fetch layer, typed interfaces, fetchers per document type,
  media URL resolver, cache strategy, and Graphify wiring input files.
  Adapts patterns to the detected frontend framework. Use when connecting
  the frontend to Umbraco published content.
---

# Skill 4: wire-umbraco-delivery-api

Use this skill when connecting the frontend to Umbraco published content.

**Goal:** Create the frontend fetch layer that reads from Umbraco Delivery API. Adapt the implementation to the detected framework.

**Framework-specific patterns:**

| Framework | Fetch approach | Typing | Caching |
|---|---|---|---|
| Vanilla JS/HTML | `fetch()` or `axios` | JSDoc | Cache-Control headers |
| React (CRA/Vite) | `fetch()` in effects/loaders | PropTypes or TS | SWR/React Query |
| Next.js (App Router) | Server Components / `fetch()` | TS interfaces | ISR tags + `revalidate` |
| Next.js (Pages Router) | `getStaticProps` / `getServerSideProps` | TS interfaces | `revalidate` |
| Vue.js | `fetch()` in `setup()` | TS or PropTypes | Cache headers |
| Nuxt | `useFetch()` / `useAsyncData()` | TS | ISR / SWR |
| Angular | `HttpClient` services | TS interfaces | Cache interceptors |
| Svelte/SvelteKit | `fetch()` in `load()` | TS or JSDoc | Cache headers |
| Astro | `fetch()` in frontmatter | TS | Cache headers |
| .NET MVC | `HttpClient` in controllers | C# classes | OutputCache |
| Remix | `useLoaderData()` / `fetch()` | TS | Cache-Control |
| Gatsby | `useStaticQuery()` or page queries | TS | Build-time |

**Steps:**
1. Identify required env vars (`UMBRACO_DELIVERY_API_URL`, `UMBRACO_DELIVERY_API_KEY`).
2. Create or update Delivery API client (adapt HTTP library to framework).
3. Add `Api-Key` header to all requests.
4. Add `Start-Item` header if content is rooted under a specific node.
5. Add typed interfaces/models for each document type (adapt type system to framework language).
6. Add fetchers per document type (one function per page type: `getHomePage()`, `getAboutPage()`, etc.).
7. Add rich text helper to safely render Umbraco rich text (strip/sanitize if needed).
8. Add media URL helper (`resolveUmbracoMediaUrl(url)`) to normalize relative/absolute media URLs.
9. Add cache/ISR tags where framework supports them.
10. Add safe fallback behavior — every fetcher must handle missing fields gracefully, never crash on missing CMS data.
11. **Generate Graphify wiring input files** — produce structured markdown files for Graphify ingestion under `graphify-input/wiring/`:

   a. **`field-mapping.md`** — For every CMS field across all document types, record the full trace path: CMS property → Delivery API response path → TypeScript interface property → component prop → rendered output. Format: `| CmsField | ApiPath | InterfaceProp | ComponentProp | RenderedAs | Route |`.

   b. **`seo-mapping.md`** — For every SEO field (`seoTitle`, `seoDescription`, `ogTitle`, `ogDescription`, `ogImage`, `canonicalUrl`, `noIndex`, `noFollow`), record: which metadata function reads it, which head tag it produces, which route it serves. Format: `| SeoField | MetadataFunction | HeadTag | Route |`.

   c. **`media-mapping.md`** — For every media/image field, record: CMS media field → resolver function → component that renders the image → alt text field → route. Format: `| MediaField | Resolver | Component | AltTextField | Route |`.

   **File format:** All files use markdown tables. Files are written fresh to `graphify-input/wiring/` in the project root.

   **Note:** This step documents the wiring graph in a machine-readable format that Graphify will later ingest for end-to-end field tracing. It does NOT call Umbraco APIs.

12. **Invoke Graphify for wiring analysis (optional, if Graphify is installed):** Run `/graphify ./graphify-input/wiring/ --mode deep` to build the full end-to-end wiring graph. Query for wiring gaps: dead fields (unconsumed CMS properties), orphaned fetchers (exported but never imported), unwired routes (no fetcher edge). Use MCP `shortest_path` queries to trace individual fields: `shortest_path("heroHeading_cms", "HomePage_route")`.

**Response:**

```
Summary: Wired <N> fetchers for <framework> frontend against <document type alias>

Files Changed:
- <file path>: <change description>

Fetchers Created:
- <function name>: fetches <document type> from Delivery API (<HTTP method>)

Interfaces/Models: <new or updated types in framework language>
Cache Strategy: <ISR tags / cache headers / build-time / none>
Test: curl -H "Api-Key: <key>" <Delivery API URL>
```

**Verification Gate (Skill 4):** Before claiming Delivery API wiring complete:

1. **IDENTIFY:** For every exported fetcher function, verify it is imported AND called by at least one page/component. Build + typecheck must pass with zero errors.
2. **RUN:** `npm run build && npm run typecheck` (adapt command to framework). Then `grep -r "import.*getXxxPage" app/` and `grep -r "getXxxPage()" app/` for every fetcher.
3. **READ:** Build output (exit code 0, zero errors), typecheck output (exit code 0, zero errors), grep output (every fetcher imported AND called).
4. **VERIFY:** Zero build errors. Zero type errors. Every exported fetcher has at least one import site and at least one call site. No dead fetchers.
5. **ONLY THEN:** Claim Delivery API wiring complete. Proceed to Skill 6 (SEO wiring) or component wiring.
