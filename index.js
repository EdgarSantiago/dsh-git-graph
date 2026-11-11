// dsh-git-graph — server half
// Registers HTTP routes under /git-graph-bilingual:
//   GET /git-graph-bilingual/api?op=<op>&repo=<path>[&hash=<sha>] -> JSON git data
//   POST /git-graph-bilingual/api?op=gitop|addrepo|reveal        -> same-origin mutations
// HTML is owned by the native Harness client; self-updates are disabled.
// Commands are executed with execFile (no shell), fixed argument lists only.
import { execFile } from 'node:child_process'
import { appendFileSync, readdirSync, readFileSync, realpathSync, statSync, openSync, readSync, closeSync } from 'node:fs'
import { dirname, join, resolve, isAbsolute, relative } from 'node:path'
const MAX_GIT_BUFFER = 32 * 1024 * 1024
const MAX_DIFF_CHARS = 240000
export const API_PREFIX = '/git-graph-bilingual'

function safeDiagnostic(value) {
  let text = String(value ?? '').replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g, '[redacted private key]')
    .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '').replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '')
    .replace(/(https?:\/\/)[^/\s@]+@/gi, '$1[redacted]@')
    .replace(/\b(Bearer|Basic)\s+\S+/gi, '$1 [redacted]')
    .replace(/((?:access[_-]?token|refresh[_-]?token|token|password|passwd|secret|api[_-]?key|authorization|credential)["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s&,;]+)/gi, '$1[redacted]')
  for (const [key, secret] of Object.entries(process.env)) {
    if (/TOKEN|SECRET|PASSWORD|API.?KEY|CREDENTIAL|PRIVATE.?KEY|AUTHORIZATION/i.test(key) && secret && secret.length >= 4) {
      text = text.split(secret).join('[redacted]')
    }
  }
  return text.slice(0, 4000)
}

function apiError(error) {
  const message = String(error?.message || '')
  const code = /^[a-z]+(?:-[a-z]+)+$/.test(message) && safeDiagnostic(message) === message ? message : 'operation-failed'
  const detail = safeDiagnostic(error?.detail || message || 'Unexpected operation failure')
  return { ok: false, error: code, ...(detail && detail !== code ? { detail } : {}) }
}

export const name = 'git-graph'
export const inject = ['webServer', 'connection', 'tools', 'approval', 'workingDirectory']

function runGit(repo, args, maxBuffer = MAX_GIT_BUFFER, timeoutMs = 0, signal) {
  return new Promise((resolve, reject) => {
    const opts = { signal, maxBuffer, windowsHide: true, timeout: 30000, env: { ...process.env, LC_ALL: 'C', LANG: 'C', GIT_TERMINAL_PROMPT: '0', GIT_LITERAL_PATHSPECS: '1' } }
    if (timeoutMs > 0) opts.timeout = timeoutMs
    execFile('git', ['-C', repo, ...args], opts, (err, stdout, stderr) => {
      if (err) {
        const detail = (stderr || err.message || '').toString().trim()
        reject(Object.assign(new Error('git-failed'), { detail: detail.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '').replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '').replace(/(https?:\/\/)[^/\s@]+@/g, '$1[redacted]@').slice(0, 4000) }))
        return
      }
      resolve(stdout.toString())
    })
  })
}

async function isGitRepo(repo) {
  try {
    const out = await runGit(repo, ['rev-parse', '--is-inside-work-tree'])
    return out.trim() === 'true'
  } catch {
    return false
  }
}

/** Walk upward from `start` until a directory containing `.git` is found. */
function findGitRoot(start) {
  let dir = String(start).replace(/\\/g, '/').replace(/\/+$/, '') || '/'
  for (let i = 0; i < 24; i++) {
    try {
      const p = join(dir, '.git')
      const st = statSync(p)
      if (st.isDirectory() || st.isFile()) return dir
    } catch { /* keep walking */ }
    const parent = dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
  return null
}

/** Discover real work trees AT or BELOW the opened workspace, never an unrelated ancestor. */
export async function discoverWorkspaceRepos(workspace) {
  const MAX_DIRS = 300, MAX_RESULTS = 20, MAX_DEPTH = 2
  const repos = [], seen = new Set(), queue = [{ path: workspace, depth: 0 }]
  let dirs = 0, truncated = false
  while (queue.length) {
    const { path, depth } = queue.shift()
    if (++dirs > MAX_DIRS) { truncated = true; break }
    let marker = false
    try { const stat = statSync(join(path, '.git')); marker = stat.isDirectory() || stat.isFile() } catch { /* ordinary directory */ }
    if (marker && await isGitRepo(path)) {
      const root = realpathSync(path), key = process.platform === 'win32' ? root.toLowerCase() : root
      if (!seen.has(key)) { seen.add(key); repos.push(root) }
      if (repos.length >= MAX_RESULTS) { truncated = true; break }
    }
    // A repository at the workspace root must not hide nested repositories.
    if (depth >= MAX_DEPTH) continue
    let entries
    try { entries = readdirSync(path, { withFileTypes: true }) } catch { continue }
    entries.sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.') || ['node_modules', '$RECYCLE.BIN', 'System Volume Information'].includes(entry.name)) continue
      if (dirs + queue.length >= MAX_DIRS) { truncated = true; break }
      queue.push({ path: join(path, entry.name), depth: depth + 1 })
    }
  }
  return { repos, truncated }
}

/** Parse `git log --format=...%x1f...%d` lines into structured commit rows. */
function parseLog(stdout) {
  const rows = []
  for (const line of stdout.split('\n')) {
    if (!line) continue
    const [hash, parents, author, email, date, subject, refs] = line.split('\x1f')
    rows.push({
      hash,
      parents: parents ? parents.split(' ') : [],
      author,
      email,
      date,
      subject,
      refs: parseRefs(refs),
    })
  }
  return rows
}

