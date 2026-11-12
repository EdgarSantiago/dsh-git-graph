import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync,existsSync } from 'node:fs'

const read = file => readFileSync(new URL(file,import.meta.url),'utf8')
const manifest = JSON.parse(read('package.json'))

test('public package identity matches Client module, bundle and GitHub source',()=>{
 assert.equal(manifest.name,'@edgarsantiago/dsh-git-graph')
 assert.ok(read('client.js').includes("id: '"+manifest.name+"'"))
 assert.ok(read('cordis.patch.yml').includes("name: '"+manifest.name+"'"))
 assert.equal(manifest.repository.url,'https://github.com/EdgarSantiago/dsh-git-graph.git')
 assert.equal(manifest.license,'MIT')
 assert.equal(manifest.engines.dsh,'0.2.2-rc.1 || 0.2.2-rc.2')
 assert.equal(manifest.engines.dsh,manifest.peerDependencies['@deepseek-ai/dsh'])
 assert.equal(manifest.peerDependenciesMeta['@deepseek-ai/dsh'].optional,true)
})
test('source distribution includes every runtime resource and keeps the npm-publication guard',()=>{
 assert.equal(manifest.private,true)
 for(const file of ['index.js','client.js','cordis.patch.yml','icon.svg','README.md','CHANGELOG.md','LICENSE']){
  assert.ok(manifest.files.includes(file),file)
  assert.ok(existsSync(new URL(file,import.meta.url)),file)
 }
 for(const file of ['package.json','cordis.patch.yml',...['en','pt','pt-BR','zh','ja','es','fr','de','ru'].map(tag=>'locale/'+tag+'.json')])assert.ok(!read(file).startsWith('\ufeff'),file)
  assert.ok(manifest.files.includes('locale/*.json'))
  assert.equal(manifest.exports['./locale/*.json'],'./locale/*.json')
 assert.ok(!manifest.scripts.prepare&&!manifest.scripts.prepack&&!manifest.scripts.install)
 assert.ok(read('LICENSE').includes('Copyright (c) 2026 dsh-git-graph contributors'))
})
test('pnpm frozen installation uses the same peer setting as the committed lockfile',()=>{
 assert.match(read('pnpm-workspace.yaml'),/^autoInstallPeers: false$/m)
 assert.match(read('pnpm-lock.yaml'),/^\s+autoInstallPeers: false$/m)
})
test('catalog README documents source install, category, permissions and original attribution',()=>{
 const text=read('README.md')
 assert.ok(text.includes('dsh plugin --profile web add github:EdgarSantiago/dsh-git-graph'))
 for(const required of ['dsh-plugin','Development & Operations','0.2.2-rc.1','Permissions','GitHub-only','not an npm release','1841220388zzzcccxxx-star/dsh-git-graph'])assert.ok(text.includes(required),required)
})
