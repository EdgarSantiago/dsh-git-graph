import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, symlinkSync, mkdirSync, rmSync, realpathSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { apply, API_PREFIX } from './index.js'

// Fixtures live only under the workspace; no profile, installation, or real repository is mutated.
const fixtures = mkdtempSync(join(process.cwd(), '.git-graph-test-'))
test.after(() => {
  const checked = realpathSync(fixtures)
  assert.equal(checked.startsWith(realpathSync(process.cwd()) + '/.git-graph-test-'), true)
  rmSync(checked, { recursive: true, force: true })
})
const repo = join(fixtures, 'repo')
mkdirSync(repo)
const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' })
git('init'); git('config', 'user.email', 'fixture@example.test'); git('config', 'user.name', 'Fixture')
writeFileSync(join(repo, 'tracked.txt'), 'original\n')
git('add', '.'); git('commit', '-m', 'Initial fixture')
writeFileSync(join(repo, 'tracked.txt'), 'changed\n')
writeFileSync(join(repo, 'new.txt'), 'new content\n')
writeFileSync(join(fixtures, 'secret.txt'), 'outside secret')
symlinkSync(join(fixtures, 'secret.txt'), join(repo, 'escape.txt'))
let route, dispose, tool, approvalOutcome = 'rejected', approvalRequests = [], sessionCwd = repo
apply({ get: (key) => key === 'agents' ? { get: (sid) => sid === 'fixture-session' ? { id: sid } : undefined } : key === 'sessions' ? { get: sid => sid === 'saved-session' ? { header: { cwd: sessionCwd } } : undefined } : undefined, tools: { register: (value) => { tool = value; return () => {} } }, approval: { request: async (value) => { approvalRequests.push(value); return approvalOutcome } }, workingDirectory: { ensure: async () => sessionCwd, get: session => session.header.cwd }, webServer: { getOrigin: () => 'http://127.0.0.1:1234', register: (value) => { route = value; return () => {} } }, connection: { requestRejection: (req) => req.headers.cookie === 'owner' ? undefined : 401 }, effect: callback => { dispose = callback(); return dispose } }, { repo })
async function request(op, params = {}, method = 'GET', origin = 'http://127.0.0.1:1234', cookie = 'owner') {
  let status, body
  await route.handler({ url: API_PREFIX + '/api?' + new URLSearchParams({ op, repo, ...params }), method, headers: { host: '127.0.0.1:1234', origin, cookie }, resume() {} }, { writeHead(code) { status = code }, end(value) { body = JSON.parse(value) } })
  return { status, ...body }
}
test('current WebServer route and disposal contracts', () => { assert.equal(route.kind, 'prefix'); assert.equal(route.path, API_PREFIX); assert.equal(typeof dispose, 'function') })
test('authenticated read API shapes', async () => {
  const graph = await request('graph'); assert.equal(graph.ok, true); assert.equal(graph.commits.length, 1)
  const hash = graph.commits[0].hash
  const detail = await request('show', { hash })
  assert.equal(detail.subject, 'Initial fixture')
  assert.deepEqual(detail.files, [{ path: 'tracked.txt', status: 'A' }])
  assert.equal((await request('diff', { from: hash, to: hash })).diff, '')
  assert.equal((await request('diff', { from: '--stat', to: hash })).error, 'invalid-ref')
  assert.equal((await request('branches')).branches[0].kind, 'local')
  assert.equal((await request('workstatus')).counts.untracked, 2)
  assert.match((await request('workfile', { file: 'tracked.txt' })).diff, /changed/)
  assert.equal((await request('workfile', { file: 'new.txt', staged: 'untracked' })).content, 'new content\n')
  assert.equal((await request('repos', { ws: repo })).current, repo)
})
test('session id discovers committed live working directory without client cwd', async () => {
  const result = await request('repos', { sid: 'fixture-session', ws: '/missing' })
  assert.equal(result.ws, repo); assert.equal(result.current, repo)
})
test('authentication, method and same-origin mutation gates', async () => {
  assert.equal((await request('graph', {}, 'GET', undefined, '')).status, 401)
  assert.equal((await request('gitop', { action: 'stage-all' })).status, 405)
  assert.equal((await request('addrepo', { path: repo })).status, 405)
  assert.equal((await request('gitop', { action: 'stage-all' }, 'POST', 'https://evil.test')).status, 403)
  assert.equal((await request('gitop', { action: 'stage-all' }, 'POST', '')).status, 403)
})
test('updates are disabled and refs cannot inject options', async () => {
  for (const op of ['autoupdate', 'selfupdate', 'checkupdate']) assert.equal((await request(op)).error, 'updates-disabled')
  assert.equal((await request('show', { hash: '--all' })).error, 'invalid-ref')
})
test('traversal and symlink escapes are rejected', async () => {
  assert.equal((await request('workfile', { file: '../secret.txt', staged: 'untracked' })).error, 'path-outside-repo')
  assert.equal((await request('workfile', { file: 'escape.txt', staged: 'untracked' })).error, 'path-outside-repo')
  assert.equal((await request('gitop', { action: 'ignore', file: 'escape.txt' }, 'POST')).error, 'path-outside-repo')
})
test('directory browsing stays in registered repositories', async () => {
  assert.equal((await request('listdir', { path: repo })).ok, true)
  assert.equal((await request('listdir', { path: fixtures })).error, 'path-not-allowed')
  assert.equal((await request('graph', { repo: fixtures })).error, 'repo-not-allowed')
})
test('standalone HTML is no longer served', async () => {
  let status, body
  await route.handler({ url: API_PREFIX + '/index.html' }, { writeHead(code) { status = code }, end(value) { body = JSON.parse(value) } })
  assert.equal(status, 404); assert.equal(body.error, 'not-found')
})
test('Agent mutation tool fails closed and shares the HTTP executor', async () => {
  const exec = { agent: { id: 'fixture-session' }, signal: new AbortController().signal, callId: 'fixture-call' }
  await assert.rejects(tool.execute({ action: 'stage', files: ['tracked.txt'] }, exec), /approval-denied/)
  assert.equal(approvalRequests.at(-1).agent, exec.agent)
  assert.equal(git('diff', '--cached', '--name-only').trim(), '')
  // The fixture directory is nested in this plugin checkout, so it has a Git ancestor.
  sessionCwd = '/'
  await assert.rejects(tool.execute({ action: 'stage-all' }, exec), /not-a-git-repo/)
  sessionCwd = repo
  approvalOutcome = 'allowed-once'
  assert.equal((await tool.execute({ action: 'stage', files: ['../secret.txt'] }, exec)).error, 'path-outside-repo')
  assert.equal((await tool.execute({ action: 'tag', name: '--delete', hash: 'HEAD' }, exec)).error, 'invalid-ref')
  assert.equal((await tool.execute({ action: 'stage', files: ['tracked.txt'] }, exec)).ok, true)
  assert.equal((await request('workstatus')).staged.some((file) => file.path === 'tracked.txt'), true)
  assert.equal((await tool.execute({ action: 'unstage', files: ['tracked.txt'] }, exec)).ok, true)
  approvalOutcome = 'rejected'
})
test('Git failures retain bounded English diagnostics', async () => {
  const result = await request('gitop', { action: 'checkout', name: 'missing-fixture-branch' }, 'POST')
  assert.equal(result.error, 'git-failed')
  assert.match(result.detail, /pathspec|did not match/)
  assert.equal(result.detail.length <= 4000, true)
})
test('workstatus surfaces a failed Git index read instead of reporting a clean tree', async () => {
  const index = join(repo, '.git', 'index'), original = readFileSync(index)
  try {
    writeFileSync(index, 'invalid-index')
    const result = await request('workstatus')
    assert.equal(result.ok, false)
    assert.equal(result.error, 'git-failed')
    assert.match(result.detail, /index|signature/i)
    assert.ok(result.detail.length <= 4000)
    assert.equal('counts' in result, false)
  } finally { writeFileSync(index, original) }
  assert.equal((await request('workstatus')).ok, true)
})

