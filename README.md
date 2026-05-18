# Factory Droid — Custom Droids & Skills

Custom [Factory Droid](https://factory.ai) agents and skills for development workflows.

## Droids

Custom subagents invoked via the `Task` tool. Install to `~/.factory/droids/`.

| Droid | Purpose |
|---|---|
| **worker** | General-purpose worker for delegating non-trivial tasks (code exploration, Q&A, research, analysis) |
| **scrutiny-feature-reviewer** | Deep code review for a single feature during mission validation |
| **user-testing-flow-validator** | Tests validation contract assertions through real user surfaces (web UI, CLI, API) |

## Skills

Custom skills invoked via the `Skill` tool. Install to `~/.factory/skills/<name>/SKILL.md`.

| Skill | Purpose |
|---|---|
| **vercel-watch** | Monitor a Vercel deployment from trigger until success or failure |

## Installation

Clone and symlink/copy into place:

```bash
git clone git@github.com:tindevelopers/factory-droids.git ~/factory-droids

# Droids
cp ~/factory-droids/droids/*.md ~/.factory/droids/

# Skills
cp -r ~/factory-droids/skills/* ~/.factory/skills/
```

## IDE Compatibility

Factory Droid droids and skills are tied to the Factory Droid runtime, not any specific IDE. As long as Factory Droid is installed on the target machine, these will work identically in any supported environment (CLI, VS Code, etc.).

## Required Plugins

These work alongside plugins that should also be installed:

```bash
droid mcp add superpowers obra/superpowers
droid mcp add core Factory-AI/factory-plugins
```
