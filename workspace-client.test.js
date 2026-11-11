import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
const source=readFileSync(new URL('./client.js',import.meta.url),'utf8')
const text=source.slice(source.indexOf('    function workspaceForSession('),source.indexOf('    const emptyGraph='))
const {workspaceForSession,workspaceStorageKey,readWorkspaceState,writeWorkspaceState,chooseWorkspaceRepo,createScopedRequest}=runInNewContext(text+'\n({workspaceForSession,workspaceStorageKey,readWorkspaceState,writeWorkspaceState,chooseWorkspaceRepo,createScopedRequest})')
const json=value=>JSON.parse(JSON.stringify(value))
const storage=()=>{const data=new Map();return{data,getItem:key=>data.get(key),setItem:(key,value)=>data.set(key,value)}}
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}}

test('native workspace membership is selected by session, not another selected project or stale cwd',()=>{
 const first={workspaceId:'a',path:'/workspace/a',sessionIds:['s1']},second={workspaceId:'b',path:'/workspace/b',sessionIds:['s2']}
 assert.equal(workspaceForSession({items:[first,second]},'s2'),second)
 assert.equal(workspaceForSession({items:[first,second]},'unknown'),null)
})
test('old global repository memory is never restored into a new workspace',()=>{
 const s=storage();s.data.set('ggb-repos',JSON.stringify(['/other/project']))
 assert.deepEqual(json(readWorkspaceState(s,'/new/workspace')),{repos:[],selected:''})
 writeWorkspaceState(s,'/workspace/a',{repos:['/a/api'],selected:'/a/api'})
 writeWorkspaceState(s,'/workspace/b',{repos:['/b/web'],selected:'/b/web'})
 assert.deepEqual(json(readWorkspaceState(s,'/workspace/a')),{repos:['/a/api'],selected:'/a/api'})
 assert.notEqual(workspaceStorageKey('/workspace/a'),workspaceStorageKey('/workspace/b'))
 assert.equal(workspaceStorageKey(''),null)
})
test('optional or corrupted storage cannot disable automatic discovery',()=>{
 const s=storage();s.data.set(workspaceStorageKey('/a'),'bad json')
 assert.deepEqual(json(readWorkspaceState(s,'/a')),{repos:[],selected:''})
 s.data.set(workspaceStorageKey('/a'),JSON.stringify({repos:['/a','/a',1,null],selected:1}))
 assert.deepEqual(json(readWorkspaceState(s,'/a')),{repos:['/a'],selected:''})
 assert.deepEqual(json(readWorkspaceState({getItem(){throw Error('denied')}},'/a')),{repos:[],selected:''})
})
test('repository selection accepts only members of the acknowledged workspace list',()=>{
 const repos=['/workspace/api','/workspace/web']
 assert.equal(chooseWorkspaceRepo(repos,'/other/repo','/old/project',undefined),repos[0])
 assert.equal(chooseWorkspaceRepo(repos,'',repos[1],repos[0]),repos[1])
 assert.equal(chooseWorkspaceRepo([],repos[0],repos[1],repos[0]),'')
})
test('all reads and writes carry immutable workspace identity; discovery can acknowledge a new scope',async()=>{
 const calls=[];let owner=new AbortController(),repo='/workspace/api'
 const api=createScopedRequest(async(op,params,signal)=>{calls.push({op,params,signal});return{ok:true}}, {sid:'session',workspaceId:'native-id',ws:'/workspace'},()=>owner,()=>'/canonical/workspace',()=>repo)
 await api('graph',{repo,sid:'wrong',workspaceId:'wrong',ws:'/wrong',scope:'/wrong'})
 assert.deepEqual(json(calls[0].params),{repo,sid:'session',workspaceId:'native-id',ws:'/workspace',scope:'/canonical/workspace'})
 await api('gitop',{repo,action:'stage-all'});assert.equal(calls[1].params.scope,'/canonical/workspace')
 await api('repos');assert.equal(calls[2].params.scope,undefined)
 owner.abort();await assert.rejects(api('addrepo',{path:'/other'}),{name:'AbortError'});assert.equal(calls.length,3)
})
test('workspace owner replacement suppresses late success and failure from another project',async()=>{
 for(const fail of [false,true]){
  let owner=new AbortController();const pending=deferred()
  const api=createScopedRequest(()=>pending.promise,{sid:'session'},()=>owner,()=>'/a')
  const request=api('repos');owner.abort();owner=new AbortController()
  if(fail)pending.reject(Error('late error from project A'));else pending.resolve({repos:['/a/repo']})
  await assert.rejects(request,{name:'AbortError'})
 }
})
test('switching repositories invalidates old graph responses and stale write callbacks',async()=>{
 let owner=new AbortController(),repo='/a/api';const pending=deferred();let calls=0
 const api=createScopedRequest(()=>{calls++;return pending.promise},{sid:'session'},()=>owner,()=>'/a',()=>repo)
 const read=api('graph',{repo});repo='/a/web';pending.resolve({commits:['old project']});await assert.rejects(read,{name:'AbortError'})
 await assert.rejects(api('gitop',{repo:'/a/api',action:'stage-all'}),{name:'AbortError'});assert.equal(calls,1)
})
test('new workspace mounts a fresh view and masks old graph/details/confirmation state immediately',()=>{
 assert.ok(source.includes('key:JSON.stringify([props.sessionId,workspaceId,path])'))
 assert.ok(source.includes('graphData.repo===repo'))
 assert.ok(source.includes('detail.repo!==repo'))
 assert.ok(source.includes('modal?.repo===repo'))
 assert.ok(!source.includes("localStorage.getItem('ggb-repos')"))
 assert.ok(source.includes("btn('discover',()=>void discover(true))"))
})
