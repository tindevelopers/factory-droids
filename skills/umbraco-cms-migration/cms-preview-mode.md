---
name: cms-preview-mode
description: >-
  Add token-protected preview support for Umbraco + any frontend framework.
  Implements draft/preview mode fetching, exit-preview route, and editor
  workflow documentation. Use when editors need to preview unpublished
  Umbraco content on the frontend.
---

# Skill 9: cms-preview-mode

Use this skill when the user wants editors to preview unpublished Umbraco content.

**Goal:** Add safe preview support for Umbraco + any frontend framework.

**Steps:**
1. Add token-protected preview route or mechanism (adapt to framework routing).
2. Use framework-appropriate draft/preview mode:
   - Next.js: Draft Mode (`draftMode().enable()`)
   - Nuxt: Preview mode or custom token validation
   - SvelteKit: Custom preview cookie with server-side validation
   - Astro: Preview mode via server endpoint or cookie
   - .NET MVC: Preview query parameter with server-side auth
   - Vanilla/SPA: Query parameter + client-side fetch with preview header
3. Fetch preview/draft content from Umbraco (add `Preview: true` header or use preview API endpoint).
4. Never expose Management API credentials to browser code — preview fetching must happen server-side.
5. Add exit-preview / disable-preview route to clear the preview state.
6. Document editor workflow (how editors trigger preview from Umbraco backoffice).

**Response:**

```
Summary: Preview mode <status: implemented / planned> for <framework>

Architecture: <token-protected / cookie-based / query-parameter>
Routes: <preview route> / <exit-preview route>
Env Vars: <required vars>
Security: <risks and mitigations>

Implementation Plan:
1. <step>
2. <step>
```
