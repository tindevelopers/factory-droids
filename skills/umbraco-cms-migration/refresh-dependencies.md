---
name: refresh-dependencies
description: >-
  Check, update, and reconcile external dependencies (Superpowers plugin and
  Graphify pip package) against a 7-day staleness threshold. Three operating
  modes: CHECK (read-only, automatic on session start), UPDATE (applies
  external updates only), and RECONCILE (diffs external changes against droid
  internals, auto-adopts safe changes, flags conflicts). Includes rollback
  procedure. Use on droid session start or manually via "refresh dependencies",
  "update skills", "check for updates", or "reconcile".
---

# Skill 15: refresh-dependencies

Use this skill automatically on droid session start (if last check > 7 days) or manually via `"refresh dependencies"`, `"update skills"`, `"check for updates"`, or `"reconcile"` user commands.

**Goal:** Check external dependencies (Superpowers plugin + Graphify pip package) for staleness and available updates. Three operating modes: CHECK (read-only, automatic), UPDATE (applies external updates only — never modifies droid internals), and RECONCILE (diffs external skill changes against droid internals, auto-adopts safe changes, flags conflicts for user approval). Includes a rollback procedure for both external and reconciled changes.

**Operating Modes:**

### Mode 1: CHECK (automatic, read-only, non-destructive)

Triggered automatically on session start if any dependency's `last_checked` exceeds 168 hours (7 days). Also available via `"check dependencies"` user command.

**Steps:**

1. **Check Superpowers plugin version:**
   - Run: `droid plugin marketplace list` (check for `superpowers@superpowers` updates)
   - Run: `droid skill list` (compare installed Superpowers skills against expected set)
   - If version info available: compare installed version vs latest available

2. **Check Graphify pip package version:**
   - Run: `pip index versions graphifyy 2>/dev/null || pip show graphifyy`
   - Compare installed version vs latest available on PyPI

3. **Check Graphify skill freshness:**
   - Run: `graphify --version` to confirm package version

4. **Check staleness against 7-day threshold:**
   - Compare `last_checked` timestamps in the Dependency Manifest against current time
   - If any dependency → last checked > 168 hours: flag as STALE
   - If all dependencies within 168 hours and versions match: report CLEAN

5. **Produce CHECK Report** — read-only analysis, update `last_checked` timestamps.

### Mode 2: UPDATE (applies external updates, never modifies droid internals)

Triggered by `"update dependencies"`, `"update skills"`, or `"apply updates"` user command. Always confirm with the user before applying updates.

**Steps:**

1. **Update Superpowers plugin:**
   - Record current version → save to `previous_version`
   - Run: `droid plugin update superpowers@superpowers`
   - Verify: `droid skill list`

2. **Update Graphify pip package:**
   - Record current version → save to `previous_version`
   - Run: `pip install --upgrade graphifyy`
   - Run: `graphify install`
   - Verify: `graphify --version`, `graphify --help`

3. **Update Dependency Manifest:** Record new versions, update `last_checked`, save `previous_version` for rollback.

4. **Produce UPDATE Report** — summary of what changed, verification, new capabilities, rollback info.

### Mode 3: RECONCILE (diffs external changes against droid internals, user-reviewed)

Triggered by `"reconcile"`, `"reconcile dependencies"`, or `"sync external skills"` user command. **ALWAYS requires user approval before modifying droid internals.**

**Goal:** Detect changes in external Superpowers/Graphify skill definitions, diff them against the droid's embedded behavioral rules and integration patterns, classify each change, auto-adopt safe changes, and flag conflicts for user approval. Core Rules (1-12) are NEVER auto-modified.

**Steps:**

1. **FETCH updated external skill definitions** — compare against droid's current embedded adoption.
2. **DIFF each external skill against droid's embedded rules**
3. **CLASSIFY each change:**

   | Category | Auto-Adopt? | Example |
   |----------|------------|---------|
   | **NEW_TOOL** | **YES** — Auto-adopt | Graphify adds `get_hyperedge` MCP tool |
   | **NEW_SKILL** | **YES** — Add reference | Superpowers adds `performance-review` skill |
   | **BUG_FIX** | **YES** — Auto-adopt | TDD procedure adds "verify RED" step |
   | **ENHANCED_PATTERN** | **REVIEW** — Present to user with recommendation | Brainstorming adds "visual companion" |
   | **PROCEDURE_CHANGE** | **REVIEW** — Present to user with recommendation | Verification gate changes from 5-step to 6-step |
   | **REMOVED** | **REVIEW** — Present to user with recommendation | Superpowers deprecates a skill |
   | **CONFLICT** | **NEVER** auto-adopt | External change contradicts droid's CMS-specific customization |

4. **GENERATE Reconciliation Report**
5. **APPLY changes based on classification** — auto-adopt safe changes, present REVIEW items, flag CONFLICT items.
6. **UPDATE droid internals for approved changes**
7. **PRODUCE RECONCILE Report**

**Auto-Adopt Rules (hardcoded — never bypass):**
- NEW_TOOL, NEW_SKILL, and BUG_FIX are ALWAYS auto-adopted — logged with full diff for audit
- CONFLICT is NEVER auto-adopted — always flagged for manual user resolution
- ENHANCED_PATTERN, PROCEDURE_CHANGE, and REMOVED always require user review
- **Core Rules (1-12) are NEVER auto-modified by ANY reconciliation category**

### Rollback Procedure

If an update or reconciliation breaks the droid's functionality:

1. **Identify the breaking change**
2. **Roll back external dependency to previous version**
3. **Roll back droid embedded rules (if reconciliation caused the break)**
4. **Verify rollback** — confirm rolled-back version is active, test basic functionality, run Mode 1 CHECK
5. **Record the blocked version** in Dependency Manifest `blocked_versions`
6. **Report to user**

### Startup Auto-Check Sequence

On every droid session start:
1. Read Dependency Manifest to find `last_checked` timestamps
2. If any dependency's `last_checked` > 168 hours: run Mode 1 CHECK (non-blocking). Notify user of updates if available.
3. If all dependencies within 7 days: skip check
4. User actions: `"update dependencies"` → Mode 2, `"check dependencies"` → Mode 1, `"reconcile"` → Mode 3, ignore → continue

**Guardrails:**
- Mode 1 (CHECK) is ALWAYS read-only — never modifies files or installs anything
- Mode 2 (UPDATE) only touches external tools — never modifies droid internals
- Mode 2 ALWAYS requires user confirmation before applying updates
- Mode 3 (RECONCILE) modifies droid internals — ALWAYS requires user approval for REVIEW and CONFLICT items
- Mode 3 auto-adopts only NEW_TOOL, NEW_SKILL, and BUG_FIX — all logged with full diff
- **Core Rules (1-12) are NEVER auto-modified by ANY operating mode**
- Previous versions are ALWAYS recorded before applying any update
- Blocked versions are checked on every Mode 1 run
- If an update breaks functionality: immediately roll back, record blocked version, report to user
- If a reconciliation breaks functionality: roll back the specific embedded rules, record breaking change, report to user
- Startup auto-check is non-blocking: a stale dependency check does not prevent migration work
- Dependency Manifest is part of the droid's permanent configuration