/** Parse git refs decoration like " (HEAD -> master, tag: v1, origin/dev)". */
function parseRefs(raw) {
  const refs = []
  if (!raw) return refs
  const inner = raw.replace(/^\(/, '').replace(/\)$/, '').trim()
  if (!inner) return refs
  for (const part of inner.split(',')) {
    const item = part.trim()
    if (!item) continue
    if (item.startsWith('tag: ')) {
      refs.push({ kind: 'tag', name: item.slice(5).trim() })
    } else if (item.includes(' -> ')) {
      const [, target] = item.split(' -> ')
      refs.push({ kind: 'branch', name: target.trim(), head: item.startsWith('HEAD') })
    } else {
      refs.push({ kind: 'branch', name: item })
    }
  }
  return refs
}

/**
 * Parse `git status --porcelain=v1 -z` output. Returns [{x, y, path, oldPath?}].
 * In -z mode rename/copy entries emit two records: "XY <new path>" then "<old path>".
 */
function parsePorcelainZ(buf) {
  const records = []
  const parts = buf.split('\0')
  for (let i = 0; i < parts.length; i++) {
    const rec = parts[i]
    if (!rec || rec.length < 3) continue
    const x = rec[0]
    const y = rec[1]
    const path = rec.slice(3)
    if ((x === 'R' || x === 'C') && i + 1 < parts.length && parts[i + 1]) {
      records.push({ x, y, path, oldPath: parts[i + 1] })
      i++
      continue
    }
    records.push({ x, y, path })
  }
  return records
}

/**
 * Parse `git diff --numstat -z` output into a path -> {added, deleted} map.
 * Normal entries are "added\tdeleted\t<path>"; rename entries are
 * "added\tdeleted" + "\0" + "<old>" + "\0" + "<new>" (keyed by the new path);
 * binary entries use "-" for both counts.
 */
function parseNumstatZ(buf) {
  const map = new Map()
  const parts = buf.split('\0')
  for (let i = 0; i < parts.length; i++) {
    const rec = parts[i]
    if (!rec) continue
    const fields = rec.split('\t')
    if (fields.length < 2) continue
    const added = fields[0]
    const deleted = fields[1]
    let key
    if (fields.length >= 3 && fields[2]) {
      key = fields[2]
    } else {
      // rename: "n\tn" then "<old>" then "<new>"
      const old = i + 1 < parts.length ? parts[i + 1] : ''
      const next = i + 2 < parts.length ? parts[i + 2] : ''
      key = next || old
      i += 2
    }
    if (key) map.set(key, { added, deleted })
  }
  return map
}

function insideRepo(repo, file, physical = false) {
  try {
    let target = resolve(file)
    if (physical) {
      let suffix = []
      while (true) {
        try { target = join(realpathSync(target), ...suffix); break } catch (err) {
          if (err.code !== 'ENOENT') return false
          const parent = dirname(target)
          if (parent === target) return false
          suffix.unshift(relative(parent, target)); target = parent
        }
      }
    }
    const rel = relative(repo, target)
    return rel !== '..' && !rel.startsWith('../') && !rel.startsWith('..\\') && !isAbsolute(rel)
  } catch { return false }
}

