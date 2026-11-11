# Git Graph for DeepSeek Harness

Browse commit history, inspect diffs, and manage Git changes without leaving a Harness conversation. Repository discovery and remembered selections are isolated by workspace.

**Maintainer:** [EdgarSantiago](https://github.com/EdgarSantiago) · **Category:** Development & Operations · **License:** [MIT](./LICENSE) · **Target:** DSH `0.2.2-rc.1`

[Português — documentação](./README_PTBR.md)

This is an independent, AI-assisted adaptation of [1841220388zzzcccxxx-star/dsh-git-graph](https://github.com/1841220388zzzcccxxx-star/dsh-git-graph). It is not an official DeepSeek product. The upstream MIT notice and attribution are preserved. The published repository starts with a fresh maintainer history rather than importing the upstream commits.

## Install from GitHub

For the Web profile:

```sh
dsh plugin --profile web add github:EdgarSantiago/dsh-git-graph
```

For the Desktop profile:

```sh
dsh plugin --profile desktop add github:EdgarSantiago/dsh-git-graph
```

Open a conversation and select **Git graph**. Follow the plugin manager's reload guidance if it reports that a reload is needed; a full application restart is not a universal requirement.

The package identifier is `@edgarsantiago/dsh-git-graph`. This is a **GitHub-only source release**, not an npm release. The package remains marked `private` to prevent accidental npm publication; that does not make the GitHub repository private or prevent installation from GitHub.

### Catalog discovery

The repository uses the GitHub topic **`dsh-plugin`**. According to the [catalog submission requirements](https://dsh-plugin.org/submit), public source repositories with a root manifest and installation instructions can be indexed on the website after its next scan/review. The in-app Plugin Hub additionally requires an npm package. This repository does not claim that either listing or community verification has already occurred.

## Features

- Native `conversation.view` tab: no iframe, duplicate React installation, or custom theme system.
- English-only controls, messages and date formatting, independent of the Harness language.
- Automatic discovery at the workspace root and up to two directory levels below it, including sibling repositories, nested repositories, and Git worktrees.
- Repository list and remembered selection scoped to the current workspace. Old responses and confirmations cannot populate a different workspace.
- Commit graph, text search, branch/tag filter, paginated history, commit details, file history, and commit comparison.
- Staged, unstaged and untracked file groups, per-file diffs and batch selection.
- Stage, unstage, restore, ignore, commit, fetch, pull, push, branch and tag operations, with UI confirmation before writes.
- An approval-gated `git_graph_operation` Agent tool using the same Git executor, restricted to the Agent's current repository.

Commit messages, authors, branch names and file paths are repository data and are not translated.

## Usage

1. Open **Git graph** in a conversation. The current workspace is shown below the toolbar.
2. Pick one of the discovered repositories. Use **Find repositories** or **Refresh** to rescan.
3. Use **Open repository** to explicitly add another repository to this workspace only.
4. Click a commit for details. Select **Compare**, then another commit, to compare them.
5. Review working-tree files and confirm any requested write operation before execution.

Keyboard: **↑/↓** selects a commit, **Enter** opens details, **Ctrl/⌘+F** focuses search, and **Escape** closes the active detail/confirmation.

## Permissions, network and risks

- Reads Git history, refs, repository configuration, working-tree state, and requested diffs using the local Git executable.
- Can modify selected files, the index, commits, refs and remotes through the confirmed Git operations. **Restore/discard may lose local changes; push publishes commits.**
- HTTP access requires Harness authentication. Writes require a same-origin POST and repository/workspace authorization.
- Git is invoked using `execFile` and fixed argument arrays, not shell command interpolation. Paths and symlink boundaries are checked; output is bounded.
- Agent-tool writes require approval on each call. HTTP and Agent operations share the executor.
- Fetch, pull and push may contact the repository's configured remotes and use Git's existing credential setup. **Open remote commit** opens a supported HTTPS hosting URL in your browser.
- The UI and commit-message heuristic do not call a model or AI service. No telemetry endpoint or automatic plugin download/update is added; normal Agent conversations retain their usual model usage.
- Browser storage remembers explicitly opened repositories and selection per canonical workspace path; it is not a global cross-project repository list.

## Compatibility and limitations

- Declared and exercised against **DeepSeek Harness `0.2.2-rc.1`**; the same exact version is specified by `engines.dsh` and the optional DSH peer.
- Requires Node.js **18+**, Git on PATH, and the Harness Web interface (including Desktop's Web UI).
- Development and live plugin registration were checked on macOS. Do not interpret this as certification of every operating system or future Harness preview.
- Discovery is bounded to **two levels, 300 directories and 20 repositories** per scan; hidden/heavy directories and external symlinks are skipped.
- History loads 200 commits per page. There is one branch filter at a time and up to eight visual graph lanes.
- External changes require **Refresh**. This adaptation does not include upstream decorative backgrounds, automatic polling, or self-update.
- The historical endpoint `/git-graph-bilingual/api` and Slot ID are intentionally retained for compatibility; the UI has no Portuguese translation or language selector.

## Validation and development

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm run check
pnpm test
```

No build step or production dependencies are required. Tests use Node's built-in test runner and the Cordis SDK, with isolated real Git repositories. They cover authentication/origin gates, traversal and symlinks, repository discovery, workspace races, lifecycle disposal, confirmed operations, and the English-only UI contract.

Selected real test output:

```text
✔ automatic discovery includes child repositories even when the workspace root has Git
✔ stale workspace identities reject reads and writes before touching a repository
✔ real traced plugin applies, serves reads, disposes both registries and reapplies without collisions
```

These are automated tests, not a fabricated screenshot or a claim of automated visual verification. The legacy screenshots, standalone `web/` page, scripts and compatibility notes retained from upstream describe older releases; they are not current runtime entry points or the validation instructions for this adaptation.

## Source and license

Current entry points: `index.js` (Host), `client.js` (native Client), and `cordis.patch.yml` (bundle registration). The `files` allowlist excludes dependencies, tests, legacy scripts and historical screenshots from the installable package.

Derived from the original [dsh-git-graph](https://github.com/1841220388zzzcccxxx-star/dsh-git-graph); upstream contributors retain their copyright. Distributed under the original [MIT license](./LICENSE). See [CHANGELOG.md](./CHANGELOG.md) for adaptation release notes.
