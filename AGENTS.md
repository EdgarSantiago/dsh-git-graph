# Git Graph adaptation — contributor guide

## Current runtime

- `index.js` is the Host plugin: authenticated Git API and approval-gated Agent tool.
- `client.js` is the native React Client registered in `conversation.view`. Do not restore the legacy iframe UI.
- `cordis.patch.yml` registers `@edgarsantiago/dsh-git-graph` as a bundle.
- Read `README.md` for current installation, permissions and compatibility; `CHANGELOG.md` records adaptation releases.
- The repository contains only the native implementation, tests and current documentation. Do not restore old iframe assets or upstream release scripts.

## Safety and compatibility constraints

- Use `execFile` with fixed Git argv; never interpolate shell commands.
- Preserve authentication, same-origin POST gates, canonical workspace/repository authorization, traversal/symlink checks, bounded output and credential redaction.
- UI writes require confirmation; Agent-tool writes require approval on every call. Both must use the shared executor.
- Keep the stable `/git-graph-bilingual/api` prefix and `git-graph-bilingual` Slot ID unless an explicit migration is requested. They are identifiers, not language support.
- Repository discovery and browser memory belong to a canonical workspace. Never fall back to globally remembered repositories or an enclosing unrelated Git root.
- Own route/tool registrations through Cordis effects, with idempotent cleanup and activation rollback. An ordinary `dispose` event is not plugin lifecycle cleanup.
- Keep the UI English-only; do not reintroduce a language selector or global Harness locale dependency.
- Target exactly `0.2.2-rc.1 || 0.2.2-rc.2` consistently in `engines.dsh` and the optional DSH peer. Both were checked against their SDKs; do not broaden compatibility without new evidence.
- Preserve the original MIT notice and upstream attribution. Do not commit credentials, machine-specific host paths, node_modules, archives or profile data.
- Write JSON/YAML as UTF-8 without BOM.

## Validate changes

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm run check
pnpm test
```

Tests use Node's built-in runner, real temporary Git repositories and the Cordis SDK. Prefer focused regressions; do not emulate React/DOM or invent screenshots as visual evidence. Do not replace the user's running Harness with another server.

## Distribution

This release is GitHub-only. `private: true` is an intentional npm-publication guard, not GitHub visibility. Do not publish npm or commit/tag/push without a corresponding user request. Install or update the local profile through Harness's plugin manager, never by editing profile manifests manually.