// Shared application operation: HTTP and the approval-gated Agent tool use this executor.
async function executeGitOperation(repo, params, signal) {
  signal?.throwIfAborted()
  for (const key of ['hash', 'name', 'newname', 'branch', 'from', 'to']) {
    const value = params.get(key)
    if (value && (value.startsWith('-') || /[\x00-\x20\x7f]/.test(value) || value.length > 1024)) throw new Error('invalid-ref')
  }
  const git = (directory, args, buffer, timeout) => runGit(directory, args, buffer, timeout, signal)
  const action = params.get('action')
  const files = params.getAll('file').filter(Boolean)
  const okPath = (p) => {
    const full = resolve(repo, p).replace(/\\/g, '/')
    return insideRepo(repo, full, true) && !p.replace(/\\/g, '/').split('/').includes('.git')
  }
  if (files.some((p) => !okPath(p))) {
    throw new Error('path-outside-repo')
  }
  switch (action) {
    case 'stage':
      if (!files.length) throw new Error('missing-file')
      await git(repo, ['add', '--', ...files])
      break
    case 'stage-all':
      await git(repo, ['add', '-A'])
      break
    case 'unstage':
      if (!files.length) throw new Error('missing-file')
      await git(repo, ['restore', '--staged', '--', ...files])
      break
    case 'unstage-all':
      // mixed reset: unstage everything, keep working tree
      await git(repo, ['reset'])
      break
    case 'discard':
      // Restore file(s) to HEAD: staged + worktree changes are lost.
      if (!files.length) throw new Error('missing-file')
      await git(repo, ['restore', '--staged', '--worktree', '--', ...files])
      break
    case 'discard-all':
      // Restore every tracked file to HEAD (untracked files untouched).
      await git(repo, ['restore', '--staged', '--worktree', '.'])
      break
    case 'commit': {
      const message = params.get('message')
      if (!message || !message.trim()) throw new Error('missing-message')
      if (files.length) {
        // selective commit: stage exactly these files and limit the
        // commit to them (paths are staged so `-- files` works).
        await git(repo, ['add', '--', ...files])
        await git(repo, ['commit', '-m', message.trim(), '--', ...files])
      } else {
        if (params.get('all') === '1') {
          await git(repo, ['add', '-A'])
        }
        await git(repo, ['commit', '-m', message.trim()])
      }
      break
    }
    case 'ignore': {
      // Add files to .gitignore; tracked files are untracked first
      // (git rm --cached keeps them on disk).
      if (!files.length) throw new Error('missing-file')
      const gi = join(repo, '.gitignore')
      if (!insideRepo(repo, gi, true)) throw new Error('path-outside-repo')
      if (files.some((f) => /[\r\n]/.test(f))) throw new Error('invalid-file')
      const tracked = []
      for (const f of files) {
        const out = await git(repo, ['ls-files', '--error-unmatch', '--', f]).catch(() => '')
        if (out.trim()) tracked.push(f)
      }
      if (tracked.length) {
        await git(repo, ['rm', '--cached', '--', ...tracked])
      }
      let lines = ''
      try { lines = readFileSync(gi, 'utf8') } catch { /* no .gitignore yet */ }
      const has = (p) => lines.split(/\r?\n/).some((l) => l.trim() === p)
      const adds = []
      for (const f of files) {
        const norm = f.replace(/\\/g, '/')
        if (!has(norm)) adds.push(norm)
      }
      if (adds.length) {
        const prefix = lines.length && !lines.endsWith('\n') ? '\n' : ''
        appendFileSync(gi, prefix + adds.join('\n') + '\n')
      }
      break
    }
    case 'tag': {
      // Lightweight tag on a commit (harmless; no editor, no push).
      const name = params.get('name')
      const hash = params.get('hash')
      if (!name || !name.trim()) throw new Error('missing-tag-name')
      if (!hash) throw new Error('missing-hash')
      await git(repo, ['tag', name.trim(), hash])
      break
    }
    case 'tag-delete': {
      // Delete a local tag (does not touch remotes).
      const name = params.get('name')
      if (!name || !name.trim()) throw new Error('missing-tag-name')
      await git(repo, ['tag', '-d', name.trim()])
      break
    }
    case 'tag-rename': {
      // Rename a local tag: create the new name at the same commit,
      // then drop the old one (create-first keeps the tag if delete fails).
      const name = params.get('name')
      const newname = params.get('newname')
      const hash = params.get('hash')
      if (!name || !name.trim()) throw new Error('missing-tag-name')
      if (!newname || !newname.trim()) throw new Error('missing-new-tag-name')
      if (!hash) throw new Error('missing-hash')
      await git(repo, ['tag', newname.trim(), hash])
      await git(repo, ['tag', '-d', name.trim()])
      break
    }
    case 'branch': {
      // Create a new lightweight branch at the given commit.
      const name = params.get('name')
      const hash = params.get('hash')
      if (!name || !name.trim()) throw new Error('missing-branch-name')
      if (!hash) throw new Error('missing-hash')
      // Reject names that would escape refs/heads (no slashes-injection guard needed:
      // git itself validates ref names, but keep a sane limit).
      await git(repo, ['branch', name.trim(), hash])
      break
    }
    case 'fetch': {
      // Pull remote refs into refs/remotes (no merge). Works with the
      // configured origin, or any remote if none named.
      await git(repo, ['fetch', '--all', '--prune'], MAX_GIT_BUFFER, 120000)
      break
    }
    case 'pull': {
      // Pull + merge the current branch from origin (may conflict; the
      // client warns before calling). Returns the pull summary.
      const branch = params.get('branch')
      const out = await git(repo, ['pull', 'origin', ...(branch ? [branch] : [])], MAX_GIT_BUFFER, 120000)
      return { ok: true, summary: String(out).trim() }
    }
    case 'push': {
      // Push the current branch to origin. May require credentials;
      // non-fast-forward and auth errors come back as git stderr.
      const branch = params.get('branch')
      const out = await git(repo, ['push', 'origin', branch || 'HEAD'], MAX_GIT_BUFFER, 120000)
      return { ok: true, summary: String(out).trim() }
    }
    case 'checkout': {
      // Switch to a local branch (dirty worktree errors come from git).
      const name = params.get('name')
      if (!name || !name.trim()) throw new Error('missing-branch-name')
      await git(repo, ['checkout', name.trim()])
      break
    }
    case 'delete-branch': {
      // Delete a local branch (-d: refuses unmerged branches).
      const name = params.get('name')
      if (!name || !name.trim()) throw new Error('missing-branch-name')
      await git(repo, ['branch', '-d', name.trim()])
      break
    }
    default:
      throw Object.assign(new Error('unknown-action'), { statusCode: 400 })
  }
  return { ok: true }
}

