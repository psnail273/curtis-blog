# Claude Container Configuration Improvements

## Problem

The current container setup has two issues:

1. **Claude's user-level config (`~/.claude`) is stored repo-locally** in `.claude-home/`, meaning credentials, plugins, and settings don't carry over from the host and must be maintained separately per-repo.
2. **The container runs with `--dangerously-skip-permissions`**, bypassing Claude Code's permission system entirely. This removes the safety net of deny rules and means all tool calls are auto-approved without any configuration granularity.

## Prerequisites

- The host machine must have a `~/.claude` directory with valid Claude Code authentication (credentials, API key, etc.)
- The host `~/.claude/settings.json` should be configured with appropriate allow/deny rules (see section 4)

## Solution

### 1. Mount host `~/.claude` as user-level config

**File: `claude.start.sh`**

- Remove `mkdir -p ".claude-home"`
- Replace the `.claude-home` volume mount:
  - Before: `-v "$(pwd)/.claude-home:/home/node/.claude:z"`
  - After: `-v "$HOME/.claude:/home/node/.claude:z"`
- Update the comment on lines 54-55 to reflect the new mount source
- All other mounts remain unchanged (project code, `.claude.json`, git config)

### 2. Remove dangerous mode from Dockerfile

**File: `Dockerfile.claude`**

- Change ENTRYPOINT inner command:
  - Before: `exec claude --dangerously-skip-permissions "$@"`
  - After: `exec claude "$@"`
  - (Full ENTRYPOINT is a JSON array wrapping this in `/bin/bash -c`)

### 3. Clean up local `.claude-home`

`.claude-home/` is not tracked by git (already in `.gitignore`). Remove the local directory — it will no longer be created since the `mkdir -p` is removed from `claude.start.sh`.

### 4. Permission configuration (user responsibility)

The user's host `~/.claude/settings.json` should contain a permissive allow-list to avoid constant prompts. Recommended configuration:

```json
{
  "allow": [
    "Bash(*)",
    "Read(*)",
    "Edit(*)",
    "Write(*)"
  ]
}
```

This is not enforced by the script — it's the user's responsibility to configure their host `~/.claude/settings.json` as desired. Any existing settings (plugins, effort level, etc.) in the host config will carry over automatically.

### 5. No changes to project-level config

**File: `.claude/settings.json`** remains unchanged with its existing deny rules for `.env` files.

## Files Modified

| File | Change |
|------|--------|
| `claude.start.sh` | Mount `$HOME/.claude` instead of `.claude-home`; remove `mkdir`; update comment |
| `Dockerfile.claude` | Remove `--dangerously-skip-permissions` from ENTRYPOINT |

## Files Unchanged

| File | Reason |
|------|--------|
| `.claude/settings.json` | Project-level deny rules stay as-is |
| `.claude.json` mount | Project-specific session state stays with the project |
| `.gitignore` | Already contains `.claude-home/` |
| `Dockerfile` (production) | Unrelated to Claude dev container |
