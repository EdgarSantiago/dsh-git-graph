import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { API_PREFIX } from './index.js'

// Only pure dictionaries/formatting/graph calculations are evaluated: no mocked React or DOM.
const source = readFileSync(new URL('./client.js', import.meta.url), 'utf8')
const localeCode = source.slice(source.indexOf('const en = '), source.indexOf('\n    const css ='))
const {en,dictionaries,normalizeLocale,localeTag,formatDate,actionLabels,parameterLabels,operationSummary,errorNotice,noticeText} = runInNewContext(localeCode+';({en,dictionaries,normalizeLocale,localeTag,formatDate,actionLabels,parameterLabels,operationSummary,errorNotice,noticeText})')
const graphText = source.slice(source.indexOf('function layoutGraph('), source.indexOf('\n    async function api('))
const graph = runInNewContext('('+graphText+')')
const nativeLanguages=['en','pt','zh','ja','es','fr','de','ru']
const tr=language=>key=>dictionaries[language][key]

test('every native locale has the complete, nonempty control and aria dictionary', () => {
  assert.deepEqual(Object.keys(dictionaries).sort(), [...nativeLanguages,'pt-BR'].sort())
  const keys=Object.keys(en).sort()
  const literalUses = [...source.matchAll(/(?:tr|btn)\('([^']+)'/g)].map(m=>m[1])
  for (const key of [...literalUses,...Object.values(actionLabels),...Object.values(parameterLabels)]) assert.ok(en[key], 'Missing UI label: '+key)
  for(const language of nativeLanguages){
    const dictionary=dictionaries[language]
    assert.deepEqual(Object.keys(dictionary).sort(),keys,language)
    for(const [key,value] of Object.entries(dictionary))assert.ok(typeof value==='string'&&value.trim().length>0,language+': '+key)
  }
  assert.equal(en.title,'Git graph')
  assert.equal(en.confirmTitle,'Confirm Git operation')
})
test('UI and metadata dictionaries preserve all named interpolation parameters and contain no invisible markers', () => {
  const placeholders=text=>[...text.matchAll(/\{(\w+)\}/g)].map(match=>match[1]).sort()
  const metadata=JSON.parse(readFileSync(new URL('./locale/en.json',import.meta.url),'utf8')).meta
  for(const language of [...nativeLanguages,'pt-BR']){
    for(const [key,value] of Object.entries(dictionaries[language])){
      assert.deepEqual(placeholders(value),placeholders(en[key]),language+'.'+key)
      assert.ok(!/[\u200b\ufeff]/u.test(value),language+'.'+key)
    }
    const localized=JSON.parse(readFileSync(new URL('./locale/'+language+'.json',import.meta.url),'utf8')).meta
    for(const [key,value] of Object.entries(localized)){
      assert.deepEqual(placeholders(value),placeholders(metadata[key]),'metadata '+language+'.'+key)
      assert.ok(!/[\u200b\ufeff]/u.test(value),'metadata '+language+'.'+key)
    }
  }
})
test('Portuguese alias shares its dictionary; regional date tags normalize with English fallback', () => {
  assert.equal(dictionaries['pt-BR'],dictionaries.pt)
  for(const language of nativeLanguages){
    assert.equal(normalizeLocale(language),language)
    assert.equal(normalizeLocale(language.toUpperCase()+'-XX'),language)
  }
  for(const alias of ['pt-BR','PT-br',' pt-br ','pt-PT']){
    assert.equal(normalizeLocale(alias),'pt')
    assert.equal(localeTag(alias),'pt-BR')
  }
  for(const unknown of ['','unknown',null,undefined,1,'constructor','__proto__'])assert.equal(normalizeLocale(unknown),'en')
})
test('Harness Language owns selection, native translation fallback and reactive updates without remounting the view', () => {
  assert.ok(source.includes("ctx.locale.bind(namespace)")) // Native fallback chain: selected language -> English -> key.
  assert.ok(source.includes('ctx.effect(()=>ctx.locale.register(namespace,language,dictionary))'))
  assert.ok(source.includes('ctx.locale.subscribe(notify)'))
  assert.ok(source.includes('ctx.locale.getLocale()'))
  assert.ok(source.includes('useSyncExternalStore(subscribeLocale,getLocale,getLocale).active'))
  assert.ok(source.includes("label:()=>tr('title')"))
  assert.ok(source.includes("className:'ggb',lang:localeTag(locale)"))
  assert.ok(source.includes("inject:['slots','uiWorkspace','locale']"))
  for(const removed of ['ctx.locale.setLocale','navigator.language','ggb-language','setOverride',"tr('language')","localStorage.getItem('ggb-lang')"])assert.ok(!source.includes(removed),removed)
  assert.ok(!source.includes('key:locale'))
  const manifest=JSON.parse(readFileSync(new URL('./package.json',import.meta.url),'utf8'))
  assert.ok(manifest.dsh.client.inject.includes('@deepseek-ai/dsh-client-locale'))
})
test('dictionary evaluation never consults browser language or obsolete saved panel overrides', () => {
  let reads=0
  runInNewContext(localeCode,{navigator:{get language(){reads++;throw Error('Do not read browser settings')}},localStorage:{getItem(){reads++;throw Error('Do not read panel language')}}})
  assert.equal(reads,0)
})
test('dates follow each selected language, preserve invalid dates and use English for unsupported tags', () => {
  const value='2026-06-15T12:30:00Z'
  for(const language of [...nativeLanguages,'pt-BR']){
    const tag=language==='pt'?'pt-BR':language
    const expected=new Intl.DateTimeFormat(tag,{year:'2-digit',month:'short',day:'2-digit'}).format(new Date(value))
    assert.equal(formatDate(value,language),expected,language)
  }
  assert.notEqual(formatDate(value,'ja'),formatDate(value,'en'))
  assert.equal(formatDate(value,'unsupported'),formatDate(value,'en'))
  assert.equal(formatDate('invalid-date','ru'),'invalid-date')
  assert.ok(source.includes('const date=s=>formatDate(s,locale)'))
})
test('existing notices and confirmation labels retranslate while Git data remains literal', () => {
  const params={file:['src/English.js','日本語.txt'],name:'feature/not-translated',hash:'abc123'}
  const original=JSON.stringify(params)
  for(const language of nativeLanguages){
    const summary=operationSummary('stage-all',params,tr(language))
    assert.ok(summary.startsWith(dictionaries[language].stageAll+'\n'))
    for(const value of [...params.file,params.name,params.hash])assert.ok(summary.includes(value))
    assert.ok(summary.includes(dictionaries[language].file+': '))
    assert.equal(operationSummary('unknown',{},tr(language)),dictionaries[language].confirmTitle)
    for(const key of ['success','copied','compareHelp','workspaceChanged','noRemote','failureHelp'])assert.equal(noticeText({key},tr(language)),dictionaries[language][key])
    const diagnostic='fatal: raw Git output /literal/path'
    assert.equal(noticeText({key:'failureHelp',detail:diagnostic},tr(language)),dictionaries[language].failureHelp+'\n'+diagnostic)
  }
  assert.equal(JSON.stringify(params),original)
  assert.ok(!source.includes('setNotice({text:tr('))
  assert.ok(!source.includes('notice.text'))
  assert.ok(source.includes('operationSummary(m.action,m.params,tr)'))
  assert.ok(source.includes('noticeText(notice,tr)'))
})
test('the same stored feedback and confirmation data can be translated again without mutation', () => {
  const diagnostic='fatal: reference «feature/日本語» not found at /literal/path'
  const stored=Object.freeze(errorNotice(Object.assign(Error(diagnostic),{code:'git-failed',detail:diagnostic})))
  const params=Object.freeze({file:Object.freeze(['café.txt','日本語.md']),message:'User commit: ! {literal}',name:'feature/unchanged'})
  const original=JSON.stringify({stored,params})
  const results=[]
  for(const language of [...nativeLanguages,'pt-BR']){
    const notice=noticeText(stored,tr(language))
    assert.ok(notice.startsWith(dictionaries[language].failureHelp+'\n'))
    assert.ok(notice.endsWith('git-failed: '+diagnostic))
    const summary=operationSummary('commit',params,tr(language))
    assert.ok(summary.startsWith(dictionaries[language].commit+'\n'))
    for(const value of [...params.file,params.message,params.name])assert.ok(summary.includes(value))
    results.push(notice)
  }
  assert.equal(new Set(results).size,nativeLanguages.length)
  assert.equal(JSON.stringify({stored,params}),original)
  assert.ok(!/setModal\([^\n]*tr\(|key:locale/.test(source))
})
test('error normalization preserves literal API and native picker/clipboard/network diagnostics', () => {
  for(const message of ['Native picker denied','Clipboard unavailable','Failed to fetch']){
    const notice=errorNotice(Error(message))
    assert.equal(notice.key,'failureHelp')
    assert.equal(notice.detail,message)
    for(const language of nativeLanguages)assert.equal(noticeText(notice,tr(language)),dictionaries[language].failureHelp+'\n'+message)
  }
  const apiError=Object.assign(Error('git-failed: fatal: literal Git output'),{code:'git-failed',detail:'fatal: literal Git output'})
  assert.equal(errorNotice(apiError).detail,'git-failed: fatal: literal Git output')
  const workspaceError=Object.assign(Error('workspace-mismatch'),{code:'workspace-mismatch'})
  assert.equal(errorNotice(workspaceError).key,'workspaceChanged')
  assert.equal(errorNotice(workspaceError).detail,'workspace-mismatch')
  const localError=Object.assign(Error('internal-no-remote-marker'),{localeKey:'noRemote'})
  assert.equal(noticeText(errorNotice(localError),tr('pt')),dictionaries.pt.noRemote)
  assert.ok(source.includes('setNotice(errorNotice(e))'))
})
test('plugin display metadata covers every locale and retains Portuguese alias parity', () => {
  const readLocale=tag=>{
    const text=readFileSync(new URL('./locale/'+tag+'.json',import.meta.url),'utf8')
    assert.ok(!text.startsWith('\ufeff'),tag)
    return JSON.parse(text)
  }
  for(const language of nativeLanguages){
    const metadata=readLocale(language)
    assert.equal(metadata.meta.title,dictionaries[language].title)
    assert.equal(Object.keys(metadata.meta).sort().join(','),'description,title')
    assert.ok(metadata.meta.description.trim())
    assert.ok(!metadata.meta.description.includes('Interface in English.'))
  }
  assert.deepEqual(readLocale('pt-BR'),readLocale('pt'))
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
test('client remains one self-contained native ModuleLoader artifact with token-based styling', () => {
  assert.ok(source.includes("ctx.slots.inject('conversation.view'"))
  assert.deepEqual([...source.matchAll(/require\('([^']+)'\)/g)].map(match=>match[1]),['react'])
  assert.ok(!/^\s*import\b/m.test(source))
  assert.ok(!source.includes("h('iframe'"))
  const css = source.slice(source.indexOf('const css ='), source.indexOf('const palette ='))
  assert.ok(!/#[0-9a-f]{3,8}\b/i.test(css))
})
