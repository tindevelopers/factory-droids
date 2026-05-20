---
name: create-umbraco-schema
description: >-
  Create a new Umbraco site/root node, document types, properties, block types,
  and content nodes through the Management API. Use only after the user approves
  a schema proposal (Skill 2) following spec review (Skill 2.5).
---

# Skill 3: create-umbraco-schema-management-api

Use this skill **only after** the user approves a schema proposal.

**Goal:** Create a new Umbraco site/root node, then create document types, properties, block types, and content nodes through the Management API.

**Required Checks (before using Management API):**
- Project name is identified
- New site/root node name is confirmed (NOT reusing an existing root)
- Management API credentials are available
- document type aliases are approved
- property aliases are approved
- whether to create draft only or publish
- whether this is staging or production

**Steps:**
1. **Create new site/root node** — create a new root-level content node with the project name (e.g., "Black Ivory"). Do NOT reuse an existing root node. If a root node with this name already exists, STOP and ask for confirmation.
2. Authenticate with the Management API.
3. Check whether document types already exist.
4. Create document types (one new type per major page per Rule 2).
5. Create property groups/tabs.
6. Create properties.
7. Create block types if needed.
8. Create reusable entity types if needed (blog posts, journal posts, etc.).
9. Create siteSettings content node under the new root.
10. Create page content nodes under the new root.
11. Create media folder for this project.
12. Populate content from frontend fallback/hardcoded content.
13. Publish only if approved.
14. Verify via Delivery API.

**Guardrails:**
- NEVER reuse an existing site root for a new project.
- NEVER reuse existing content nodes from a previous project.
- Do not overwrite existing document types without explicit approval.
- Do not delete properties automatically.
- Do not publish automatically unless instructed.
- Do not expose credentials.
- If old brand content is detected in the new project, STOP and warn.

**Response:**

```
Project: <project name>
New Root Node: <name> (created / already exists — requiring confirmation)

Created:
- Site Root: <name> (<status>)
- Document Types: <N> created (<list>)
- Properties: <count> across <count> tabs
- Block Types: <count>
- Entity Types: <count>
- Content Nodes: <N> under root (<status: draft/published>)
- siteSettings: <configured / pending>
- Media folder: /media/<project-slug>/ (<status>)

Verification:
- Delivery API: <curl command or "pending">
- Status: <success / partial / blocked>

Warnings: <any issues or manual steps needed>
```

**Verification Gate (Skill 3):** Before claiming CMS schema creation complete:

1. **IDENTIFY:** `curl` the Delivery API for EVERY created document type. Count returned properties against expected properties from the approved schema.
2. **RUN:** `for alias in $(list created document types); do curl -s -H "Api-Key: $KEY" "$API_URL/content?filter=contentType:$alias" | jq '.items[0].properties | length'; done`
3. **READ:** Full output — HTTP status for each document type, property count for each, any errors or missing types.
4. **VERIFY:** Every document type returns HTTP 200. Every property from the approved schema is present in the Delivery API response. Block List item counts match expectations. No error responses.
5. **ONLY THEN:** Claim CMS schema creation complete. Proceed to Skill 5 (content seeding).