export function apply(ctx, config = {}) {
  const configured = []
  if (config.repo) configured.push(String(config.repo))
  if (Array.isArray(config.repos)) configured.push(...config.repos.map(String))
  const normalize = (p) => { try { return isAbsolute(String(p)) ? realpathSync(String(p)) : '' } catch { return '' } }
  const allowed = [...new Set(configured.map(normalize))].filter(Boolean)
  // Workspace-discovered repos (from the repos op) are accepted for reads too.
  // `recentKeys` holds case-folded keys so Windows paths differing only in case
  // still match (e.g. "C:/Work" vs "c:/work").
  // Read authorization is process-wide; visible/manual choices are workspace-scoped.
  const recentRepos = new Set()
  const recentKeys = new Set()
  const manualByWorkspace = new Map()
  const normKey = (p) => {
    const s = String(p).replace(/\\/g, '/').replace(/\/+$/, '')
    return process.platform === 'win32' ? s.toLowerCase() : s
  }
  const repoAllowed = (p) => {
    const k = normKey(p)
    if (allowed.some((a) => normKey(a) === k)) return true
    return recentKeys.has(k)
  }
  const addRecent = (p) => {
    const canonical = normalize(p)
    if (!canonical) return ''
    recentRepos.add(canonical); recentKeys.add(normKey(canonical))
    return canonical
  }
  const workspaceFor = async (sid, requested, requestedWorkspaceId) => {
    try {
      const registry = ctx.get('workspaceRegistry')
      const workspace = sid && registry?.list().find(row => row.sessionIds.includes(sid))
      if (requestedWorkspaceId && (!workspace || workspace.id !== requestedWorkspaceId)) throw new Error('workspace-mismatch')
      let path = workspace?.path || ''
      if (!path && sid) {
        const agent = ctx.get('agents')?.get(sid)
        if (agent) path = await ctx.workingDirectory.ensure(agent)
        else {
          // Reading a saved Session never creates/resumes an Agent or rewrites cwd.
          const session = ctx.get('sessions')?.get(sid)
          if (session) path = ctx.workingDirectory.get(session)
        }
      }
      path ||= requested || ''
      if (!path) return ''
      const canonical = normalize(path)
      if (!canonical || !statSync(canonical).isDirectory()) throw new Error(`Workspace directory is unavailable: ${path}`)
      return canonical
    } catch (error) {
      if (error?.message === 'workspace-mismatch') throw error
      throw Object.assign(new Error('workspace-unavailable'), { detail: safeDiagnostic(error?.detail || error?.message) })
    }
  }
  const workspaceKey = (workspace, sid) => workspace ? 'workspace:' + normKey(workspace) : sid ? 'session:' + sid : 'unscoped'
  const manualFor = (workspace, sid) => {
    const key = workspaceKey(workspace, sid)
    if (!manualByWorkspace.has(key)) manualByWorkspace.set(key, new Set())
    return manualByWorkspace.get(key)
  }

  // Cordis unload drains effects; an ordinary 'dispose' event is never emitted.
  // Own both registries in one rollback-safe effect so failed activation cannot
  // strand a route whose captured context has already become inactive.
  return ctx.effect(() => {
    const disposers = []
    let cleaned = false
    const cleanup = () => {
      if (cleaned) return
      cleaned = true
      let failure
      for (const dispose of disposers.reverse()) {
        try { dispose() } catch (error) { failure ||= error }
      }
      if (failure) throw failure
    }
    try {
  const unregisterTool = ctx.tools.register({
    name: 'git_graph_operation',
    description: 'Change the current session repository: stage, commit, restore, manage refs, or synchronize remotes. Discard actions lose changes; push publishes commits. Requires approval for each operation. Returns a concise result.',
    parameters: {
      type: 'object', additionalProperties: false, required: ['action'],
      properties: {
        action: { type: 'string', enum: ['stage', 'stage-all', 'unstage', 'unstage-all', 'discard', 'discard-all', 'commit', 'ignore', 'tag', 'tag-delete', 'tag-rename', 'branch', 'fetch', 'pull', 'push', 'checkout', 'delete-branch'] },
        files: { type: 'array', items: { type: 'string' }, description: 'Repository-relative files for selective operations.' },
        message: { type: 'string', description: 'Commit message for commit.' },
        all: { type: 'boolean', description: 'Stage all changes before committing. Defaults to false.' },
        name: { type: 'string', description: 'Branch or tag name.' },
        newname: { type: 'string', description: 'New name for tag-rename.' },
        hash: { type: 'string', description: 'Commit revision for creating a branch or tag.' },
        branch: { type: 'string', description: 'Branch to pull or push; omitted uses the current branch.' },
      },
    },
    output: { schema: { type: 'object', additionalProperties: true }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
    timeoutMs: 150000,
    isConcurrencySafe: () => false,
    async execute(args, exec) {
      if (!exec.agent) throw new Error('agent-required')
      const cwd = normalize(await ctx.workingDirectory.ensure(exec.agent, exec.signal))
      const repo = cwd && findGitRoot(cwd)
      if (!repo || !(await isGitRepo(repo))) throw new Error('not-a-git-repo')
      // No repo argument: another Session's globally registered repository is never an authority.
      const params = new URLSearchParams()
      for (const key of ['action', 'message', 'name', 'newname', 'hash', 'branch']) {
        if (args[key] !== undefined) params.set(key, String(args[key]))
      }
      if (args.all) params.set('all', '1')
      for (const file of args.files || []) params.append('file', file)
      const outcome = await ctx.approval.request({ agent: exec.agent, toolName: 'git_graph_operation', callId: exec.callId,
        reason: `Run Git operation in ${repo}: ${params.toString()}`, signal: exec.signal })
      if (outcome !== 'allowed-once') throw new Error('approval-denied')
      exec.signal.throwIfAborted()
      try { return await executeGitOperation(repo, params, exec.signal) } catch (err) { return apiError(err) }
    },
  })
  disposers.push(unregisterTool)

  const dispose = ctx.webServer.register({
    kind: 'prefix',
    path: API_PREFIX,
    handler: async (req, res) => {
      const sendJson = (obj, status = 200) => {
        const body = JSON.stringify(obj)
        res.writeHead(status, {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        })
        res.end(body)
      }
      try {
        const url = new URL(req.url, 'http://localhost')
        const pathname = url.pathname

        if (pathname !== `${API_PREFIX}/api`) {
          sendJson({ ok: false, error: 'not-found' }, 404)
          return
        }

        const rejection = ctx.connection.requestRejection(req)
        if (rejection) { sendJson({ ok: false, error: 'request-rejected' }, rejection); return }
        const op = url.searchParams.get('op') || 'graph'
        if (['autoupdate', 'selfupdate', 'checkupdate'].includes(op)) {
          sendJson({ ok: false, error: 'updates-disabled', disabled: true }, 403); return
        }
        const mutation = ['gitop', 'addrepo', 'reveal'].includes(op)
        if (req.method !== (mutation ? 'POST' : 'GET')) {
          sendJson({ ok: false, error: 'method-not-allowed' }, 405); return
        }
        if (mutation) {
          let origin
          try { origin = new URL(req.headers.origin).origin } catch { /* missing origin */ }
          const protocol = new URL(ctx.webServer.getOrigin()).protocol
          if (!origin || origin !== `${protocol}//${req.headers.host}` ||
              (req.headers['sec-fetch-site'] && req.headers['sec-fetch-site'] !== 'same-origin')) {
            sendJson({ ok: false, error: 'same-origin-required' }, 403); return
          }
          req.resume?.() // Native client sends an empty JSON object; parameters stay in the URL.
        }
        const sid = url.searchParams.get('sid')
        const workspaceId = url.searchParams.get('workspaceId')
        const expectedScope = url.searchParams.get('scope')
        const sessionWs = ['repos', 'findrepos', 'addrepo'].includes(op) || sid || workspaceId || expectedScope || url.searchParams.has('ws')
          ? await workspaceFor(sid, url.searchParams.get('ws'), workspaceId) : ''
        if (!['repos', 'findrepos'].includes(op) && expectedScope) {
          const expectedCanonical = normalize(expectedScope)
          if (!expectedCanonical || !sessionWs || normKey(expectedCanonical) !== normKey(sessionWs)) throw new Error('workspace-mismatch')
        }
        if (op === 'repos' || op === 'findrepos') {
          const ws = sessionWs
          if (!ws) {
            sendJson(op === 'findrepos' ? { ok: false, error: 'bad-ws' } : { ok: true, repos: [], current: null, ws: '', wsRoot: null, wsIsGit: false }, op === 'findrepos' ? 400 : 200)
            return
          }
          const discovered = await discoverWorkspaceRepos(ws)
          const repos = [...discovered.repos]
          // Configured paths may authorize reads, but cannot select another project.
          for (const repo of allowed) {
            if (insideRepo(ws, repo, true) && await isGitRepo(repo) && !repos.some(row => normKey(row) === normKey(repo))) repos.push(repo)
          }
          const manual = manualFor(ws, sid)
          for (const repo of manual) {
            if (!(await isGitRepo(repo))) { manual.delete(repo); continue }
            if (!repos.some(row => normKey(row) === normKey(repo))) repos.push(repo)
          }
          for (const repo of repos) addRecent(repo)
          const wsRoot = repos.find(repo => normKey(repo) === normKey(ws)) || null
          sendJson({ ok: true, repos, current: wsRoot || repos[0] || null, ws, wsRoot, wsIsGit: !!wsRoot, truncated: discovered.truncated })
          return
        }

        if (op === 'listdir') {
          // Compatibility read API, confined to authorized roots. The native
          // Client uses Harness's directory picker instead of this browser.
          const hasDotGit = (dir) => {
            try { return !!statSync(join(dir, '.git')) } catch { return false }
          }
          const listSubdirs = (dir) => {
            let entries = []
            try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return { dirs: [], truncated: false, readable: false } }
            const names = entries
              .filter((e) => e.isDirectory() && e.name !== '.git')
              .map((e) => e.name)
              .sort((a, b) => a.localeCompare(b))
            const limit = 500
            const dirs = names.slice(0, limit).map((name) => {
              const full = join(dir, name)
              return { name, path: full.replace(/\\/g, '/'), git: hasDotGit(full) }
            })
            return { dirs, truncated: names.length > limit, readable: true }
          }
          const browseRoots = sessionWs ? [sessionWs, ...manualFor(sessionWs, sid)] : [...allowed, ...recentRepos]
          let p = String(url.searchParams.get('path') || browseRoots[0] || '').trim().replace(/\\/g, '/')
          if (!p || !browseRoots.some((root) => insideRepo(root, resolve(p), true))) {
            sendJson({ ok: false, error: 'path-not-allowed' }, 403); return
          }
          if (/^[A-Za-z]:$/.test(p)) p += '/' // bare drive letter ("C:") -> "C:/"
          let abs
          try { abs = resolve(p) } catch { sendJson({ ok: false, error: 'bad-path', path: p }, 400); return }
          let st
          try { st = statSync(abs) } catch { sendJson({ ok: false, error: 'not-found', path: p }, 404); return }
          if (!st.isDirectory()) { sendJson({ ok: false, error: 'not-a-directory', path: p }, 400); return }
          const norm = abs.replace(/\\/g, '/')
          const par = dirname(norm)
          const { dirs, truncated, readable } = listSubdirs(abs)
          let root = null
          try { root = findGitRoot(abs) } catch { /* ignore */ }
          sendJson({ ok: true, path: norm, parent: par === norm ? null : par, dirs, root, truncated, readable })
          return
        }

        if (op === 'addrepo') {
          // Register a folder (or any folder inside one) as an openable repo:
          // Explicit folder selection may resolve its enclosing git work tree,
          // then verifies it really is a working tree (a bare .git dir alone
          // is not enough — it could be empty/corrupted).
          const p = String(url.searchParams.get('path') || '').trim()
          if (!p) { sendJson({ ok: false, error: 'missing-path' }, 400); return }
          let abs
          try { abs = resolve(p) } catch { sendJson({ ok: false, error: 'bad-path', path: p }, 400); return }
          let st
          try { st = statSync(abs) } catch { sendJson({ ok: false, error: 'not-found', path: p }, 404); return }
          if (!st.isDirectory()) { sendJson({ ok: false, error: 'not-a-directory', path: p }, 400); return }
          const root = normalize(findGitRoot(abs) || '')
          if (!root || !(await isGitRepo(root))) { sendJson({ ok: false, error: 'not-a-git-repo', path: p }, 400); return }
          addRecent(root)
          manualFor(sessionWs, sid).add(root)
          sendJson({ ok: true, repo: root, ws: sessionWs })
          return
        }

        let repo = url.searchParams.get('repo') || allowed[0]
        const repoNorm = normalize(repo || '')
        if (!repoNorm || !repoAllowed(repoNorm)) {
          sendJson({ ok: false, error: 'repo-not-allowed' }, 403)
          return
        }
        repo = repoNorm
        if (sessionWs && !insideRepo(sessionWs, repo, true) && !manualFor(sessionWs, sid).has(repo)) {
          sendJson({ ok: false, error: 'repo-not-in-workspace' }, 403)
          return
        }

        for (const key of ['hash', 'name', 'newname', 'branch', 'from', 'to']) {
          const value = url.searchParams.get(key)
          if (value && (value.startsWith('-') || /[\x00-\x20\x7f]/.test(value) || value.length > 1024)) {
            sendJson({ ok: false, error: 'invalid-ref' }, 400); return
          }
        }
        // Sanity: reject paths that are not existing git work trees.
        if (!(await isGitRepo(repo))) {
          sendJson({ ok: false, error: 'not-a-git-repo', repo }, 400)
          return
        }

        switch (op) {
          case 'graph': {
            const headOut = await runGit(repo, ['symbolic-ref', '-q', '--short', 'HEAD']).catch(() => '')
            const headName = headOut.trim() || 'HEAD'
            // Pagination: limit/skip for large repos; total from rev-list.
            const limit = Math.max(0, Math.min(parseInt(url.searchParams.get('limit') || '200', 10) || 0, 2000))
            const skip = Math.max(0, parseInt(url.searchParams.get('skip') || '0', 10) || 0)
            const total = parseInt((await runGit(repo, ['rev-list', '--all', '--count']).catch(() => '0')).trim(), 10) || 0
            const args = ['log', '--all', '--topo-order', '--date=iso-strict',
              '--format=%H%x1f%P%x1f%an%x1f%ae%x1f%ad%x1f%s%x1f%d']
            if (skip > 0) args.push('--skip=' + skip)
            if (limit > 0) args.push('-n', String(limit))
            const log = await runGit(repo, args)
            sendJson({
              ok: true,
              repo,
              head: headName,
              total,
              commits: parseLog(log),
            })
            break
          }
          case 'branches': {
            // for-each-ref supports %09 (tab) but not %x1f (that is a log/pretty-format feature).
            const out = await runGit(repo, [
              'for-each-ref',
              '--format=%(refname)%09%(objectname)%09%(HEAD)',
              'refs/heads', 'refs/remotes', 'refs/tags',
            ])
            const branches = []
            for (const line of out.split('\n')) {
              if (!line) continue
              const [refname, sha, isHead] = line.split('\t')
              branches.push({
                refname,
                kind: refname.startsWith('refs/tags/') ? 'tag' : refname.startsWith('refs/remotes/') ? 'remote' : 'local',
                name: refname.replace(/^refs\/(heads|remotes|tags)\//, ''),
                sha,
                head: isHead === '*',
              })
            }
            sendJson({ ok: true, branches })
            break
          }
          case 'workstatus': {
            // VSCode-style working-tree overview: structured file lists grouped by
            // staged / unstaged / untracked, with per-file +/- counts (numstat).
            const branch = (await runGit(repo, ['rev-parse', '--abbrev-ref', 'HEAD']).catch(() => '')).trim() || 'HEAD'
            const statusOut = await runGit(repo, ['status', '--porcelain=v1', '-z'])
            const stagedNum = await runGit(repo, ['diff', '--cached', '--numstat', '-z'])
            const unstagedNum = await runGit(repo, ['diff', '--numstat', '-z'])
            const stagedCounts = parseNumstatZ(stagedNum)
            const unstagedCounts = parseNumstatZ(unstagedNum)
            const staged = []
            const unstaged = []
            const untracked = []
            for (const r of parsePorcelainZ(statusOut)) {
              const num = (m) => {
                const n = m.get(r.path)
                return n ? { added: n.added === '-' ? null : parseInt(n.added, 10) || 0, deleted: n.deleted === '-' ? null : parseInt(n.deleted, 10) || 0, binary: n.added === '-' } : { added: 0, deleted: 0, binary: false }
              }
              const conflict = (r.x === 'U' || r.x === 'A' || r.x === 'D') && (r.y === 'U' || r.y === 'A' || r.y === 'D')
              if (r.x === '?' && r.y === '?') {
                untracked.push({ path: r.path })
                continue
              }
              if (conflict) {
                unstaged.push({ path: r.path, oldPath: r.oldPath || '', code: 'U', ...num(unstagedCounts) })
                continue
              }
              if (r.x !== ' ' && r.x !== '?') {
                staged.push({ path: r.path, oldPath: r.oldPath || '', code: r.x, ...num(stagedCounts) })
              }
              if (r.y !== ' ' && r.y !== '?') {
                unstaged.push({ path: r.path, oldPath: r.oldPath || '', code: r.y, ...num(unstagedCounts) })
              }
            }
            sendJson({
              ok: true,
              repo,
              branch,
              staged,
              unstaged,
              untracked,
              counts: { staged: staged.length, unstaged: unstaged.length, untracked: untracked.length },
            })
            break
          }
          case 'workfile': {
            // Per-file diff (or content for untracked files) of the working tree.
            const file = url.searchParams.get('file')
            const staged = url.searchParams.get('staged') || '0' // '0' | '1' | 'untracked'
            if (!file) {
              sendJson({ ok: false, error: 'missing-file' }, 400)
              return
            }
            const full = resolve(repo, file).replace(/\\/g, '/')
            const base = repo.replace(/\\/g, '/')
            if (full !== base && !full.startsWith(base + '/')) {
              sendJson({ ok: false, error: 'path-outside-repo' }, 400)
              return
            }
            if (staged === 'untracked') {
              if (!insideRepo(repo, full, true)) { sendJson({ ok: false, error: 'path-outside-repo' }, 400); return }
              let st
              try { st = statSync(full) } catch {
                sendJson({ ok: false, error: 'file-not-found', file }, 404)
                return
              }
              if (!st.isFile()) {
                sendJson({ ok: true, isDir: true, content: '' })
                return
              }
              let content = ''
              try { const fd = openSync(full, 'r'); try { const buf = Buffer.alloc(MAX_DIFF_CHARS * 4 + 4); const n = readSync(fd, buf, 0, buf.length, 0); content = buf.subarray(0, n).toString('utf8') } finally { closeSync(fd) } } catch (err) {
                sendJson(apiError(err), ['workspace-unavailable', 'workspace-mismatch'].includes(err?.message) ? 409 : 500)
                return
              }
              if (content.includes('\0')) {
                sendJson({ ok: true, binary: true, content: '' })
                return
              }
              const truncated = content.length > MAX_DIFF_CHARS
              sendJson({ ok: true, content: truncated ? content.slice(0, MAX_DIFF_CHARS) : content, truncated })
              return
            }
            const paths = [file]
            const old = url.searchParams.get('old')
            if (old) paths.push(old)
            const args = (staged === '1'
              ? ['diff', '--cached', '--no-color', '--', ...paths]
              : ['diff', '--no-color', '--', ...paths])
            const out = await runGit(repo, args).catch(() => '')
            const truncated = out.length > MAX_DIFF_CHARS
            sendJson({ ok: true, diff: truncated ? out.slice(0, MAX_DIFF_CHARS) : out, truncated })
            break
          }
          case 'filelog': {
            // Commit history of one file (--follow tracks renames).
            const file = url.searchParams.get('file')
            if (!file) {
              sendJson({ ok: false, error: 'missing-file' }, 400)
              return
            }
            const full = resolve(repo, file).replace(/\\/g, '/')
            const base = repo.replace(/\\/g, '/')
            if (full !== base && !full.startsWith(base + '/')) {
              sendJson({ ok: false, error: 'path-outside-repo' }, 400)
              return
            }
            const log = await runGit(repo, [
              'log', '--follow', '--topo-order', '--date=iso-strict',
              '--format=%H%x1f%P%x1f%an%x1f%ae%x1f%ad%x1f%s%x1f%d', '--', file,
            ]).catch(() => '')
            sendJson({ ok: true, file, commits: parseLog(log) })
            break
          }
          case 'reveal': {
            // Open the repo folder in the OS file manager (harmless convenience).
            const opener = process.platform === 'win32' ? 'explorer'
              : process.platform === 'darwin' ? 'open'
              : 'xdg-open'
            await runGit(repo, ['rev-parse', '--show-toplevel']).then((root) => {
              return new Promise((resolvePromise) => {
                // GUI file managers may exit non-zero even on success; ignore the code.
                execFile(opener, [root.trim()], { windowsHide: true }, () => resolvePromise())
              })
            })
            sendJson({ ok: true })
            break
          }
          case 'remoteinfo': {
            // Resolve the origin remote to a web base URL (e.g. https://github.com/u/r)
            // so the client can build "/commit/<hash>" links. Returns {web, remote} or
            // {web: null} when no usable remote exists.
            const urlOut = await runGit(repo, ['remote', 'get-url', 'origin']).catch(() => '')
            const raw = urlOut.trim()
            if (!raw) {
              sendJson({ ok: true, web: null, remote: '' })
              break
            }
            let remote = raw, web = raw
            try {
              if (/^https?:\/\//i.test(raw)) {
                // Origin URLs may contain embedded credentials or signed query strings.
                // Neither API field may disclose them to the browser or generated links.
                const url = new URL(raw)
                url.username = ''; url.password = ''; url.search = ''; url.hash = ''
                remote = web = url.href
              } else if (/^git@(.+):(.+)$/.test(raw)) {
                // scp-like: git@host:path.git -> https://host/path
                web = raw.replace(/^git@([^:]+):(.*)$/, 'https://$1/$2')
              } else if (/^ssh:\/\//i.test(raw)) {
                const url = new URL(raw)
                url.password = ''; url.search = ''; url.hash = ''
                remote = url.href
                web = `https://${url.host}${url.pathname}`
              }
              // Sanitize converted SSH URLs too, before removing the Git suffix.
              if (/^https?:\/\//i.test(web)) {
                const url = new URL(web)
                url.username = ''; url.password = ''; url.search = ''; url.hash = ''
                web = url.href
              }
              web = web.replace(/\.git\/?$/, '').replace(/\/+$/, '')
            } catch {
              // Malformed network URLs must not leak their original userinfo.
              remote = ''; web = null
            }
            sendJson({ ok: true, web, remote })
            break
          }
          case 'suggestmsg': {
            // Heuristic commit-message suggestion from the working-tree diff.
            // No external AI call: builds conventional-commit style candidates
            // from file names + add/del counts.
            const stagedNum = await runGit(repo, ['diff', '--cached', '--numstat', '-z']).catch(() => '')
            const unstagedNum = await runGit(repo, ['diff', '--numstat', '-z']).catch(() => '')
            const statusOut = await runGit(repo, ['status', '--porcelain=v1', '-z']).catch(() => '')
            const stagedCounts = parseNumstatZ(stagedNum)
            const unstagedCounts = parseNumstatZ(unstagedNum)
            const untracked = []
            const staged = []
            const unstaged = []
            for (const r of parsePorcelainZ(statusOut)) {
              if (r.x === '?' && r.y === '?') { untracked.push(r.path); continue }
              if (r.x !== ' ' && r.x !== '?') staged.push(r.path)
              if (r.y !== ' ' && r.y !== '?') unstaged.push(r.path)
            }
            const name = (p) => p.split('/').pop()
            const files = [...staged, ...unstaged, ...untracked]
            let ins = 0; let del = 0
            for (const m of [stagedCounts, unstagedCounts]) {
              for (const v of m.values()) {
                ins += v.added === '-' ? 0 : parseInt(v.added, 10) || 0
                del += v.deleted === '-' ? 0 : parseInt(v.deleted, 10) || 0
              }
            }
            const candidates = []
            const uniq = [...new Set(files)]
            if (untracked.length && !staged.length && !unstaged.length) {
              candidates.push(`feat: add ${untracked.map(name).slice(0, 3).join(', ')}${untracked.length > 3 ? ' and others' : ''} (${untracked.length} files)`)
            } else if (del >= ins && del > 0) {
              candidates.push(`fix: remove/simplify ${uniq.map(name).slice(0, 3).join(', ')}${uniq.length > 3 ? ' and others' : ''}`)
            } else if (uniq.length) {
              candidates.push(`feat: update ${uniq.map(name).slice(0, 3).join(', ')}${uniq.length > 3 ? ' and others' : ''}`)
            }
            if (uniq.length) {
              const names = uniq.map(name).slice(0, 5).join(', ')
              candidates.push(`chore: adjust ${names}${uniq.length > 5 ? ` and ${uniq.length} files` : ''} (+${ins} -${del})`)
            }
            if (!uniq.length) candidates.push('chore: cleanup')
            sendJson({
              ok: true,
              summary: { staged: staged.length, unstaged: unstaged.length, untracked: untracked.length, insertions: ins, deletions: del },
              files: uniq,
              candidates: candidates.slice(0, 3),
            })
            break
          }
          case 'gitop': {
            sendJson(await executeGitOperation(repo, url.searchParams))
            break
          }
          case 'show': {
            const hash = url.searchParams.get('hash')
            if (!hash) {
              sendJson({ ok: false, error: 'missing-hash' }, 400)
              return
            }
            const meta = await runGit(repo, ['log', '-1', `--format=%H%x1f%P%x1f%an%x1f%ae%x1f%ad%x1f%s%x1f%b`, hash]).catch(() => '')
            const parts = meta.split('\x1f')
            const sha = parts[0] || hash
            const parents = (parts[1] || '').trim()
            const author = parts[2] || ''
            const email = parts[3] || ''
            const date = parts[4] || ''
            const subject = parts[5] || ''
            const body = parts.slice(6).join('\x1f').trim()
            // stat: diff against the first parent; root commits use the empty tree.
            let stat = ''
            const firstParent = parents ? parents.split(' ')[0] : ''
            if (firstParent) {
              stat = await runGit(repo, ['diff', '--stat', firstParent, sha]).catch(() => '')
            } else {
              stat = await runGit(repo, ['show', '--stat', '--format=', sha]).catch(() => '')
            }
            const names = await runGit(repo, ['diff-tree', '--root', '--no-commit-id', '--name-status', '-r', '-z', sha])
            const entries = names.split('\0').filter(Boolean)
            const files = []
            for (let i = 0; i + 1 < entries.length; i += 2) {
              const status = entries[i]
              if (/^[RC]/.test(status) && i + 2 < entries.length) { files.push({ status, oldPath: entries[i + 1], path: entries[i + 2] }); i++ }
              else files.push({ status, path: entries[i + 1] })
            }
            sendJson({ ok: true, files, hash: sha, parents: parents ? parents.split(' ') : [], author, email, date, subject, body, stat: stat.trim() })
            break
          }
          case 'diff': {
            const hash = url.searchParams.get('hash')
            const from = url.searchParams.get('from')
            const to = url.searchParams.get('to')
            if (!hash && !(from && to)) { sendJson({ ok: false, error: 'missing-revisions' }, 400); return }
            const out = await runGit(repo, from && to
              ? ['diff', '--no-color', from, to, '--']
              : ['show', '--no-color', '--format=', hash, '--'])
            const truncated = out.length > MAX_DIFF_CHARS
            sendJson({ ok: true, diff: truncated ? out.slice(0, MAX_DIFF_CHARS) : out, truncated })
            break
          }
          case 'filediff': {
            const hash = url.searchParams.get('hash')
            const file = url.searchParams.get('file')
            if (!hash || !file) {
              sendJson({ ok: false, error: 'missing-hash-or-file' }, 400)
              return
            }
            // Diff of a single file inside one commit (against its first parent).
            let out = ''
            const parents = (await runGit(repo, ['log', '-1', '--format=%P', hash]).catch(() => '')).trim()
            if (parents) {
              out = await runGit(repo, ['diff', '--no-color', parents.split(' ')[0], hash, '--', file]).catch(() => '')
            } else {
              out = await runGit(repo, ['show', '--no-color', '--format=', hash, '--', file]).catch(() => '')
            }
            const truncated = out.length > MAX_DIFF_CHARS
            sendJson({ ok: true, file, diff: truncated ? out.slice(0, MAX_DIFF_CHARS) : out, truncated })
            break
          }
          default:
            sendJson({ ok: false, error: 'unknown-op' }, 400)
        }
      } catch (err) {
        try {
          sendJson(apiError(err), err?.statusCode === 400 ? 400 : ['workspace-unavailable', 'workspace-mismatch'].includes(err?.message) ? 409 : 500)
        } catch {
          /* response already committed */
        }
      }
    },
  })
  disposers.push(dispose)
  return cleanup
    } catch (error) {
      try { cleanup() } catch { /* Preserve the original activation failure. */ }
      throw error
    }
  }, 'git-graph: route and tool')
}
