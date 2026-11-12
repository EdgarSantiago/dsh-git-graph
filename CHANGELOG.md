# Changelog

## 0.14.6 (local, unreleased)

- Admit exactly DSH `0.2.2-rc.1 || 0.2.2-rc.2` in both engine and optional peer after inspecting rc.2 Host/Client contracts and running regressions against both Cordis SDKs. Preserve all existing Git, workspace, authentication and approval behavior; live GUI verification remains separate.

- Replace the former English-only requirement with Harness Settings → Language integration for en, pt (pt-BR alias), zh, ja, es, fr, de and ru; no separate selector or preference write.
- Embed complete dictionaries in the self-contained ModuleLoader client, register them through lifecycle-owned locale effects, and reactively translate the tab, controls, aria labels, confirmations and notices without resetting view state. Dates follow the selected language.
- Localize display metadata for all languages; preserve commits, authors, refs, paths, raw Git diagnostics, stable API/Slot IDs and all workspace/auth/approval protections.
- Replace English-only regressions with locale key/alias/date/fallback/selection and live-feedback contract checks. Keep lifecycle test fixtures within the plugin directory.

- Compress a clean working tree into one Changes summary row, with collapsible file groups when changes exist.
- Add subtle theme-based borders, clearer selected branches/commits and current-branch indicators.
- Align commit, hash, author and date headers; use a compact graph gutter and a sticky table header.
- Add lightweight SVG control icons and worktree-aware Stage all, Unstage all and Commit availability.
- Pin smaller keyboard hints below the history and retain branch/tag actions in narrow panes.
- Preserve selection by commit hash and keep focus/navigation within the owned history rows.
- Keep all Git write confirmations and workspace isolation unchanged. No GitHub/npm publication is performed for this local update.
- Remove the unused standalone web UI, historical screenshots/compatibility docs, old release scripts, README redirect and empty npm configuration.
- Prune superseded CSS declarations and unused labels without changing responsive rules; remove an unreachable directory-browser branch.
- Surface failed Git status/index reads instead of returning a misleading clean working tree; retain unborn-repository support.

## 0.14.5

- Prepare the GitHub source release under `@edgarsantiago/dsh-git-graph`, with installation, permissions, compatibility and upstream credits documented.
- Preserve the upstream MIT notice and attribution, with a fresh initial maintainer commit for this repository. Existing Slot/API identifiers and workspace storage remain compatible.
- Configure pnpm 11 through `pnpm-workspace.yaml` so frozen installs match the committed peer settings in CI.
- Fix successful pull/push responses in the shared executor so completed operations are not incorrectly reported as failures. Unknown operations return a structured error.
- Strip credentials and URL query/fragment data from remote information returned to the browser.
- Add real local bare-remote tests for pull/push and regression coverage for remote URL sanitization.
- Keep GitHub distribution separate from npm publication; no automatic update or npm publish is performed.

## 0.14.4

- Make the UI, tab label, date formatting and plugin display metadata English-only.
- Remove language selection and ignore old saved language overrides without changing the Harness language.

## 0.14.3

- Isolate discovered repositories and remembered selections by workspace.
- Prioritize native workspace membership over stale Agent/session working directories.
- Discover sibling/nested repositories and worktrees without ascending into another project's Git root.
- Reject stale reads/writes and suppress late responses after workspace or repository changes.

## 0.14.2

- Own route/tool cleanup through Cordis effects, with rollback on activation failure.
- Move HTTP access to the stable namespaced endpoint to avoid orphan routes from the earlier implementation.

## Upstream

Adapted from [1841220388zzzcccxxx-star/dsh-git-graph](https://github.com/1841220388zzzcccxxx-star/dsh-git-graph), whose MIT notice and source attribution are retained. The public branch uses a fresh maintainer history. Obsolete upstream pages, scripts and screenshots have been removed; the native implementation and regression tests are maintained here.