test('same-origin POST retains staging and addrepo features', async () => {
  assert.equal((await request('gitop', { action: 'stage', file: 'new.txt' }, 'POST')).ok, true)
  assert.equal((await request('workstatus')).staged.some((file) => file.path === 'new.txt'), true)
  assert.equal((await request('addrepo', { path: repo }, 'POST')).repo, repo)
})

function localRemoteFixture(name) {
  const remote = join(fixtures, `${name}-remote.git`)
  const local = join(fixtures, `${name}-local`)
  const peer = join(fixtures, `${name}-peer`)
  const at = (directory, ...args) => execFileSync('git', ['-C', directory, ...args], { encoding: 'utf8' })
  execFileSync('git', ['init', '--bare', '--initial-branch=main', remote])
  mkdirSync(local); at(local, 'init', '--initial-branch=main')
  const identity = directory => {
    at(directory, 'config', 'user.email', 'fixture@example.test')
    at(directory, 'config', 'user.name', 'Fixture')
  }
  identity(local)
  writeFileSync(join(local, 'sync.txt'), 'initial\n')
  at(local, 'add', '.'); at(local, 'commit', '-m', 'Initial sync fixture')
  at(local, 'remote', 'add', 'origin', remote); at(local, 'push', '-u', 'origin', 'main')
  execFileSync('git', ['clone', remote, peer]); identity(peer)
  return { remote, local, peer, at }
}

