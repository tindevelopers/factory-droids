---
name: umbraco-media-handling
description: >-
  Audit or wire images/media from Umbraco. Creates media URL resolver,
  configures framework-specific image optimization (Next.js remotePatterns,
  Nuxt image domains, etc.), ensures alt text coverage, and adds fallback
  strategies. Use when auditing or wiring Umbraco media images.
---

# Skill 8: umbraco-media-handling

Use this skill when auditing or wiring images/media from Umbraco.

**Goal:** Make Umbraco media reliable in the deployed frontend, regardless of framework.

**Steps:**
1. Identify all image/media fields in the CMS document types.
2. Check if Umbraco returns absolute or relative URLs for media.
3. Create or use a media URL resolver (`resolveUmbracoMediaUrl(url)`) that normalizes:
   - Relative `/media/...` paths → absolute URLs with Umbraco base URL
   - Already-absolute URLs (pass through)
   - Azure Blob / CDN URLs (pass through or transform as needed)
4. Configure image optimization for the framework:
   - Next.js: `next.config.js` `remotePatterns` for `next/image`
   - Nuxt: `nuxt.config.ts` image domains for `@nuxt/image`
   - SvelteKit: Vite config for image optimization plugins
   - Astro: `astro.config.mjs` image service config
   - Angular: custom image loader or NgOptimizedImage
   - .NET MVC: image tag helpers or CDN transforms
   - Vanilla HTML: `<img>` with `loading="lazy"` and responsive `srcset`
5. Check alt text — every image must have alt text from CMS or a sensible fallback.
6. Add fallback/placeholder images for missing or broken media.
7. Avoid raw `image.url` usage — always route through the resolver.
8. Consider Umbraco image crops/focal points if available in the media model.

**Response:**

```
Summary: Media audit — <N> images, <N> issues found on <framework>

Images: <count> total across <count> components
Raw URL Usage: <count> call sites (should use resolver)
Missing Alt Text: <count>
Image Optimization: <framework-specific config status>
Fallback Strategy: <status>

Fixes:
- <actionable fix or "none">
```
