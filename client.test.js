import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { API_PREFIX } from './index.js'

// Only pure dictionaries/graph calculations are evaluated: no mocked React or DOM.
const source = readFileSync(new URL('./client.js', import.meta.url), 'utf8')
const englishCode = source.slice(source.indexOf('const en = '), source.indexOf('\n    const css ='))
const {en,tr} = runInNewContext(englishCode+';({en,tr})')
const graphText = source.slice(source.indexOf('function layoutGraph('), source.indexOf('\n    async function api('))
const graph = runInNewContext('('+graphText+')')

test('English labels cover all controls and retain the tab title', () => {
  for (const [key, value] of Object.entries(en)) assert.equal(typeof value === 'string' && value.trim().length > 0, true, key)
  const literalUses = [...source.matchAll(/(?:tr|btn)\('([^']+)'/g)].map(m=>m[1])
  for (const key of literalUses) assert.ok(en[key], 'Missing English UI label: '+key)
  assert.equal(tr('title'),'Git graph')
  assert.equal(tr('confirmTitle'),'Confirm Git operation')
  assert.equal(tr('unknown-label'),'unknown-label')
})
test('Portuguese Harness settings and old saved language cannot change the English-only interface', () => {
  let reads=0
  const forced=runInNewContext(englishCode+';({en,tr})',{navigator:{language:'pt-BR'},localStorage:{getItem(){reads++;return 'pt-BR'}}})
  assert.equal(forced.tr('open'),'Open repository');assert.equal(forced.tr('refresh'),'Refresh');assert.equal(reads,0)
  for(const removed of ['ctx.locale','ggb-language','setOverride','const pt =',"tr('language')","tr('follow')"])assert.ok(!source.includes(removed),removed)
  assert.ok(source.includes("new Intl.DateTimeFormat('en',"))
  assert.ok(source.includes("className:'ggb',lang:'en'"))
  assert.ok(source.includes('label:en.title'))
})
test('plugin display metadata stays English regardless of Harness locale', () => {
  const readLocale=tag=>JSON.parse(readFileSync(new URL('./locale/'+tag+'.json',import.meta.url),'utf8'))
  const metadata=readLocale('en')
  assert.equal(metadata.meta.title,'Git graph')
  assert.ok(metadata.meta.description.includes('Interface in English.'))
  for(const tag of ['pt','pt-BR'])assert.deepEqual(readLocale(tag),metadata)
})
test('graph layout retains parent lanes through a merge', () => {
  const rows = graph([{hash:'merge',parents:['left','right']},{hash:'left',parents:['root']},{hash:'right',parents:['root']},{hash:'root',parents:[]}])
  assert.equal(rows.length,4)
  assert.equal(rows[0].edges.length,2)
  assert.equal(rows[1].col,0)
  assert.equal(rows[2].col,1)
  assert.equal(rows[3].col,0)
  for(const row of rows)for(const edge of row.edges) assert.ok(edge[0]>=0&&edge[1]>=0)
})
test('client uses the corrected namespaced backend instead of the orphan legacy route', () => {
  assert.ok(source.includes("fetch('"+API_PREFIX+"/api?'+q"))
  assert.ok(!source.includes("fetch('/git-graph/api?"))
  assert.ok(source.includes('generation!==discoveryRequest.current'))
})
test('client uses native slots and token-based control styling', () => {
  assert.ok(source.includes("ctx.slots.inject('conversation.view'"))
  assert.ok(!source.includes("require('@deepseek-ai/"))
  assert.ok(!source.includes("h('iframe'"))
  const css = source.slice(source.indexOf('const css ='), source.indexOf('const palette ='))
  assert.ok(!/#[0-9a-f]{3,8}\b/i.test(css))
})