test('successful push to a local bare remote returns HTTP and Agent result objects', async () => {
  const { remote, local, at } = localRemoteFixture('push')
  assert.equal((await request('addrepo', { path: local }, 'POST')).repo, local)
  writeFileSync(join(local, 'sync.txt'), 'pushed change\n')
  at(local, 'add', '.'); at(local, 'commit', '-m', 'Pushed change')
  const result = await request('gitop', { repo: local, action: 'push', branch: 'main' }, 'POST')
  assert.equal(result.status, 200); assert.equal(result.ok, true)
  assert.equal(typeof result.summary, 'string')
  assert.equal(at(remote, 'rev-parse', 'refs/heads/main'), at(local, 'rev-parse', 'HEAD'))
  const previousCwd = sessionCwd, previousApproval = approvalOutcome
  try {
    sessionCwd = local; approvalOutcome = 'allowed-once'
    const toolResult = await tool.execute({ action: 'push' }, { agent: { id: 'fixture-session' }, signal: new AbortController().signal, callId: 'push-fixture' })
    assert.equal(toolResult.ok, true); assert.equal(typeof toolResult.summary, 'string')
  } finally { sessionCwd = previousCwd; approvalOutcome = previousApproval }
})

test('successful pull from a local bare remote returns HTTP and Agent result objects', async () => {
  const { local, peer, at } = localRemoteFixture('pull')
  assert.equal((await request('addrepo', { path: local }, 'POST')).repo, local)
  writeFileSync(join(peer, 'sync.txt'), 'pulled change\n')
  at(peer, 'add', '.'); at(peer, 'commit', '-m', 'Pulled change'); at(peer, 'push', 'origin', 'main')
  const result = await request('gitop', { repo: local, action: 'pull', branch: 'main' }, 'POST')
  assert.equal(result.status, 200); assert.equal(result.ok, true)
  assert.equal(typeof result.summary, 'string'); assert.match(result.summary, /Fast-forward|Updating/)
  assert.equal(at(local, 'rev-parse', 'HEAD'), at(peer, 'rev-parse', 'HEAD'))
  const previousCwd = sessionCwd, previousApproval = approvalOutcome
  try {
    sessionCwd = local; approvalOutcome = 'allowed-once'
    const toolResult = await tool.execute({ action: 'pull' }, { agent: { id: 'fixture-session' }, signal: new AbortController().signal, callId: 'pull-fixture' })
    assert.equal(toolResult.ok, true); assert.equal(typeof toolResult.summary, 'string')
  } finally { sessionCwd = previousCwd; approvalOutcome = previousApproval }
})

test('unknown Git actions return a typed client error without changing the repository', async () => {
  const head = git('rev-parse', 'HEAD')
  const status = git('status', '--porcelain=v1')
  const result = await request('gitop', { action: 'unknown-fixture-action' }, 'POST')
  assert.deepEqual(result, { status: 400, ok: false, error: 'unknown-action' })
  assert.equal(git('rev-parse', 'HEAD'), head)
  assert.equal(git('status', '--porcelain=v1'), status)
})

test('remote URLs never return HTTP credentials, signed queries or fragments', async () => {
  assert.deepEqual(await request('remoteinfo'), { status: 200, ok: true, web: null, remote: '' })
  const cases = [
    ['https://fixture-user:fixture-password@host.test/owner/repo.git?access_token=fixture-query#fixture-fragment', 'https://host.test/owner/repo.git', 'https://host.test/owner/repo'],
    ['http://fixture-user:fixture-password@host.test/owner/repo.git/?access_token=fixture-query#fixture-fragment', 'http://host.test/owner/repo.git/', 'http://host.test/owner/repo'],
    ['git@host.test:owner/repo.git', 'git@host.test:owner/repo.git', 'https://host.test/owner/repo'],
    ['ssh://git@host.test/owner/repo.git', 'ssh://git@host.test/owner/repo.git', 'https://host.test/owner/repo'],
    ['ssh://git:fixture-password@host.test/owner/repo.git?access_token=fixture-query#fixture-fragment', 'ssh://git@host.test/owner/repo.git', 'https://host.test/owner/repo'],
    ['https://fixture-user:fixture-password@', '', null],
  ]
  git('remote', 'add', 'origin', cases[0][0])
  try {
    for (const [origin, remote, web] of cases) {
      git('remote', 'set-url', 'origin', origin)
      const result = await request('remoteinfo')
      assert.deepEqual(result, { status: 200, ok: true, web, remote })
      for (const secret of ['fixture-user', 'fixture-password', 'fixture-query', 'fixture-fragment', 'access_token']) {
        assert.equal(JSON.stringify(result).includes(secret), false)
      }
    }
  } finally { git('remote', 'remove', 'origin') }
})
