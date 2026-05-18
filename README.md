# Factory Droid Custom Droids

Custom [Factory Droid](https://factory.ai) agents for mission-based development workflows.

## Droids

| Droid | Purpose |
|---|---|
| **worker** | General-purpose worker for delegating non-trivial tasks (code exploration, Q&A, research, analysis) |
| **scrutiny-feature-reviewer** | Deep code review for a single feature during mission validation |
| **user-testing-flow-validator** | Tests validation contract assertions through real user surfaces (web UI, CLI, API) |

## Installation

```bash
# Clone the repo
git clone git@github.com:tindevelopers/factory-droids.git ~/.factory/droids
```

Or copy individual droids to `~/.factory/droids/`:

```bash
cp worker.md ~/.factory/droids/
cp scrutiny-feature-reviewer.md ~/.factory/droids/
cp user-testing-flow-validator.md ~/.factory/droids/
```

## IDE Compatibility

Factory Droid droids and skills are tied to the Factory Droid runtime, not any specific IDE. As long as Factory Droid is installed on the target machine, these droids will work identically in any supported environment (CLI, VS Code, etc.).

## Required Plugins

These droids work alongside plugins that should also be installed:

```bash
droid mcp add superpowers obra/superpowers
droid mcp add core Factory-AI/factory-plugins
```
