import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {runInNewContext} from 'node:vm'

// Evaluate pure state/layout calculations only; never emulate React or the DOM.
const source=readFileSync(new URL('./client.js',import.meta.url),'utf8')
const part=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)))
const disabled=runInNewContext('('+part('function actionDisabled(','    function graphColumnWidth(')+')')
const width=runInNewContext('('+part('function graphColumnWidth(','    function workspaceForSession(')+')')
const state=(staged=0,unstaged=0,untracked=0)=>({ready:true,busy:false,discovering:false,work:{staged:Array(staged).fill({}),unstaged:Array(unstaged).fill({}),untracked:Array(untracked).fill({})}})

test('base stylesheet has no superseded exact-selector property declarations',()=>{
 const css=part('const css = `','    const palette =').split('@container')[0]
 const properties=new Map()
 for(const [,raw,body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
  const selector=raw.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*const css = `/, '').trim()
  const seen=properties.get(selector)||new Set()
  for(const declaration of body.split(';').filter(value=>value.trim())){
   const name=declaration.slice(0,declaration.indexOf(':')).trim()
   assert.equal(seen.has(name),false,selector+' repeats '+name)
   seen.add(name)
  }
  properties.set(selector,seen)
 }
 assert.ok(!css.includes('.ggb-work summary'))
})

test('clean worktree disables stage-all, unstage-all and commit, but not remote operations',()=>{
 for(const key of ['stageAll','unstageAll','commit'])assert.equal(disabled(key,state()),true,key)
 for(const key of ['fetch','pull','push'])assert.equal(disabled(key,state()),false,key)
})
test('staged, unstaged and untracked changes enable only meaningful bulk actions',()=>{
 for(let staged=0;staged<3;staged++)for(let unstaged=0;unstaged<3;unstaged++)for(let untracked=0;untracked<3;untracked++){
  const s=state(staged,unstaged,untracked)
  assert.equal(disabled('stageAll',s),unstaged+untracked===0)
  assert.equal(disabled('unstageAll',s),staged===0)
  assert.equal(disabled('commit',s),staged+unstaged+untracked===0)
 }
})
test('loading, discovery and unavailable graph cannot be bypassed by an explicit false disabled override',()=>{
 for(const key of ['stageAll','unstageAll','commit','fetch','pull','push','stage','restore']){
  assert.equal(disabled(key,{...state(1,1,1),busy:true,disabled:false}),true,key)
  assert.equal(disabled(key,{...state(1,1,1),discovering:true,disabled:false}),true,key)
  assert.equal(disabled(key,{...state(1,1,1),ready:false}),true,key)
  assert.equal(disabled(key,{...state(1,1,1),disabled:true}),true,key)
 }
 for(const key of ['open','discover','refresh'])assert.equal(disabled(key,{...state(),ready:false}),false,key)
})
test('linear graph uses a compact gutter; branch lanes remain bounded and fit their nodes',()=>{
 assert.equal(width([]),36)
 assert.equal(width([{col:0,edges:[[0,0]]}]),36)
 for(let lane=0;lane<20;lane++){
  const value=width([{col:lane,edges:[[0,lane]]}])
  assert.ok(value>=8+(lane%8)*12+5)
  assert.ok(value>=36&&value<=108)
 }
})
test('history has matching scoped column headers and stable hash-based selection',()=>{
 assert.ok(source.includes("h('thead'"))
 for(const key of ['commitColumn','hash','author','date'])assert.ok(source.includes("scope:'col'},tr('"+key+"')"),key)
 assert.ok(source.includes('const active=visible.findIndex(c=>c.hash===activeHash)'))
 assert.ok(source.includes("onFocus:()=>setActiveHash(c.hash)"))
 assert.ok(source.includes('row?.focus({preventScroll:true})'))
 assert.ok(source.includes("e.target.closest('button')"))
})
test('clean changes panel stays a single compact summary without an empty file body',()=>{
 const panel=part('function workPanel(){','        function shortcuts()')
 assert.ok(panel.includes('count>0&&workOpen'))
 assert.ok(panel.includes("className:'ggb-workbar'"))
 assert.ok(!panel.includes("className:'ggb-toolbar'"))
 assert.ok(!panel.includes("h('p'"))
 assert.ok(panel.includes("'aria-expanded':workOpen"))
})
test('narrow panes retain branch filtering and footer shortcuts do not scroll with history',()=>{
 assert.ok(source.includes("className:'ggb-branch-picker'"))
 assert.ok(source.includes("className:'ggb-compact-filter'"))
 assert.ok(source.includes('refActions(branches.find(b=>b.refname===filter))'))
 assert.ok(source.includes("h('div',{className:'ggb-wrap'},refActions(b))"))
 assert.ok(source.includes('container-name:githistory'))
 assert.ok(source.includes('@container gitgraph'))
 assert.ok(source.includes("h('footer',{className:'ggb-footer'}"))
 assert.ok(source.includes("h('kbd',null,'Enter')"))
 assert.ok(source.includes("{className:'ggb-more'})),shortcuts()"))
})
