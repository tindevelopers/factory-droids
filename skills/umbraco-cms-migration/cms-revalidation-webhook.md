---
name: cms-revalidation-webhook
description: >-
  Add or debug cache invalidation after Umbraco publish. Supports ISR
  revalidation, webhook configuration, and path mapping across Vercel/Next.js,
  Nuxt, SvelteKit, Astro, .NET, and static hosting platforms. Use when adding
  or debugging cache invalidation for Umbraco-driven pages.
---

# Skill 7: cms-revalidation-webhook

Use this skill when adding or debugging cache invalidation after Umbraco publish. Adapt to the hosting platform and framework.

**Goal:** Ensure that publishing in Umbraco refreshes the deployed frontend.

**Revalidation strategies by platform:**
- Vercel/Next.js: ISR with `revalidateTag`/`revalidatePath` via `/api/revalidate` webhook
- Nuxt: ISR with `clearCache()` or webhook endpoint
- SvelteKit: Invalidation via API endpoint
- Astro: Webhook-triggered rebuild or SSR cache clear
- .NET: OutputCache invalidation
- Static hosting (Netlify, Cloudflare Pages, etc.): Webhook-triggered rebuild/deploy
- CDN-based: Cache purge via CDN API

**Steps:**
1. Identify the revalidation endpoint or mechanism for the detected hosting platform.
2. Check revalidation secret/token is configured and secure.
3. Check webhook payload format (does Umbraco send the right fields?).
4. Check document type → route path mapping (every CMS type must have a route mapping).
5. Check slug-based route mapping (e.g., `blogPost` slug → `/blog/{slug}`).
6. Check locale expansion for multi-locale sites.
7. Check sitemap revalidation on content changes.
8. Test with curl or equivalent tool.
9. Confirm updated content renders on the deployed frontend.

**Path Mapping Examples (framework-independent):**
- `homePage` → `/`
- `aboutPage` → `/about`
- `blogPost` + slug → `/blog/{slug}`
- `teamMember` + slug → `/team/{slug}`

**Response:**

```
Summary: Revalidation <status: working / broken> — <root cause if broken>

Platform: <hosting platform / framework>
Endpoint: <URL or mechanism>
Secret: <configured / missing>
Path Mappings: <count> document types mapped
Test Result: <HTTP status or result from test>

Failure Points:
- <issue or "none">

Fix: <recommended action>
```
