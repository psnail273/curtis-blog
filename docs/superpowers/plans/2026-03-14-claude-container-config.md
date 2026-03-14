# Claude Container Configuration Improvements — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mount the host's `~/.claude` into the container instead of a repo-local `.claude-home`, and remove `--dangerously-skip-permissions` in favor of user-configured permission rules.

**Architecture:** Two files change — `claude.start.sh` (mount source + cleanup) and `Dockerfile.claude` (entrypoint flag). No application code changes. No tests (infrastructure scripts).

**Tech Stack:** Bash, Docker

**Spec:** `docs/superpowers/specs/2026-03-14-claude-container-config-design.md`

---

## Chunk 1: Implementation

### Task 1: Update `claude.start.sh` — mount host `~/.claude`

**Files:**
- Modify: `claude.start.sh:54-57`

- [ ] **Step 1: Replace the `.claude-home` mount block**

Replace lines 54–57 of `claude.start.sh`:

```bash
# Mount ~/.claude user-level config (auth/credentials) — uses a separate dir
# from the project's .claude/ to avoid skills appearing twice.
mkdir -p ".claude-home"
MOUNT_ARGS+=(-v "$(pwd)/.claude-home:/home/node/.claude:z")
```

With:

```bash
# Mount host ~/.claude user-level config (auth, credentials, settings)
if [[ ! -d "$HOME/.claude" ]]; then
    echo "Error: ~/.claude not found. Run 'claude' on the host first to initialize." >&2
    exit 1
fi
MOUNT_ARGS+=(-v "$HOME/.claude:/home/node/.claude:z")
```

- [ ] **Step 2: Verify the script is syntactically valid**

Run: `bash -n claude.start.sh`
Expected: no output (clean parse)

- [ ] **Step 3: Commit**

```bash
git add claude.start.sh
git commit -m "feat: mount host ~/.claude instead of repo-local .claude-home"
```

---

### Task 2: Update `Dockerfile.claude` — remove dangerous mode

**Files:**
- Modify: `Dockerfile.claude:28`

- [ ] **Step 1: Replace the ENTRYPOINT**

Replace line 28 of `Dockerfile.claude`:

```dockerfile
ENTRYPOINT ["/bin/bash", "-c", "exec claude --dangerously-skip-permissions \"$@\"", "--"]
```

With:

```dockerfile
ENTRYPOINT ["/bin/bash", "-c", "exec claude \"$@\"", "--"]
```

- [ ] **Step 2: Verify the change is correct**

Run: `grep ENTRYPOINT Dockerfile.claude`
Expected: `ENTRYPOINT ["/bin/bash", "-c", "exec claude \"$@\"", "--"]` — no `--dangerously-skip-permissions`. Full Dockerfile validation happens in Task 4 (rebuild and verify).

- [ ] **Step 3: Commit**

```bash
git add Dockerfile.claude
git commit -m "feat: remove --dangerously-skip-permissions from container entrypoint"
```

---

### Task 3: Clean up local `.claude-home` directory

**Files:**
- Delete: `.claude-home/` (local untracked directory)

- [ ] **Step 1: Remove the local `.claude-home` directory**

Run: `rm -rf .claude-home`
Expected: directory removed. It is already in `.gitignore` (line 44), so no git changes.

- [ ] **Step 2: Verify `.gitignore` already covers it**

Run: `grep -n 'claude-home' .gitignore`
Expected: line 44 shows `.claude-home/`

- [ ] **Step 3: Verify clean git status**

Run: `git status`
Expected: no untracked `.claude-home` files, no staged changes beyond the prior commits.

---

### Task 4: Rebuild and verify

- [ ] **Step 1: Rebuild the container image**

Run: `./claude.start.sh --build --help`

This rebuilds the image with the updated Dockerfile and passes `--help` to Claude Code (a safe no-op) to verify the entrypoint works without `--dangerously-skip-permissions`.

Expected: Image builds successfully. Claude Code prints its help text and exits.
