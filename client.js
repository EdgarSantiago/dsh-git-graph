window.__ModuleLoader__.load({
  id: '@edgarsantiago/dsh-git-graph',
  factory: (require) => {
    const React = require('react');
    const {createElement: h, useState, useEffect, useRef} = React;
    const en = {
      title:'Git graph', workspace:'Workspace', workspaceChanged:'The workspace changed. Refresh the repository list before continuing.', refresh:'Refresh', open:'Open repository', search:'Search commits', branches:'Branches', all:'All branches',
      history:'History', changes:'Changes', staged:'Staged', unstaged:'Unstaged', untracked:'Untracked', clean:'Working tree clean',
      loading:'Loading…', empty:'No Git repository selected', emptyHelp:'Open a repository or find repositories in this session’s workspace.',
      discover:'Find repositories', loadMore:'Load more', commits:'commits', files:'files', details:'Commit details', close:'Close',
      author:'Author', date:'Date', parents:'Parents', copy:'Copy hash', copied:'Copied', diff:'Diff', noDiff:'No textual diff (unchanged or binary file).',
      stage:'Stage', unstage:'Unstage', restore:'Restore', stageAll:'Stage all', unstageAll:'Unstage all', commit:'Commit',
      message:'Commit message', commitAll:'Stage all files before committing', cancel:'Cancel', confirm:'Confirm',
      confirmTitle:'Confirm Git operation', destructive:'This operation may discard local changes. Review the repository and files before continuing.',
      fetch:'Fetch', pull:'Pull', push:'Push', checkout:'Switch branch', deleteBranch:'Delete branch', branch:'Create branch', tag:'Create tag',
      deleteTag:'Delete tag', renameTag:'Rename tag', name:'Name', newName:'New name', compare:'Compare', compareHelp:'Select a base commit, then another commit to compare.',
      selected:'Selected', clear:'Clear selection', ignore:'Ignore', fileHistory:'File history', back:'Back', error:'Operation failed',
      noCommits:'No commits match this filter.', folder:'Repository folder', openFolder:'Choose folder', success:'Operation completed',
      binary:'Binary file', truncated:'Output truncated', noFiles:'No changed files', remote:'Remote', local:'Local', tags:'Tags',
      keyboard:'Use ↑/↓ to navigate commits, Enter for details, Ctrl/⌘+F to search, Escape to close.', repo:'Repository',
      confirmBody:'Run this operation in the selected repository?', base:'Comparison base', suggest:'Suggest message',
      suggestNote:'Local heuristic, not AI-generated.', newRepo:'Path to a Git repository', file:'File', commitSelected:'Commit selected',
      openRemote:'Open remote commit', noRemote:'No supported HTTPS remote URL.',
      failureHelp:'Check the path, Git permissions and repository state, then refresh.', detached:'Detached HEAD',
    };
    const tr = key => en[key] || key;
    const css = `
      .ggb{height:100%;min-height:0;display:flex;flex-direction:column;position:relative;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;line-height:1.5}
      .ggb *{box-sizing:border-box}.ggb button,.ggb input,.ggb select,.ggb textarea{font:inherit;color:inherit;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:6px;padding:6px 9px;max-width:100%}
      .ggb button{cursor:pointer;white-space:nowrap}.ggb button:hover{background:var(--dsw-alias-bg-layer-2)}.ggb button:disabled{opacity:.5;cursor:default}.ggb :focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
      .ggb .ggb-primary{background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base)}.ggb .ggb-danger{color:var(--dsw-alias-state-error-primary)}
      .ggb-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px;border-bottom:1px solid var(--dsw-alias-border-l1)}.ggb-toolbar strong{font-size:15px;margin-right:6px}.ggb-repo{flex:1;min-width:140px;max-width:420px}
      .ggb-muted{color:var(--dsw-alias-label-secondary)}.ggb-status{padding:6px 12px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:12px;flex-wrap:wrap}.ggb-notice{padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);overflow-wrap:anywhere}.ggb-error{color:var(--dsw-alias-state-error-primary)}
      .ggb-main{display:flex;flex:1;min-height:0}.ggb-sidebar{width:210px;flex-shrink:0;border-right:1px solid var(--dsw-alias-border-l1);padding:12px;overflow:auto;background:var(--dsw-alias-bg-layer-1)}.ggb-sidebar h3{font-size:12px;margin:14px 0 6px;text-transform:uppercase;letter-spacing:.06em;color:var(--dsw-alias-label-secondary)}.ggb-sidebar label{display:flex;gap:7px;align-items:center;padding:5px 0;overflow-wrap:anywhere}.ggb-sidebar input{flex-shrink:0}.ggb-sidebar button{margin:3px 0}
      .ggb-content{flex:1;min-width:0;overflow:auto}.ggb-work{margin:12px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;overflow:hidden}.ggb-work summary{cursor:pointer;padding:9px 12px;background:var(--dsw-alias-bg-layer-1)}.ggb-work h4{margin:0;padding:8px 12px;font-size:12px;color:var(--dsw-alias-label-secondary)}
      .ggb-file{display:flex;gap:8px;align-items:center;padding:5px 12px;border-top:1px solid var(--dsw-alias-border-l1)}.ggb-file .ggb-path{flex:1;text-align:left;white-space:normal;overflow-wrap:anywhere;border:0;background:transparent}.ggb-code{font:12px ui-monospace,monospace;color:var(--dsw-alias-label-secondary)}.ggb-add{color:var(--dsw-alias-state-success-primary)}.ggb-del{color:var(--dsw-alias-state-error-primary)}
      .ggb-log{width:100%;border-collapse:collapse;table-layout:fixed}.ggb-log td{padding:7px 8px;border-bottom:1px solid var(--dsw-alias-border-l1);vertical-align:middle}.ggb-log tr{cursor:pointer}.ggb-log tr:hover,.ggb-log tr[aria-selected=true]{background:var(--dsw-alias-bg-layer-2)}.ggb-log .ggb-graphcell{padding:0;width:110px}.ggb-log svg{display:block;overflow:visible}.ggb-subject{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ggb-ref{font-size:10px;padding:1px 5px;margin-right:5px;border-radius:4px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1)}.ggb-log .ggb-hash{width:78px}.ggb-log .ggb-author{width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ggb-log .ggb-date{width:95px}
      .ggb-empty{padding:48px 20px;text-align:center}.ggb-empty h2{font-size:18px}.ggb-empty p{color:var(--dsw-alias-label-secondary);max-width:460px;margin:12px auto 20px}.ggb-empty button{margin:4px}.ggb-more{display:block;margin:16px auto!important}
      .ggb-detail{width:42%;min-width:280px;max-width:700px;overflow:auto;border-left:1px solid var(--dsw-alias-border-l1);padding:12px;background:var(--dsw-alias-bg-layer-1)}.ggb-detail h3{margin:8px 0}.ggb-detail dl{font-size:12px}.ggb-detail dt{color:var(--dsw-alias-label-secondary);margin-top:8px}.ggb-detail dd{margin:0;overflow-wrap:anywhere}.ggb-detail .ggb-file{padding:5px 0}.ggb-diff{font:12px/1.6 ui-monospace,monospace;overflow:auto;white-space:pre;tab-size:4;margin:10px 0;background:var(--dsw-alias-bg-base);padding:10px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;max-height:65vh}.ggb-diff span{display:block;min-height:1.6em}.ggb-hunk{color:var(--dsw-alias-brand-primary)}
      .ggb-modal{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:20px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 75%,transparent)}.ggb-dialog{width:500px;max-width:100%;max-height:90%;overflow:auto;padding:20px;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:0 10px 40px color-mix(in srgb,var(--dsw-alias-label-primary) 12%,transparent)}.ggb-dialog h3{margin-top:0}.ggb-dialog label{display:block;margin:12px 0}.ggb-dialog input:not([type=checkbox]),.ggb-dialog textarea{width:100%;display:block;margin-top:6px}.ggb-dialog footer{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}.ggb-dialog pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px ui-monospace,monospace}.ggb-wrap{display:flex;gap:6px;flex-wrap:wrap}.ggb-pathline{overflow-wrap:anywhere;font:12px ui-monospace,monospace}
      @media(max-width:900px){.ggb-sidebar{width:155px}.ggb-log .ggb-author,.ggb-log .ggb-date{display:none}.ggb-detail{width:55%}}@media(max-width:620px){.ggb-sidebar{display:none}.ggb-detail{position:absolute;inset:0;width:100%;max-width:none;z-index:10}.ggb-log .ggb-graphcell{width:72px}.ggb-toolbar{padding:8px}.ggb-toolbar strong{width:100%}}
    `;
    const palette = ['#58a6ff','#bc8cff','#3fb950','#f0883e','#ff7b72','#d2a8ff','#79c0ff','#e3b341']; // graph artwork only
    function workspaceForSession(snapshot, sessionId) {
      return (snapshot.items || []).find(workspace => (workspace.sessionIds || []).includes(sessionId)) || null;
    }
    function workspaceStorageKey(ws) { return typeof ws==='string'&&ws ? 'ggb-workspace-v1:'+encodeURIComponent(ws) : null; }
    function readWorkspaceState(storage, ws) {
      try {const key=workspaceStorageKey(ws);if(!key)return {repos:[],selected:''};const value=JSON.parse(storage.getItem(key)||'null');return {repos:Array.isArray(value?.repos)?[...new Set(value.repos.filter(path=>typeof path==='string'&&path.trim()))].slice(0,40):[],selected:typeof value?.selected==='string'?value.selected:''};}catch{return {repos:[],selected:''};}
    }
    function writeWorkspaceState(storage, ws, value) {
      try {const key=workspaceStorageKey(ws);if(key)storage.setItem(key,JSON.stringify(value));}catch{/* Storage is optional; discovery still works. */}
    }
    function chooseWorkspaceRepo(repos, current, remembered, preferred) { return [current,remembered,preferred,repos[0]].find(value=>value&&repos.includes(value))||''; }
    function createScopedRequest(request, scope, getOwner, getWorkspace, getRepo) {
      const aborted=()=>Object.assign(new Error('request-superseded'),{name:'AbortError'});
      return async(op,params={},signal)=>{
        const owner=getOwner();const current=()=>owner&&getOwner()===owner&&!owner.signal.aborted&&!signal?.aborted&&(!params.repo||!getRepo||getRepo()===params.repo);
        if(!current())throw aborted();
        try {const result=await request(op,{...params,...scope,scope:['repos','findrepos'].includes(op)?undefined:getWorkspace()},signal||owner.signal);if(!current())throw aborted();return result;}
        catch(error){if(!current())throw aborted();throw error;}
      };
    }
    const emptyGraph=()=>({repo:'',commits:[],branches:[],total:0,head:'',work:{staged:[],unstaged:[],untracked:[]}});
    function layoutGraph(commits) {
      let lanes = [];
      return commits.map(c => {
        let col = lanes.indexOf(c.hash);
        if(col < 0) {col = lanes.indexOf(null); if(col < 0) col = lanes.length; lanes[col] = c.hash;}
        const before = lanes.slice(); lanes[col] = null;
        (c.parents || []).forEach((p,i) => {
          if(lanes.includes(p)) return;
          if(i === 0 && lanes[col] === null) lanes[col] = p;
          else {let free = lanes.indexOf(null); if(free < 0) free = lanes.length; lanes[free] = p;}
        });
        const edges = [];
        before.forEach((hash,i) => {if(hash && i !== col) edges.push([i,i]);});
        (c.parents || []).forEach(p => edges.push([col,lanes.indexOf(p)]));
        while(lanes.length && lanes[lanes.length-1] === null) lanes.pop();
        return {col,edges};
      });
    }
    async function api(op, params={}, signal) {
      const q = new URLSearchParams({op});
      Object.entries(params).forEach(([k,v]) => {if(v == null) return; (Array.isArray(v)?v:[v]).forEach(x=>q.append(k,String(x)));});
      const post = ['gitop','addrepo','reveal'].includes(op);
      const res = await fetch('/git-graph-bilingual/api?'+q, {method:post?'POST':'GET', credentials:'same-origin',signal, ...(post?{headers:{'content-type':'application/json'},body:'{}'}:{})});
      const data = await res.json(); if(!res.ok || !data.ok) throw Object.assign(Error([data.error || String(res.status),data.detail].filter(Boolean).join(': ')),{code:data.error}); return data;
    }
    function apply(ctx) {
      const requestApi=api;
      function ScopedView(props) {
        const workspace=props.useWorkspaces(snapshot=>workspaceForSession(snapshot,props.sessionId));
        const sessionCwd=props.useSessions(snapshot=>snapshot.byId[props.sessionId]?.cwd||'');
        const path=workspace?.path||sessionCwd,workspaceId=workspace?.workspaceId||'';
        return h(View,{...props,workspacePath:path,workspaceId,key:JSON.stringify([props.sessionId,workspaceId,path])});
      }
      function View(props) {
        const [repos,setRepos]=useState([]), [repo,setRepo]=useState(''), [graphData,setGraphData]=useState(emptyGraph);
        const graphReady=!!repo&&graphData.repo===repo;
        const {commits,branches,total,head,work}=graphReady?graphData:emptyGraph();
        const [filter,setFilter]=useState(''), [query,setQuery]=useState(''), [busy,setBusy]=useState(false), [discovering,setDiscovering]=useState(false), [notice,setNotice]=useState(null);
        const [detail,setRawDetail]=useState(null), [patch,setRawPatch]=useState(null), [modal,setModal]=useState(null), [selected,setSelected]=useState(new Set()), [savedBase,setBase]=useState(null), [active,setActive]=useState(-1);
        const base=savedBase?.repo===repo?savedBase:null;
        const request = useRef(0), discoveryRequest=useRef(0), detailRequest=useRef(0), mounted=useRef(true), searchRef=useRef(null);
        const cwd=props.workspacePath, workspace=useRef(''), liveRepo=useRef(repo);liveRepo.current=repo;
        const controller=useRef(null), detailController=useRef(null), lifetime=useRef(null);
        const api=createScopedRequest(requestApi,{sid:props.sessionId,ws:cwd,workspaceId:props.workspaceId||undefined},()=>lifetime.current,()=>workspace.current||undefined,()=>liveRepo.current);
        useEffect(()=>{mounted.current=true;lifetime.current=new AbortController();return()=>{mounted.current=false;lifetime.current.abort();request.current++;discoveryRequest.current++;detailRequest.current++;controller.current?.abort();detailController.current?.abort();};},[]);
        function setDetail(value){setRawDetail(value?{...value,repo}:null);}
        function setPatch(value){setRawPatch(value?{...value,repo}:null);}
        function fail(e){if(!mounted.current||e.name==='AbortError')return;const changed=['workspace-mismatch','repo-not-in-workspace'].includes(e.code);if(changed){setRepo('');setRepos([]);setGraphData(emptyGraph());setModal(null);setDetail(null);setPatch(null);setSelected(new Set());}setNotice({error:true,text:changed?tr('workspaceChanged'):e.message});}
        function stored(ws=workspace.current){try{return readWorkspaceState(localStorage,ws);}catch{return {repos:[],selected:''};}}
        function remember(ws,value){try{writeWorkspaceState(localStorage,ws,value);}catch{}}
        function chooseRepo(value){if(!repos.includes(value))return;discoveryRequest.current++;setNotice(null);setRepo(value);remember(workspace.current,{...stored(),selected:value});}
        async function discover(scan=false,signal) {
          const generation=++discoveryRequest.current;setDiscovering(true);
          try {
            const data=await api(scan?'findrepos':'repos',{},signal);
            if(signal?.aborted || !mounted.current || generation!==discoveryRequest.current)return;
            if(workspace.current&&workspace.current!==data.ws){setRepo('');setRepos([]);setGraphData(emptyGraph());setModal(null);setDetail(null);setPatch(null);setSelected(new Set());}
            workspace.current=data.ws||'';
            const saved=stored(),list=[...new Set(data.repos||[])],manual=[];
            for(const path of saved.repos){
              try{const added=await api('addrepo',{path},signal);manual.push(added.repo);if(!list.includes(added.repo))list.push(added.repo);}
              catch(e){if(e.name==='AbortError'||['workspace-mismatch','request-rejected'].includes(e.code))throw e;}
            }
            if(signal?.aborted || !mounted.current || generation!==discoveryRequest.current)return;
            const current=chooseWorkspaceRepo(list,repo,saved.selected,data.current);
            setNotice(null);setRepos(list);setRepo(current);remember(workspace.current,{repos:manual,selected:current});
            if(current&&current===repo)await reload();
          }catch(e){if(generation===discoveryRequest.current)fail(e);}
          finally{if(mounted.current&&generation===discoveryRequest.current)setDiscovering(false);}
        }
        useEffect(()=>{const ac=new AbortController();void discover(false,ac.signal);return()=>{ac.abort();discoveryRequest.current++;};},[]);
        async function reload(append=false) {
          if(!repo||!mounted.current) return;
          controller.current?.abort(); const ac = new AbortController();controller.current=ac;const generation=++request.current;
          setBusy(true);setNotice(null);
          try {
            const [g,b,w]=await Promise.all([api('graph',{repo,limit:200,skip:append?commits.length:0},ac.signal),api('branches',{repo},ac.signal),api('workstatus',{repo},ac.signal)]);
            if(!mounted.current || generation !== request.current || liveRepo.current!==repo) return;
            setGraphData(prev=>{const prior=append&&prev.repo===repo?prev.commits:[];return {repo,commits:append?[...prior,...g.commits.filter(c=>!prior.some(x=>x.hash===c.hash))]:g.commits,total:g.total,head:g.head,branches:b.branches,work:w};});setSelected(new Set());
          }catch(e){if(generation===request.current&&liveRepo.current===repo)fail(e);}finally{if(mounted.current && generation===request.current && liveRepo.current===repo)setBusy(false);}
        }
        useEffect(()=>{setFilter('');setBase(null);setDetail(null);setPatch(null);setModal(null);setSelected(new Set());setActive(-1);if(repo)void reload();else{setGraphData(emptyGraph());setBusy(false);}return()=>{request.current++;controller.current?.abort();detailController.current?.abort();detailRequest.current++;};},[repo]);
        const btn=(key,onClick,extra={})=>h('button',{type:'button',onClick,disabled:busy||discovering||(!graphReady&&!['open','discover','refresh','close','clear','cancel'].includes(key)),...extra},tr(key));
        async function openRepo() {
          const owner=lifetime.current;
          try {const path=await ctx.uiWorkspace.pickDirectory();if(owner!==lifetime.current||owner?.signal.aborted||!mounted.current)return;if(path)await addRepo(path);} catch(e){fail(e);}
        }
        async function addRepo(path) {
          const generation=++discoveryRequest.current;
          const d=await api('addrepo',{path});
          if(!mounted.current || generation!==discoveryRequest.current)return;
          if(d.ws)workspace.current=d.ws;
          const saved=stored();remember(workspace.current,{repos:[...new Set([...saved.repos,d.repo])],selected:d.repo});setNotice(null);
          setRepos(prev=>[...new Set([...prev,d.repo])]);setRepo(d.repo);if(repo===d.repo)void reload();
        }
        async function execute(m) {
          if(!mounted.current||m.repo!==liveRepo.current||!graphReady)return;
          setBusy(true);setNotice(null);
          try{await api('gitop',{repo:m.repo,action:m.action,...m.params});setModal(null);setDetail(null);setPatch(null);await reload();if(mounted.current&&m.repo===liveRepo.current)setNotice({text:tr('success')});}
          catch(e){fail(e);}finally{if(mounted.current&&m.repo===liveRepo.current)setBusy(false);}
        }
        function op(action,params={}) {setModal({action,params,repo,kind:'confirm'});}
        function create(action,params={}){setModal({action,params,repo,kind:'form',value:'',all:false});}
        async function showCommit(c) {
          if(base && base.hash!==c.hash) {
            const gen=++detailRequest.current;setDetail({title:base.hash.slice(0,7)+' → '+c.hash.slice(0,7),loading:true});setPatch(null);
            try{const d=await api('diff',{repo,from:base.hash,to:c.hash});if(gen===detailRequest.current&&mounted.current)setDetail({title:base.hash.slice(0,7)+' → '+c.hash.slice(0,7),diff:d.diff});}catch(e){fail(e);}return;
          }
          detailController.current?.abort();const ac=new AbortController();detailController.current=ac;const gen=++detailRequest.current;
          setDetail({commit:c,loading:true});setPatch(null);
          try{const d=await api('show',{repo,hash:c.hash},ac.signal);if(gen===detailRequest.current&&mounted.current)setDetail({commit:c,...d});}catch(e){fail(e);}
        }
        async function showFile(f,group) {
          const gen=++detailRequest.current;setDetail({title:f.path,loading:true});setPatch(null);
          try{const d=await api('workfile',{repo,file:f.path,old:f.oldPath,staged:group==='staged'?'1':group==='untracked'?'untracked':'0'});if(gen===detailRequest.current&&mounted.current)setDetail({title:f.path,file:f.path,...d});}catch(e){fail(e);}
        }
        async function fileHistory(file) {
          const gen=++detailRequest.current;setPatch(null);setDetail({title:file,loading:true});
          try{const d=await api('filelog',{repo,file});if(gen===detailRequest.current&&mounted.current)setDetail({title:file,file,log:d.commits});}catch(e){fail(e);}
        }
        async function fileDiff(file,hash) {
          const gen=++detailRequest.current;setPatch({loading:true});
          try{const d=await api('filediff',{repo,file,hash});if(gen===detailRequest.current&&mounted.current)setPatch(d);}catch(e){fail(e);}
        }
        const visible = (()=>{
          let reachable=null;
          if(filter){const start=branches.find(b=>b.refname===filter)?.sha; reachable=new Set();const map=new Map(commits.map(c=>[c.hash,c]));const stack=start?[start]:[];while(stack.length){const hash=stack.pop();if(reachable.has(hash))continue;reachable.add(hash);(map.get(hash)?.parents||[]).forEach(p=>stack.push(p));}}
          const term=query.toLocaleLowerCase();return commits.filter(c=>(!reachable||reachable.has(c.hash))&&(!term||[c.subject,c.author,c.hash,c.email].some(v=>String(v||'').toLocaleLowerCase().includes(term))));
        })();
        const graph=layoutGraph(commits), graphMap=new Map(commits.map((c,i)=>[c.hash,graph[i]]));
        function keyboard(e){
          if(e.key==='Escape'){setModal(null);setDetail(null);setPatch(null);detailRequest.current++;return;}
          if((e.ctrlKey||e.metaKey)&&e.key==='f'){e.preventDefault();searchRef.current?.focus();return;}
          if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||modal)return;
          if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const next=Math.max(0,Math.min(visible.length-1,active+(e.key==='ArrowDown'?1:-1)));setActive(next);e.currentTarget.querySelector(`[data-commit-index="${next}"]`)?.scrollIntoView({block:'nearest'});}
          if(e.key==='Enter'&&visible[active])showCommit(visible[active]);
        }
        function diffView(d){
          if(!d)return null;if(d.loading)return h('p',null,tr('loading'));
          const text=d.diff??d.content??'';
          return h(React.Fragment,null,d.binary&&h('p',null,tr('binary')),d.truncated&&h('p',{className:'ggb-muted'},tr('truncated')),h('pre',{className:'ggb-diff'},text?text.split('\n').map((line,i)=>h('span',{key:i,className:line.startsWith('+')&&!line.startsWith('+++')?'ggb-add':line.startsWith('-')&&!line.startsWith('---')?'ggb-del':line.startsWith('@@')?'ggb-hunk':''},line||' ')):tr('noDiff')));
        }
        const date=s=>{try{return new Intl.DateTimeFormat('en',{year:'2-digit',month:'short',day:'2-digit'}).format(new Date(s));}catch{return s;}};
        function logRow(c,i){const g=graphMap.get(c.hash)||{col:0,edges:[]};const step=12,x=v=>8+(v%8)*step;
          return h('tr',{key:c.hash,tabIndex:0,'aria-selected':active===i,'data-commit-index':i,onClick:()=>{setActive(i);showCommit(c);},onKeyDown:e=>{if(e.key==='Enter'){e.stopPropagation();showCommit(c);}}},
            h('td',{className:'ggb-graphcell','aria-hidden':true},h('svg',{width:108,height:42,viewBox:'0 0 108 42'},g.edges.map(([a,b],j)=>h('path',{key:j,d:`M ${x(a)} 21 C ${x(a)} 32 ${x(b)} 31 ${x(b)} 42`,stroke:palette[a%palette.length],fill:'none',strokeWidth:1.5})),h('path',{d:`M ${x(g.col)} 0 L ${x(g.col)} 21`,stroke:palette[g.col%palette.length],strokeWidth:1.5}),h('circle',{cx:x(g.col),cy:21,r:4,fill:palette[g.col%palette.length]}))),
            h('td',{className:'ggb-subject',title:c.subject},branches.filter(b=>b.sha===c.hash).map(b=>h('span',{className:'ggb-ref',key:b.refname},b.name)),c.subject),
            h('td',{className:'ggb-hash ggb-code'},c.hash.slice(0,7)),h('td',{className:'ggb-author ggb-muted',title:c.author},c.author),h('td',{className:'ggb-date ggb-muted'},date(c.date)));
        }
        function groupView(key){const files=work[key]||[];return files.length>0&&h('section',{key},h('h4',null,tr(key)+' · '+files.length),files.map(f=>{
          const id=key+'\0'+f.path;return h('div',{className:'ggb-file',key:id},h('input',{type:'checkbox','aria-label':tr('selected')+': '+f.path,checked:selected.has(id),onChange:e=>setSelected(prev=>{const n=new Set(prev);e.target.checked?n.add(id):n.delete(id);return n;})}),h('span',{className:'ggb-code'},f.code||'?'),h('button',{className:'ggb-path',onClick:()=>showFile(f,key)},f.oldPath?f.oldPath+' → '+f.path:f.path),h('span',{className:'ggb-add'},f.added?`+${f.added}`:''),h('span',{className:'ggb-del'},f.deleted?`−${f.deleted}`:''),btn(key==='staged'?'unstage':'stage',()=>op(key==='staged'?'unstage':'stage',{file:f.path})),key!=='untracked'&&btn('restore',()=>op('discard',{file:f.path}),{className:'ggb-danger'}));
        }));}
        const selectedFiles=graphReady?[...new Set([...selected].map(id=>id.split('\0')[1]))]:[];
        const count=work.staged.length+work.unstaged.length+work.untracked.length;
        function detailsView(){if(!detail||detail.repo!==repo)return null;const c=detail.commit;return h('aside',{className:'ggb-detail','aria-label':tr('details')},
          btn('close',()=>{setDetail(null);setPatch(null);detailRequest.current++;}),h('h3',null,detail.title||c?.subject||tr('details')),
          detail.loading?h('p',null,tr('loading')):h(React.Fragment,null,
            c&&h(React.Fragment,null,h('dl',null,h('dt',null,'SHA'),h('dd',{className:'ggb-code'},c.hash),h('dt',null,tr('author')),h('dd',null,c.author+' <'+c.email+'>'),h('dt',null,tr('date')),h('dd',null,date(c.date)),h('dt',null,tr('parents')),h('dd',{className:'ggb-code'},(c.parents||[]).join('\n'))),h('pre',{className:'ggb-diff'},[c.subject,detail.body].filter(Boolean).join('\n\n')),h('div',{className:'ggb-wrap'},
              btn('copy',()=>navigator.clipboard.writeText(c.hash).then(()=>setNotice({text:tr('copied')})).catch(fail)),
              btn('compare',()=>{setBase({...c,repo});setNotice({text:tr('compareHelp')});}),btn('branch',()=>create('branch',{hash:c.hash})),btn('tag',()=>create('tag',{hash:c.hash})),
              btn('openRemote',async()=>{try{const d=await api('remoteinfo',{repo});if(!/^https:\/\//.test(d.web||''))throw Error(tr('noRemote'));window.open(d.web+'/commit/'+c.hash,'_blank','noopener,noreferrer');}catch(e){fail(e);}}))),
            detail.file&&btn('fileHistory',()=>fileHistory(detail.file)),
            detail.log&&h('div',null,detail.log.map(c=>h('div',{key:c.hash},h('button',{onClick:()=>showCommit(c)},c.hash.slice(0,7)+' '+c.subject)))),
            c&&h('div',null,h('h4',null,tr('files')),!(detail.files||[]).length&&h('p',null,tr('noFiles')),(detail.files||[]).map(f=>{const path=typeof f==='string'?f:f.path;return h('div',{className:'ggb-file',key:path},h('button',{className:'ggb-path',onClick:()=>fileDiff(path,c.hash)},path),btn('fileHistory',()=>fileHistory(path)));})),
            (detail.diff!==undefined||detail.content!==undefined||detail.binary)&&diffView(detail),patch?.repo===repo&&diffView(patch)));
        }
        return h('div',{className:'ggb',lang:'en',onKeyDown:keyboard,tabIndex:-1},h('style',null,css),
          h('header',{className:'ggb-toolbar'},h('strong',null,tr('title')),h('select',{className:'ggb-repo',value:repo,disabled:busy||discovering,'aria-label':tr('repo'),onChange:e=>chooseRepo(e.target.value)},!repo&&h('option',{value:''},tr('empty')),repos.map(r=>h('option',{key:r,value:r},r))),btn('open',openRepo),btn('discover',()=>void discover(true)),btn('refresh',()=>void discover(true),{disabled:busy||discovering})),
          h('div',{className:'ggb-notice ggb-muted',title:workspace.current||cwd},tr('workspace'),': ',workspace.current||cwd||'—',discovering&&h('span',{role:'status'},' · ',tr('loading'))),
          notice&&h('div',{className:'ggb-notice'+(notice.error?' ggb-error':''),role:notice.error?'alert':'status'},notice.error?tr('error')+': ':'',notice.text,notice.error&&h('div',null,tr('failureHelp'))),
          repo&&h('div',{className:'ggb-toolbar'},h('input',{ref:searchRef,type:'search',placeholder:tr('search'),'aria-label':tr('search'),value:query,onChange:e=>setQuery(e.target.value)}),btn('fetch',()=>op('fetch')),btn('pull',()=>op('pull')),btn('push',()=>op('push')),btn('stageAll',()=>op('stage-all')),btn('commit',()=>create('commit'))),
          repo&&h('div',{className:'ggb-status ggb-muted'},h('span',null,head),h('span',null,commits.length+' / '+total+' '+tr('commits')),h('span',null,count?count+' '+tr('changes'):tr('clean')),busy&&h('span',{role:'status'},tr('loading')),base&&h(React.Fragment,null,h('span',null,tr('base')+': '+base.hash.slice(0,7)),btn('clear',()=>setBase(null)))),
          !repo?h('div',{className:'ggb-empty'},h('h2',null,tr('empty')),h('p',null,tr('emptyHelp')),btn('open',openRepo),btn('discover',()=>void discover(true))):h('div',{className:'ggb-main'},
            h('aside',{className:'ggb-sidebar','aria-label':tr('branches')},h('label',null,h('input',{type:'radio',name:'ggb-branch-'+props.sessionId,checked:!filter,onChange:()=>setFilter('')}),tr('all')),['local','remote','tag'].map(kind=>h('section',{key:kind},h('h3',null,tr(kind==='tag'?'tags':kind)),branches.filter(b=>b.kind===kind).map(b=>h('div',{key:b.refname},h('label',null,h('input',{type:'radio',name:'ggb-branch-'+props.sessionId,checked:filter===b.refname,onChange:()=>setFilter(b.refname)}),h('span',{title:b.refname},(b.head?'● ':'')+b.name)),filter===b.refname&&h('div',{className:'ggb-wrap'},kind==='local'&&!b.head&&btn('checkout',()=>op('checkout',{name:b.name})),kind==='local'&&!b.head&&btn('deleteBranch',()=>op('delete-branch',{name:b.name}),{className:'ggb-danger'}),kind==='tag'&&btn('deleteTag',()=>op('tag-delete',{name:b.name}),{className:'ggb-danger'}),kind==='tag'&&btn('renameTag',()=>create('tag-rename',{name:b.name,hash:b.sha})))))))),
            h('main',{className:'ggb-content'},h('details',{className:'ggb-work',open:true},h('summary',null,tr('changes')+' · '+count),!count&&h('p',{className:'ggb-notice ggb-muted'},tr('clean')),h('div',{className:'ggb-toolbar'},btn('unstageAll',()=>op('unstage-all')),selectedFiles.length>0&&h(React.Fragment,null,h('span',null,tr('selected')+': '+selectedFiles.length),btn('stage',()=>op('stage',{file:selectedFiles})),btn('unstage',()=>op('unstage',{file:selectedFiles})),btn('restore',()=>op('discard',{file:selectedFiles}),{className:'ggb-danger'}),btn('ignore',()=>op('ignore',{file:selectedFiles})),btn('commitSelected',()=>create('commit',{file:selectedFiles})),btn('clear',()=>setSelected(new Set())))),['staged','unstaged','untracked'].map(groupView)),
              h('table',{className:'ggb-log','aria-label':tr('history')},h('tbody',null,visible.map(logRow))),!visible.length&&!busy&&h('p',{className:'ggb-empty'},tr('noCommits')),commits.length<total&&btn('loadMore',()=>reload(true),{className:'ggb-more'}),h('p',{className:'ggb-notice ggb-muted'},tr('keyboard'))),detailsView()),
          modal?.repo===repo&&h(Modal,{key:modal.action,modal,tr,busy,onCancel:()=>setModal(null),onChange:setModal,onSubmit:execute,notice,setNotice}));
      }
      function Modal({modal:m,tr,busy,onCancel,onChange,onSubmit,notice,setNotice}) {
        const ref=useRef(null),previous=useRef(null);
        useEffect(()=>{previous.current=document.activeElement;ref.current?.focus();return()=>previous.current?.focus?.();},[]);
        const field=m.action==='commit'?'message':m.action==='tag-rename'?'newName':'name';
        function submit(e){e.preventDefault();const params={...m.params};if(m.kind==='form'){params[field==='newName'?'newname':field]=m.value;if(m.action==='commit'&&m.all)params.all='1';}onSubmit({...m,params});}
        function trap(e){if(e.key==='Escape'){e.stopPropagation();if(!busy)onCancel();}if(e.key==='Tab'){const nodes=[...ref.current.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled)')];if(!nodes.length){e.preventDefault();return;}const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}
        return h('div',{className:'ggb-modal'},h('form',{className:'ggb-dialog',role:'dialog','aria-modal':true,'aria-labelledby':'ggb-dialog-title',ref,tabIndex:-1,onSubmit:submit,onKeyDown:trap},
          h('h3',{id:'ggb-dialog-title'},tr(m.action==='commit'?'commit':m.action==='branch'?'branch':m.action==='tag'?'tag':m.action==='tag-rename'?'renameTag':'confirmTitle')),
          h('p',null,tr(['discard','discard-all','checkout'].includes(m.action)?'destructive':'confirmBody')),h('p',{className:'ggb-pathline'},m.repo),h('pre',null,m.action+'\n'+Object.entries(m.params).map(([k,v])=>k+': '+(Array.isArray(v)?v.join('\n'):v)).join('\n')),
          m.kind==='form'&&h(React.Fragment,null,h('label',null,tr(field),h(m.action==='commit'?'textarea':'input',{required:true,value:m.value,rows:m.action==='commit'?4:undefined,onChange:e=>onChange({...m,value:e.target.value})})),m.action==='commit'&&!m.params.file&&h('label',null,h('input',{type:'checkbox',checked:m.all,onChange:e=>onChange({...m,all:e.target.checked})}),' '+tr('commitAll'))),
          notice?.error&&h('p',{className:'ggb-error',role:'alert'},tr('error')+': '+notice.text),h('footer',null,h('button',{type:'button',disabled:busy,onClick:onCancel},tr('cancel')),h('button',{type:'submit',disabled:busy,className:'ggb-primary'},tr(busy?'loading':'confirm')))));
      }
      ctx.slots.inject('conversation.view',()=>ctx.slots.register({name:'conversation.view',id:'git-graph-bilingual',order:20,label:en.title},ScopedView));
    }
    return {apply,inject:['slots','uiWorkspace']};
  }
});
