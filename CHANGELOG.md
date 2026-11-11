# Changelog

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

Adapted from [1841220388zzzcccxxx-star/dsh-git-graph](https://github.com/1841220388zzzcccxxx-star/dsh-git-graph), whose MIT notice and source attribution are retained. The public branch uses a fresh maintainer history. Older upstream files and screenshots do not describe the current native Client implementation.
