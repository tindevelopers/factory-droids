---
name: cms-seo-wiring
description: >-
  Add or audit SEO for CMS-driven pages. Ensures every page has production-ready
  SEO: meta tags, OpenGraph, Twitter cards, canonical URL, hreflang, XML sitemap,
  robots.txt, and JSON-LD structured data. Adapts to the detected frontend framework.
  Use when adding or auditing SEO for Umbraco CMS-driven pages.
---

# Skill 6: cms-seo-wiring

Use this skill when adding or auditing SEO for CMS-driven pages.

**Goal:** Make sure every CMS-driven page has production-ready SEO, adapted to the detected framework.

**Required Umbraco Fields:**
- seoTitle
- seoDescription
- ogTitle
- ogDescription
- ogImage
- canonicalUrl
- noIndex
- noFollow

**Required Frontend Support (adapt to framework):**
- Page title and meta description tags
- OpenGraph meta tags (og:title, og:description, og:image, og:type, og:url)
- Twitter card meta tags (twitter:card, twitter:title, twitter:description, twitter:image)
- Canonical URL (`<link rel="canonical">`)
- hreflang alternates for multi-locale sites
- XML sitemap generation (include all CMS-driven routes)
- robots.txt (respect noIndex/noFollow from CMS)
- JSON-LD structured data where relevant: Article (blog posts), Person (team), Organization (business), FAQPage (FAQs), BreadcrumbList (navigation), CreativeWork (case studies)

**Framework adaptation for metadata:**
- Next.js: `generateMetadata()` or `<Head>` in pages router
- Nuxt: `useHead()` / `useSeoMeta()` composables
- Vue: `@vueuse/head` or `vue-meta`
- Angular: `Meta` and `Title` services from `@angular/platform-browser`
- Svelte/SvelteKit: `<svelte:head>` in components
- Astro: frontmatter + `<Head>` component
- .NET MVC: `ViewData` / `ViewBag` in layouts
- Vanilla HTML: direct `<meta>` tag injection via JS
- React SPA: `react-helmet-async`

**Response:**

```
Summary: SEO <status: complete / gaps found> for <N> CMS-driven pages on <framework>

Fields Present: <list of covered SEO fields>
Fields Missing: <list of missing SEO fields>
JSON-LD: <types implemented / recommended>
Sitemap: <status>
Robots: <status>

Fixes Needed:
- <actionable fix or "none">
```
