# Factory Droid — Custom Droids & Skills

Custom [Factory Droid](https://factory.ai) agents and skills for development workflows.

## Droids

Custom subagents invoked via the `Task` tool. Install to `~/.factory/droids/`.

| Droid | Purpose |
|---|---|
| **worker** | General-purpose worker for delegating non-trivial tasks (code exploration, Q&A, research, analysis) |
| **scrutiny-feature-reviewer** | Deep code review for a single feature during mission validation |
| **user-testing-flow-validator** | Tests validation contract assertions through real user surfaces (web UI, CLI, API) |
| **business-context-bootstrapper** | Bootstraps a per-client workspace from a website URL. Scrapes homepage, /about, /services, /contact, and /pricing to extract business fundamentals, services, team, differentiators, and voice patterns. Writes `business-context.md`, `tone.md`, `vocabulary.md`, `humour.md`, and `beliefs.md`. Use when onboarding a new local SEO client. |
| **local-seo-optimization-specialist** | Enterprise-ready Local SEO consultant. Audits websites for local search visibility, Google Business Profile optimization, NAP consistency, schema markup, and competitor analysis. Powered by DataForSEO MCP for real keyword data. Includes category verification, suspension risk assessment, and industry citation discovery. |
| **gbp-setup-specialist** | Generates a paste-ready Google Business Profile spec from a client's business context plus live competitor, category, and keyword research. Reads `business-context.md` from `--client-dir`, dispatches parallel subagents for research via DataForSEO MCP, and writes `gbp-{slug}.md`, `research-{slug}.md`, `citation-checklist-{slug}.md`, and a stub `posts-queue.md`. Optional `next-steps-{slug}.md` with `--with-recommendations`. |
| **gbp-post-generator** | Generates a batch of GBP social posts from business context and voice files. Produces Offer, Call to action, and Event posts in YAML format for Make.com webhook delivery. Reads `posts-queue.md` to avoid duplicates. Defaults to 8 posts/month at 2x/week cadence. Use for scheduling GBP social content. |
| **review-response-drafter** | Drafts personalized review responses for GBP reviews. Reads voice files and business context, matches the client's tone for each rating tier (1-5 stars). Read-only — returns the drafted response in a structured exit summary. Use for responding to reviews at scale. |
| **location-page-generator** | Generates location-specific SEO landing pages for each service + city combination. Each page includes unique content, local references, FAQ seed, and embedded JSON-LD LocalBusiness schema. Supports internal cross-linking between generated pages. Use for building service area landing pages. |
| **monthly-report-generator** | Generates structured monthly SEO performance reports from GBP Insights metrics. Includes executive summary, trend analysis, search queries, reviews, keyword rankings, competitive watch, and prioritized next-month recommendations. Use for client reporting. |
| **umbraco-cms-migration-droid** | Migrates any hardcoded frontend (React, Next.js, Vue, Nuxt, Angular, Svelte, Astro, .NET MVC, vanilla, etc.) to Umbraco CMS. Enforces one-doctype-per-page architecture, Delivery API wiring, SEO, revalidation, preview mode, media handling, Graphify relationship intelligence, and 16-skill lifecycle with verification gates. |
| **claude-design-vercel-deployment-orchestrator** | Transforms Claude Design exports (ZIP, repo, or monorepo) into production-ready Vercel deployments. Validates builds, hardens against zip-slip, sets up GitHub + Vercel projects idempotently, manages env vars, generates CI workflow with `gitleaks`, gates prod promotion behind explicit user approval, and provides rollback as a first-class first response. |

## Skills

Custom skills invoked via the `Skill` tool. Install to `~/.factory/skills/<name>/SKILL.md`.

| Skill | Purpose |
|---|---|
| **vercel-watch** | Monitor a Vercel deployment from trigger until success or failure |
| **claude-design-post-deploy** | Verify a Vercel deployment is genuinely production-ready: HTTP smoke checks, optional Lighthouse audit, TLS/DNS verification on custom domains, and rollback dry-run. Companion skill to `claude-design-vercel-deployment-orchestrator`. |
| **umbraco-cms-migration** | 16 sub-skills for full Umbraco CMS migration lifecycle: frontend audit, schema generation, spec review, Management API creation, Delivery API wiring, content seeding, SEO wiring, revalidation, media handling, preview mode, wiring verification, retrospections, route certification, drift detection, final certification, and dependency refresh |

## MCP Servers

Custom MCP servers that power droids with real data.

| Server | Purpose |
|---|---|
| **dataforseo** | Local SEO data: search volumes, live SERP results, local pack rankings, domain authority, competitor keyword analysis. Requires `DATAFORSEO_EMAIL` and `DATAFORSEO_API_KEY` env vars. |

## Installation

Clone and symlink/copy into place:

```bash
git clone git@github.com:tindevelopers/factory-droids.git ~/factory-droids

# Droids
cp ~/factory-droids/droids/*.md ~/.factory/droids/

# Skills
cp -r ~/factory-droids/skills/* ~/.factory/skills/

# MCP servers (install dependencies first)
cd ~/factory-droids/mcp-servers/dataforseo && npm install
# Then register: droid mcp add dataforseo-seo -- node ~/factory-droids/mcp-servers/dataforseo/index.js
```

## IDE Compatibility

Factory Droid droids and skills are tied to the Factory Droid runtime, not any specific IDE. As long as Factory Droid is installed on the target machine, these will work identically in any supported environment (CLI, VS Code, etc.).

## Required Plugins

These work alongside plugins that should also be installed:

```bash
droid mcp add superpowers obra/superpowers
droid mcp add core Factory-AI/factory-plugins
```
