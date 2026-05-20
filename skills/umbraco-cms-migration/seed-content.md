---
name: seed-content
description: >-
  Move hardcoded frontend content into Umbraco content nodes. Seeds exactly
  ONE test value per document type field to validate the entire pipeline
  (Management API → Delivery API → Frontend) before optional full migration.
  Use when migrating hardcoded content to Umbraco or seeding test content.
---

# Skill 5: migrate-hardcoded-content-to-umbraco

Use this skill when moving existing hardcoded frontend content into Umbraco.

**Goal:** Take hardcoded content from a frontend page and migrate it into Umbraco content nodes.

**Steps:**
1. Extract hardcoded strings.
2. Extract image references.
3. Extract CTAs.
4. Extract SEO fields.
5. Map content to approved Umbraco fields.
6. Create or update content node through Management API.
7. Keep fallback content in code until migration is verified.
8. Verify content through Delivery API.
9. Confirm page renders from CMS.
10. Recommend cleanup of stale fallback content.

**Guardrails:**
- Do not delete fallback content until CMS content is verified.
- Preserve the frontend layout.
- Do not change brand copy unless asked.

**Response:**

```
Summary: Migrated <N> content fields from <source file> to <content node path>

Migrated:
- Text fields: <count>
- Images: <count>
- SEO fields: <count>
- CTAs: <count>

Verification:
- Delivery API: <confirmed / pending>
- Frontend render: <confirmed / pending>

Fallbacks: <kept in place until verified / safe to remove>
```

**Verification Gate (Skill 5):** Before claiming content migration/seeding complete:

1. **IDENTIFY:** `curl` the Delivery API for EVERY seeded content node and verify the test values appear in the response exactly as written. Block List items must return count > 0.
2. **RUN:** `curl -s -H "Api-Key: $KEY" "$API_URL/content?filter=contentType:$alias" | jq '.items[0].properties'` for each seeded type. Verify individual field values match seeded test values.
3. **READ:** Full API response for each document type. Every seeded field's test value must be present and correct. Block List item arrays must be non-empty.
4. **VERIFY:** Every field accepted content (no write errors). Every field returns content via Delivery API (no read errors). All Block Lists render their items. Content pipeline is validated end-to-end.
5. **ONLY THEN:** Claim content seeding complete. Full migration may proceed (if user-approved). Fallback content may be considered for cleanup.
