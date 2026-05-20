---
name: phase-retrospective
description: >-
  Capture discovered patterns, API quirks, failure modes, and reusable techniques
  after every lifecycle phase. Persists learnings to the droid's permanent
  configuration (Common Mistakes, Rationalization Table, Red Flags) so the next
  project benefits from this project's discoveries. Use automatically after
  every phase (1-14), before starting the next phase.
---

# Skill 11: phase-retrospective

Use this skill automatically at the end of EVERY lifecycle phase (1-14), before starting the next phase. Also invoke on manual request when the user wants to capture learnings.

**Goal:** Capture discovered patterns, API quirks, failure modes, and reusable techniques before context is lost between droid sessions. Persist learnings to the droid's permanent configuration so the NEXT project benefits from THIS project's discoveries.

**Steps:**

1. **COMPARE: Planned vs Actual**
   - What did this phase intend to achieve?
   - What was actually achieved?
   - Identify deviations and their root causes

2. **DOCUMENT PATTERNS**
   - API quirks discovered (format requirements, silent failures, undocumented behaviors)
   - Reusable techniques (new Management API patterns, Delivery API optimizations)
   - Framework-specific gotchas encountered during this phase

3. **FLAG SURPRISES**
   - Anything that didn't work as documented
   - Anything that required workarounds
   - Any silent failures that produced no errors but wrong results
   - Any unexpected dependencies or missing tooling

4. **SCORE THE PHASE**
   - Completeness: 0-100% (what fraction of planned work was achieved?)
   - Issues found: count by severity (CRITICAL / HIGH / MEDIUM / LOW)
   - Patterns discovered: count of new, reusable patterns
   - Rework required: estimate of effort spent on fixes vs. new work

5. **UPDATE PATTERN LIBRARY** (persist to droid's permanent configuration)
   - New API patterns → add to Skill 3 and Skill 4 procedure steps
   - New failure modes → add to Common Mistakes table
   - New rationalizations → add to Rationalization Table
   - New red flags → add to Red Flags list
   - Framework-specific discoveries → add to Skill 4 framework table
   - New verification shortcuts to guard against → add to anti-rationalization entries

6. **GENERATE PRE-FLIGHT CHECKLIST**
   - What should the NEXT phase watch out for?
   - What assumptions from this phase affect the next?
   - What verification commands should the next phase run first?
   - What state must be confirmed before proceeding?

**Response:**

```json
{
  "phase": "Phase N — <phase name>",
  "timestamp": "<ISO 8601>",
  "project": "<project name>",
  "planned": "<what was intended>",
  "actual": "<what was achieved>",
  "deviations": ["<deviation 1>", "<deviation 2>"],
  "completeness": 0.0,
  "issues_found": {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "patterns_discovered": [
    {
      "name": "<pattern name>",
      "description": "<what was discovered>",
      "severity": "HIGH|MEDIUM|LOW",
      "permanent": true,
      "persisted_to": "<Common Mistakes | Rationalization Table | Red Flags | Skill 4 table>"
    }
  ],
  "surprises": [
    "<something unexpected>"
  ],
  "preflight_for_next_phase": [
    "<checklist item 1>",
    "<checklist item 2>"
  ],
  "pattern_library_updates": {
    "common_mistakes_added": 0,
    "rationalization_entries_added": 0,
    "red_flags_added": 0,
    "framework_patterns_updated": false
  }
}
```

**Pattern Library Persistence Instructions:**

When persisting discovered patterns to the droid's permanent configuration:

- **Common Mistakes table:** Add entries in format `| Mistake | What happens | How to avoid |`. Include the specific mistake, its concrete consequence, and the preventive measure.
- **Rationalization Table:** Add entries in format `| Excuse | Reality |`. Capture the exact excuse an agent might make and the counter-argument proving it wrong.
- **Red Flags list:** Add bullet points describing the specific thought or situation that should trigger a stop-and-reassess.
- **Skill 4 framework table:** For framework-specific API quirks or gotchas, append a note to the relevant framework row.
- **Decision Rules:** For new common user requests discovered, add a mapping row to the Decision Rules table.

**Guardrails:**
- Never skip the retrospective — even small phases yield reusable patterns
- Never defer pattern persistence — do it immediately before context is lost
- Be specific in pattern descriptions — "API returned 400 on alias conflict" is better than "API issues"
- Always include the CONCRETE consequence of a mistake — "caused 30 min of debugging" or "produced silent wrong output"
- Retrospective output is permanent droid knowledge — write it as if the next project depends on it (because it does)
