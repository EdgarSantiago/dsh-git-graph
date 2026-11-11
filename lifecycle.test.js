import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, realpathSync, rmSync, symlinkSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import * as plugin from './index.js'

// Exercise REAL Cordis fibers and traced Services, not a fake Context object.
import { Context, Service } from '@deepseek-ai/cordis'
const workspace = realpathSync(fileURLToPath(new URL('../', import.meta.url)))
const fixture = mkdtempSync(join(workspace, '.git-graph-lifecycle-'))
const plain = join(fixture, 'workspace'), repo = join(plain, 'repository')
mkdirSync(repo, { recursive: true })
const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' })
git('init'); git('config', 'user.email', 'fixture@example.test'); git('config', 'user.name', 'Lifecycle fixture')
writeFileSync(join(repo, 'inside.txt'), 'fixture\n'); git('add', '.'); git('commit', '-m', 'Lifecycle fixture')
test.after(() => {
  const checked = realpathSync(fixture)
  assert.equal(checked.startsWith(workspace + '/.git-graph-lifecycle-'), true)
  rmSync(checked, { recursive: true, force: true })
})

async function runtime() {
  const root = new Context(), routes = new Map(), tools = new Set()
  const state = { cwd: repo, live: true, saved: true, workspaces: [], ensureCalls: 0, getCalls: 0, ensureError: null, routeError: null, connectionError: null }
  class Web extends Service {
    constructor(ctx) { super(ctx, 'webServer') }
    register(route) {
      if (state.routeError) throw state.routeError
      const key = route.kind + ':' + route.path
      if (routes.has(key)) throw Error(`webserver: duplicate prefix route "${route.path}"`)
      routes.set(key, route)
      return () => { if (routes.get(key) === route) routes.delete(key) }
    }
    getOrigin() { return 'http://127.0.0.1:1234' }
  }
  class Connection extends Service {
    constructor(ctx) { super(ctx, 'connection') }
    requestRejection(req) { if (state.connectionError) throw state.connectionError; return req.headers.cookie === 'owner' ? undefined : 401 }
  }
  class Tools extends Service {
    constructor(ctx) { super(ctx, 'tools') }
    register(tool) { tools.add(tool); return () => tools.delete(tool) }
  }
  class Approval extends Service {
    constructor(ctx) { super(ctx, 'approval') }
    request() { throw Error('Unexpected mutation approval in read-only lifecycle test') }
  }
  class Agents extends Service {
    constructor(ctx) { super(ctx, 'agents') }
    get(sid) { return state.live && sid === 'fixture-session' ? { id: sid } : undefined }
  }
  class Sessions extends Service {
    constructor(ctx) { super(ctx, 'sessions') }
    get(sid) { return state.saved && sid === 'fixture-session' ? { id: sid, cwd: state.cwd } : undefined }
  }
  class WorkingDirectory extends Service {
    constructor(ctx) { super(ctx, 'workingDirectory') }
    async ensure(agent) { assert.equal(agent.id, 'fixture-session'); state.ensureCalls++; if (state.ensureError) throw state.ensureError; return state.cwd }
    get(session) { state.getCalls++; return session.cwd }
  }
  class Workspaces extends Service {
    constructor(ctx) { super(ctx, 'workspaceRegistry') }
    list() { return state.workspaces }
    get(id) { return state.workspaces.find(row => row.id === id) }
  }
  await root.plugin({ apply(ctx) { new Web(ctx); new Connection(ctx); new Tools(ctx); new Approval(ctx); new Agents(ctx); new Sessions(ctx); new WorkingDirectory(ctx); new Workspaces(ctx) } })
  const route = () => routes.get('prefix:' + plugin.API_PREFIX)
  async function request(op, params = {}, method = 'GET') {
    let status, body
    await route().handler({ url: plugin.API_PREFIX + '/api?' + new URLSearchParams({ op, ...params }), method,
      headers: { cookie: 'owner', host: '127.0.0.1:1234', origin: 'http://127.0.0.1:1234' }, resume() {} },
      { writeHead(code) { status = code }, end(value) { body = JSON.parse(value) } })
    return { status, ...body }
  }
  return { root, routes, tools, state, request, route }
}

