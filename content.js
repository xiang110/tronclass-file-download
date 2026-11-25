(() => {
 if (window.top !== window || document.getElementById('tc-link-helper')) return;
 const host=document.createElement('div'); host.id='tc-link-helper'; document.documentElement.append(host);
 const root=host.attachShadow({mode:'open'});
 root.innerHTML=`<style>:host{position:fixed;right:18px;bottom:18px;z-index:2147483647;font:14px system-ui;color:#172033}button{cursor:pointer;border:1px solid #cbd5e1;border-radius:7px;padding:8px;background:white;color:#172033}button:hover{background:#e2e8f0}#toggle{background:#174e84;color:white;border:0;box-shadow:0 2px 12px #0003}#panel{width:min(440px,90vw);max-height:70vh;overflow:auto;background:#fff;border:1px solid #cbd5e1;border-radius:12px;padding:14px;box-shadow:0 8px 30px #0003;margin-bottom:8px}h3{margin:0 0 12px}input{width:100px;padding:7px;border:1px solid #cbd5e1;border-radius:6px}#status{white-space:pre-wrap;color:#475569;margin:10px 0}li{padding:10px 0;border-top:1px solid #e2e8f0;overflow-wrap:anywhere}ul{padding:0;list-style:none}a{color:#175b99}small{display:block;color:#64748b;margin:4px 0}.bar{display:flex;gap:6px;flex-wrap:wrap;align-items:center}[hidden]{display:none!important}</style><section id="panel" hidden><h3>TronClass 教材連結 V5 · API + Viewer + Network</h3><div class="bar"><label>課程 ID <input id="cid" inputmode="numeric" placeholder="396330"></label><button id="scan">取得全部教材</button><button id="close">關閉</button></div><div id="status" role="status">請開啟課程或輸入課程 ID。</div><div class="bar"><button id="copy">複製全部網址</button><button id="export">匯出 CSV</button><button id="dom">擷取頁面連結</button><button id="refs">查詢附件引用</button></div><div id="viewerstatus" role="status" style="margin:10px 0;padding:10px;background:#eff6ff;border-radius:8px"></div><div id="netstatus"></div><button id="clearNet">清除 Network 紀錄</button><ul id="list"></ul><h3>Network 請求紀錄</h3><ul id="network"></ul><small>列出全部教材資訊；僅提供允許下載的網址。Network 監測包含 iframe；不保存簽章、查詢參數或限制下載網址。</small></section><button id="toggle">📎 教材下載連結</button>`;
 const $=id=>root.getElementById(id); let files=[], busy=false, lastUrl=''; const observed=new Map();
 function update(record){observed.set(record.key,record);render();}
 chrome.runtime.onMessage.addListener(msg=>{if(msg.type==='tc-network-update')update(msg.record);});
 chrome.runtime.sendMessage({type:'tc-network-list'}).then(items=>{for(const r of items||[])observed.set(r.key,r);render();}).catch(()=>{});
 $('clearNet').onclick=async()=>{await chrome.runtime.sendMessage({type:'tc-network-clear'});observed.clear();render();};
 function netText(r){return `${r.host} · HTTP ${r.status||r.error||'未知'} · ${r.count} 次請求 · ${r.mime||'未知格式'} · ${r.size??'未知'} bytes`;}
 function renderViewer(){
 const out=$('viewerstatus');out.replaceChildren();
 const viewers=[];
 for(const frame of document.querySelectorAll('iframe')){
  let u;try{u=new URL(frame.getAttribute('src')||'',location.origin);}catch{continue;}
  if(u.origin!==location.origin)continue;
  if(frame.id!=='pdf-viewer'&&!/^\/note-bene\/pdf-viewer\/?$/.test(u.pathname))continue;
  if(frame.getClientRects().length===0||getComputedStyle(frame).visibility==='hidden')continue;
  const id=u.searchParams.get('upload_id')||'';
  viewers.push({id:/^\d+$/.test(id)?id:'',course:u.searchParams.get('course_id')||''});
 }
 const heading=document.createElement('strong');heading.textContent=viewers.length?'PDF Viewer：偵測到預覽':'PDF Viewer：尚未偵測到預覽';out.append(heading);
 for(const v of viewers){const f=files.find(f=>v.id&&String(f.id)===v.id&&(!v.course||v.course===$('cid').value.trim()));const line=document.createElement('small');line.textContent=(f?.name||'尚未比對教材')+(v.id?' · Upload ID '+v.id:'')+(f?(f.url?' · 允許下載':' · 限制下載'):'');out.append(line);if(f?.url){const a=document.createElement('a');a.href=f.url;a.target='_blank';a.rel='noopener';a.textContent='下載目前教材';out.append(a);}}
 }
 function renderNetwork(){ $('netstatus').textContent=`Network：${observed.size} 個資源（重複分段已合併）`; $('network').replaceChildren();for(const r of observed.values()){const li=document.createElement('li');const f=files.find(f=>f.key===r.key||'ref:'+f.ref===r.key);li.textContent=(f?.name||r.key)+' — '+netText(r);$('network').append(li);}}
 function summary(){return `共 ${files.length} 個附件，可下載 ${files.filter(f=>f.url).length} 個，限制下載 ${files.filter(f=>!f.url).length} 個`;}
 function infer(){const u=new URL(location.href); const m=(u.pathname+u.hash).match(/\/courses?\/(\d+)(?:\D|$)/i); return m?.[1]||u.searchParams.get('course_id')||u.searchParams.get('courseId')||'';}
 function status(s){$('status').textContent=s;}
 function render(){ $('list').replaceChildren(); for(const f of files){const li=document.createElement('li'), a=document.createElement(f.url?'a':'strong'), s=document.createElement('small'), meta=document.createElement('small'), b=document.createElement('button'); a.textContent=f.name;if(f.url){a.href=f.url;a.target='_blank';a.rel='noopener';}s.textContent=f.title+' · '+(f.url?'允許下載':'限制下載／請使用平台預覽');meta.textContent=`Reference ID: ${f.ref||'—'} | Upload ID: ${f.id||'—'} | Key: ${f.key||'—'} | 大小: ${f.size??'—'} bytes${f.referenceVerified?' | 引用已比對':''}`;li.append(a,s,meta);if(f.key&&observed.has(f.key)){const n=document.createElement('small');n.textContent='已觀察到媒體請求：'+netText(observed.get(f.key));li.append(n);}if(f.url){const u=document.createElement('small');u.textContent=f.url;b.textContent='複製網址';b.onclick=()=>copy(f.url);li.append(u,b);}$('list').append(li);} renderNetwork();renderViewer(); }
 async function copy(t){if(!t){status('沒有可複製的連結');return;}try{await navigator.clipboard.writeText(t);status('已複製');}catch{const el=document.createElement('textarea');el.value=t;root.append(el);el.select();const ok=document.execCommand('copy');el.remove();status(ok?'已複製':'複製失敗，請手動選取網址');}}
 async function scan(){if(busy)return;const id=$('cid').value.trim();if(!/^\d+$/.test(id)){status('請輸入正確的課程 ID');return;}busy=true;$('scan').disabled=true;files=[];render();const seen=new Set();try{for(let page=1;page<=500;page++){status(`正在讀取第 ${page} 頁…`);const p=new URLSearchParams({conditions:JSON.stringify({category:null,itemsSortBy:{predicate:'chapter',reverse:false},ignore_activity_types:['lesson']}),page:String(page),page_size:'20'});const r=await fetch(`/api/course/${id}/coursewares?${p}`,{credentials:'same-origin'});if(!r.ok)throw Error(`HTTP ${r.status}`);const d=await r.json();if(!Array.isArray(d.activities))throw Error('回傳格式不符，請確認已登入');for(const activity of d.activities){for(const f of activity.uploads||[]){if(f.deleted)continue;const k=String(f.reference_id||f.id||'')+'@'+activity.id;if(seen.has(k))continue;seen.add(k);files.push({activityId:activity.id,title:activity.title||'',name:f.name||String(f.reference_id||f.id),ref:f.reference_id,id:f.id,key:f.key,size:f.size,published:activity.data?.publish_time||'',url:f.allow_download===true&&f.reference_id?new URL(`/api/uploads/reference/${encodeURIComponent(f.reference_id)}/blob`,location.origin).href:''});}}render();if(!d.activities.length||page>=Number(d.pages||Infinity)||Number(d.end)>=Number(d.total)||(!d.pages&&d.activities.length<20)){status(summary());return;}if(page===500)throw Error('已達安全分頁上限');}}catch(e){status(`讀取中止：${e.message}。已取得 ${files.length} 個附件。`);}finally{busy=false;$('scan').disabled=false;}}

 // Query only activities in the current course catalogue; retain catalogue permissions.
 $('refs').onclick=async()=>{
  if(busy)return;
  const ids=[...new Set(files.map(f=>String(f.activityId||'')).filter(x=>/^\d+$/.test(x)))];
  if(!ids.length){status('請先取得全部教材');return;}
  busy=true;$('refs').disabled=true;$('scan').disabled=true;
  let ok=0,failed=0,matched=0;
  try{for(const id of ids){
   try{const r=await fetch(`/api/activities/${id}/upload_references`,{credentials:'same-origin'});
   if(!r.ok)throw Error(`HTTP ${r.status}`);
   const d=await r.json();if(!Array.isArray(d.references))throw Error('格式不符');
   for(const ref of d.references){const f=files.find(x=>String(x.activityId)===id&&String(x.ref)===String(ref.id));if(f){f.referenceVerified=true;matched++;}}
   ok++;}catch(e){failed++;}
   status(`附件引用查詢：${ok+failed}/${ids.length}`);
  }render();status(`附件引用查詢完成：成功 ${ok}、失敗 ${failed} 個活動；比對 ${matched} 筆。下載權限維持原設定。`);
  }finally{busy=false;$('refs').disabled=false;$('scan').disabled=false;}
 };
 $('scan').onclick=scan;$('close').onclick=()=>$('panel').hidden=true;$('toggle').onclick=()=>{const p=$('panel');p.hidden=!p.hidden;if(!p.hidden&&infer()&&!files.length){$('cid').value=infer();scan();}};
 $('copy').onclick=()=>copy(files.filter(f=>f.url).map(f=>f.url).join('\n'));
 $('export').onclick=()=>{if(!files.length){status('沒有可匯出的連結');return;}const q=v=>'"'+String(v).replace(/^[=+\-@\t\r]/,"'$&").replaceAll('"','""')+'"';const csv='\ufeff'+[['教材','檔名','下載權限','Reference ID','Upload ID','Storage Key','大小 bytes','發布時間','下載網址','已觀察媒體網域'],...files.map(f=>[f.title,f.name,f.url?'允許':'限制',f.ref??'',f.id??'',f.key??'',f.size??'',f.published??'',f.url,observed.has(f.key)?netText(observed.get(f.key)):''])].map(r=>r.map(q).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='tronclass-links.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);};
 $('dom').onclick=()=>{if(busy)return;const seen=new Set(files.map(f=>f.url));for(const a of document.querySelectorAll('a[href*="/api/uploads/reference/"]')){if(a.getAttribute('original-title')!=='下載'||a.getClientRects().length===0||files.some(f=>f.ref&&String(f.ref)===new URL(a.href).pathname.split('/')[4]&&!f.url))continue;if(!/^\/api\/uploads\/reference\/\d+\/blob$/.test(new URL(a.href).pathname)||new URL(a.href).origin!==location.origin||seen.has(a.href))continue;seen.add(a.href);files.push({title:'頁面附件',name:a.closest('.attachment-row')?.querySelector('.file-name')?.getAttribute('original-title')||a.href,url:a.href});}render();status(`目前共 ${files.length} 個連結`);};
 function route(){if(lastUrl===location.href)return; if(busy)return;lastUrl=location.href;const id=infer();$('cid').value=id;files=[];render();if(id){$('panel').hidden=false;scan();}else{status('請開啟課程或輸入課程 ID。');}}
 route();renderViewer();setInterval(()=>{route();if(!$('panel').hidden)renderViewer();},1000);
})();