test('legacy dispose-event ownership reproduces the orphan route and inactive-context failure', async () => {
  const { root, routes } = await runtime()
  let remove
  const legacy = { inject: ['webServer', 'connection'], apply(ctx) {
    remove = ctx.webServer.register({ kind: 'prefix', path: '/legacy-reproduction', handler() { return ctx.connection.requestRejection({ headers: {} }) } })
    ctx.on('dispose', remove)
  } }
  const fiber = await root.plugin(legacy)
  const route = routes.get('prefix:/legacy-reproduction')
  await fiber.dispose()
  assert.equal(routes.size, 1, 'Cordis does not emit an ordinary dispose event')
  assert.throws(() => route.handler(), /cannot get required service "connection" in inactive context/)
  await assert.rejects(async () => await root.plugin({ ...legacy, apply: ctx => legacy.apply(ctx) }), /duplicate prefix route/)
  remove() // The fixture owns this exact registration, unlike an unknown live Host orphan.
})

test('real traced plugin applies, serves reads, disposes both registries and reapplies without collisions', async () => {
  const { root, routes, tools, request } = await runtime()
  for (let i = 0; i < 3; i++) {
    const fiber = await root.plugin(plugin)
    assert.equal(routes.size, 1); assert.equal(tools.size, 1)
    const repos = await request('repos', { sid: 'fixture-session' })
    assert.equal(repos.ok, true); assert.equal(repos.current, repo)
    const graph = await request('graph', { repo })
    assert.equal(graph.commits[0].subject, 'Lifecycle fixture')
    await fiber.dispose()
    assert.equal(routes.size, 0); assert.equal(tools.size, 0)
  }
})

test('directory browsing without a path requires an authorized root and keeps its default root', async () => {
  for (const configured of [false, true]) {
    const { root, request } = await runtime()
    const fiber = await root.plugin(plugin, configured ? { repo } : {})
    try {
      const result = await request('listdir')
      assert.equal(result.ok, configured)
      if (configured) assert.equal(result.path, repo.replace(/\\/g, '/'))
      else { assert.equal(result.status, 403); assert.equal(result.error, 'path-not-allowed') }
    } finally { await fiber.dispose() }
  }
})

test('an unborn repository still exposes untracked changes without inventing a Git failure', async () => {
  const unborn = join(fixture, 'unborn')
  mkdirSync(unborn)
  execFileSync('git', ['-C', unborn, 'init', '--initial-branch=main'])
  writeFileSync(join(unborn, 'new.txt'), 'untracked\n')
  const { root, request } = await runtime()
  const fiber = await root.plugin(plugin, { repo: unborn })
  try {
    const result = await request('workstatus', { repo: unborn })
    assert.equal(result.ok, true)
    assert.deepEqual(result.counts, { staged: 0, unstaged: 0, untracked: 1 })
    assert.equal(result.untracked[0].path, 'new.txt')
  } finally { await fiber.dispose() }
})

test('failed activation rolls back the already registered tool before a clean retry', async () => {
  const { root, routes, tools, state } = await runtime()
  state.routeError = Error('Deliberate route registration failure')
  const failed = root.plugin(plugin)
  await assert.rejects(async () => await failed, /Deliberate route registration failure/)
  assert.equal(tools.size, 0); assert.equal(routes.size, 0)
  await failed.dispose()
  state.routeError = null
  const recovered = await root.plugin(plugin)
  assert.equal(tools.size, 1); assert.equal(routes.size, 1)
  await recovered.dispose(); assert.equal(tools.size, 0); assert.equal(routes.size, 0)
})

test('ctx.get is a supported optional lookup in a traced fiber; saved Sessions use read-only cwd', async () => {
  const { root, state, request } = await runtime()
  const probe = await root.plugin({ apply(ctx) {
    assert.throws(() => ctx.agents, /without inject/)
    assert.equal(ctx.get('agents').get('fixture-session').id, 'fixture-session')
  } })
  await probe.dispose()
  state.live = false
  const fiber = await root.plugin(plugin)
  const result = await request('repos', { sid: 'fixture-session' })
  assert.equal(result.current, repo); assert.equal(state.ensureCalls, 0); assert.equal(state.getCalls, 1)
  await fiber.dispose()
})

test('workspace failure is explicit and diagnostics are bounded and credential-redacted', async () => {
  const { root, state, request } = await runtime()
  const fiber = await root.plugin(plugin)
  state.ensureError = Error('Missing workspace https://alice:password@host.test/root token=abc123 password=p456 Bearer bearer-secret')
  const failure = await request('repos', { sid: 'fixture-session' })
  assert.equal(failure.status, 409); assert.equal(failure.error, 'workspace-unavailable')
  for (const secret of ['alice', 'password@', 'abc123', 'p456', 'bearer-secret']) assert.ok(!failure.detail.includes(secret), secret)
  state.ensureError = null; state.live = false; state.cwd = join(fixture, 'missing')
  assert.equal((await request('findrepos', { sid: 'fixture-session' })).error, 'workspace-unavailable')
  const previous = process.env.DSH_FIXTURE_SECRET
  process.env.DSH_FIXTURE_SECRET = 'fixture-unlabelled-secret'
  try {
    state.connectionError = Error('Unexpected failure fixture-unlabelled-secret ' + 'x'.repeat(5000))
    const result = await request('repos')
    assert.equal(result.error, 'operation-failed'); assert.ok(result.detail.length <= 4000)
    assert.ok(!result.detail.includes('fixture-unlabelled-secret'))
    assert.match(result.detail, /Unexpected failure/)
    state.connectionError = Error('fixture-unlabelled-secret')
    const codeFailure = await request('repos')
    assert.equal(codeFailure.error, 'operation-failed')
    assert.ok(!JSON.stringify(codeFailure).includes('fixture-unlabelled-secret'))
  } finally { if (previous === undefined) delete process.env.DSH_FIXTURE_SECRET; else process.env.DSH_FIXTURE_SECRET = previous }
  await fiber.dispose()
})

test('read-only discovery authorizes its returned roots and explicit addrepo remains same-origin POST', async () => {
  const { root, state, request } = await runtime()
  state.cwd = plain
  const fiber = await root.plugin(plugin)
  const found = await request('findrepos', { sid: 'fixture-session' })
  assert.equal(found.ok, true); assert.deepEqual(found.repos, [repo])
  assert.equal((await request('graph', { repo })).ok, true)
  assert.equal((await request('addrepo', { path: repo })).status, 405)
  assert.equal((await request('addrepo', { path: repo }, 'POST')).repo, repo)
  const alias = join(fixture, 'repository-alias')
  symlinkSync(repo, alias, 'dir')
  assert.equal((await request('addrepo', { path: alias }, 'POST')).repo, repo)
  assert.equal((await request('graph', { repo: alias })).ok, true)
  await fiber.dispose()
})


function makeRepository(path, subject = 'Workspace fixture') {
  mkdirSync(path, { recursive: true })
  const hooks = join(fixture, 'empty-hooks')
  mkdirSync(hooks, { recursive: true })
  const command = (...args) => execFileSync('git', ['-c', 'core.hooksPath=' + hooks, '-c', 'commit.gpgsign=false', '-C', path, ...args], { encoding: 'utf8' })
  command('init'); command('config', 'user.email', 'fixture@example.test'); command('config', 'user.name', 'Workspace fixture')
  writeFileSync(join(path, 'fixture.txt'), subject + '\n'); command('add', '.'); command('commit', '-m', subject)
  return command
}

test('workspace membership wins over stale Agent cwd, caller path and global remembered/configured repositories', async () => {
  const { root, state, request } = await runtime()
  const container = join(fixture, 'multi-project'), first = join(container, 'backend'), second = join(container, 'frontend')
  makeRepository(first, 'Backend project'); makeRepository(second, 'Frontend project')
  state.cwd = repo // Different, previously opened project.
  state.workspaces = [{ id: 'current-workspace', path: container, sessionIds: ['fixture-session'] }]
  const fiber = await root.plugin(plugin, { repo })
  await request('addrepo', { path: repo }, 'POST') // Legacy/global registration must not contaminate this workspace.
  const result = await request('repos', { sid: 'fixture-session', workspaceId: 'current-workspace', ws: repo })
  assert.equal(result.ws, container)
  assert.deepEqual(result.repos, [first, second]); assert.equal(result.current, first)
  assert.equal(state.ensureCalls, 0); assert.equal(state.getCalls, 0)
  for (const project of result.repos) assert.equal((await request('graph', { repo: project, sid: 'fixture-session', workspaceId: 'current-workspace' })).ok, true)
  assert.deepEqual((await request('findrepos', { sid: 'fixture-session', workspaceId: 'current-workspace' })).repos, [first, second])
  assert.equal((await request('graph', { repo, sid: 'fixture-session', workspaceId: 'current-workspace' })).error, 'repo-not-in-workspace')
  await fiber.dispose()
})

test('automatic discovery includes child repositories even when the workspace root has Git', async () => {
  const { root, state, request } = await runtime()
  const workspace = join(fixture, 'root-and-nested'), first = join(workspace, 'api'), second = join(workspace, 'ui')
  makeRepository(workspace); makeRepository(first); makeRepository(second)
  state.workspaces = [{ id: 'nested-workspace', path: workspace, sessionIds: ['fixture-session'] }]
  const fiber = await root.plugin(plugin)
  const result = await request('repos', { sid: 'fixture-session', workspaceId: 'nested-workspace' })
  assert.deepEqual(result.repos, [workspace, first, second]); assert.equal(result.current, workspace)
  await fiber.dispose()
})

test('discovery never substitutes an enclosing unrelated Git project for the opened workspace', async () => {
  const { root, state, request } = await runtime()
  const ancestor = join(fixture, 'ancestor-repo'), workspace = join(ancestor, 'workspace'), child = join(workspace, 'service')
  makeRepository(ancestor); makeRepository(child)
  state.workspaces = [{ id: 'contained-workspace', path: workspace, sessionIds: ['fixture-session'] }]
  const fiber = await root.plugin(plugin, { repo: ancestor })
  const result = await request('repos', { sid: 'fixture-session' })
  assert.deepEqual(result.repos, [child]); assert.equal(result.current, child)
  const empty = join(ancestor, 'empty-workspace'); mkdirSync(empty)
  state.workspaces = [{ id: 'empty-workspace', path: empty, sessionIds: ['fixture-session'] }]
  const none = await request('repos', { sid: 'fixture-session' })
  assert.deepEqual(none.repos, []); assert.equal(none.current, null)
  await fiber.dispose()
})

test('explicit external opens are remembered only in their current workspace', async () => {
  const { root, state, request } = await runtime()
  const a = join(fixture, 'workspace-a'), b = join(fixture, 'workspace-b')
  mkdirSync(a); mkdirSync(b)
  state.workspaces = [{ id: 'a', path: a, sessionIds: ['fixture-session'] }]
  const fiber = await root.plugin(plugin)
  assert.equal((await request('addrepo', { path: repo, sid: 'fixture-session', workspaceId: 'a' }, 'POST')).repo, repo)
  assert.deepEqual((await request('repos', { sid: 'fixture-session', workspaceId: 'a' })).repos, [repo])
  state.workspaces = [{ id: 'b', path: b, sessionIds: ['fixture-session'] }]
  assert.deepEqual((await request('repos', { sid: 'fixture-session', workspaceId: 'b' })).repos, [])
  assert.equal((await request('graph', { repo, sid: 'fixture-session', workspaceId: 'b' })).error, 'repo-not-in-workspace')
  state.workspaces = [{ id: 'a', path: a, sessionIds: ['fixture-session'] }]
  assert.deepEqual((await request('repos', { sid: 'fixture-session', workspaceId: 'a' })).repos, [repo])
  await fiber.dispose()
})

test('stale workspace identities reject reads and writes before touching a repository', async () => {
  const { root, state, request } = await runtime()
  state.workspaces = [{ id: 'new-workspace', path: plain, sessionIds: ['fixture-session'] }]
  const fiber = await root.plugin(plugin)
  for (const [op, params, method] of [
    ['repos', {}, 'GET'], ['findrepos', {}, 'GET'], ['addrepo', { path: repo }, 'POST'],
    ['graph', { repo }, 'GET'], ['gitop', { repo, action: 'stage-all' }, 'POST'],
  ]) {
    const result = await request(op, { sid: 'fixture-session', workspaceId: 'old-workspace', ws: repo, ...params }, method)
    assert.equal(result.status, 409, op); assert.equal(result.error, 'workspace-mismatch', op)
  }
  assert.equal(git('diff', '--cached', '--name-only').trim(), '')
  await fiber.dispose()
})

test('depth-two discovery supports worktree .git files and skips hidden/heavy/external symlink folders', async () => {
  const { root, state, request } = await runtime()
  const workspace = join(fixture, 'scan-boundaries'), nested = join(workspace, 'apps', 'inside'), linked = join(workspace, 'linked')
  const command = makeRepository(nested)
  command('worktree', 'add', '-b', 'linked-fixture', linked)
  makeRepository(join(workspace, 'node_modules', 'hidden-project'))
  makeRepository(join(workspace, '.cache', 'hidden-project'))
  makeRepository(join(workspace, 'one', 'two', 'too-deep'))
  symlinkSync(repo, join(workspace, 'external-alias'), 'dir')
  state.workspaces = [{ id: 'scan', path: workspace, sessionIds: ['fixture-session'] }]
  const fiber = await root.plugin(plugin)
  const result = await request('repos', { sid: 'fixture-session', workspaceId: 'scan' })
  assert.deepEqual(result.repos, [linked, nested])
  await fiber.dispose()
})


test('acknowledged canonical scope rejects cwd/path races while discovery can acknowledge the new workspace', async () => {
  const { root, state, request } = await runtime()
  const first = join(fixture, 'scope-before'), second = join(fixture, 'scope-after')
  makeRepository(first); makeRepository(second)
  state.workspaces = [{ id: 'same-id', path: first, sessionIds: ['fixture-session'] }]
  const fiber = await root.plugin(plugin)
  const acknowledgement = await request('repos', { sid: 'fixture-session', workspaceId: 'same-id' })
  assert.equal(acknowledgement.ws, first)
  state.workspaces = [{ id: 'same-id', path: second, sessionIds: ['fixture-session'] }]
  for (const [op, params, method] of [
    ['graph', { repo: first }, 'GET'], ['addrepo', { path: repo }, 'POST'],
    ['listdir', { path: first }, 'GET'], ['gitop', { repo: first, action: 'stage-all' }, 'POST'],
  ]) {
    const result = await request(op, { sid: 'fixture-session', workspaceId: 'same-id', scope: first, ...params }, method)
    assert.equal(result.status, 409, op); assert.equal(result.error, 'workspace-mismatch', op)
  }
  const current = await request('repos', { sid: 'fixture-session', workspaceId: 'same-id', scope: first })
  assert.equal(current.ws, second); assert.deepEqual(current.repos, [second])
  assert.equal((await request('graph', { repo: second, sid: 'fixture-session', workspaceId: 'same-id', scope: second })).ok, true)
  await fiber.dispose()
})

test('explicit workspace-only reads and writes cannot silently fall back to global authority', async () => {
  const { root, request } = await runtime()
  const workspace = join(fixture, 'explicit-workspace-only'); mkdirSync(workspace)
  const fiber = await root.plugin(plugin, { repo })
  assert.equal((await request('graph', { repo, ws: workspace })).error, 'repo-not-in-workspace')
  assert.equal((await request('gitop', { repo, ws: workspace, action: 'stage-all' }, 'POST')).error, 'repo-not-in-workspace')
  assert.equal((await request('listdir', { path: repo, ws: workspace })).error, 'path-not-allowed')
  await fiber.dispose()
})

test('legacy Session cwd changes also invalidate previously acknowledged scope', async () => {
  const { root, state, request } = await runtime()
  const fiber = await root.plugin(plugin)
  const acknowledgement = await request('repos', { sid: 'fixture-session' })
  assert.equal(acknowledgement.ws, repo)
  state.cwd = plain
  assert.equal((await request('addrepo', { path: repo, sid: 'fixture-session', scope: repo }, 'POST')).error, 'workspace-mismatch')
  assert.equal((await request('graph', { repo, sid: 'fixture-session', scope: '/missing/scope' })).error, 'workspace-mismatch')
  assert.equal((await request('repos', { sid: 'fixture-session', scope: repo })).ws, plain)
  await fiber.dispose()
})
