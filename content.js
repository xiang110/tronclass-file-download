(() => {
 if (window.top !== window || document.getElementById('tc-link-helper')) return;
 const host=document.createElement('div'); host.id='tc-link-helper'; document.documentElement.append(host);
 const root=host.attachShadow({mode:'open'});
 root.innerHTML=`<style>:host{position:fixed;right:18px;bottom:18px;z-index:2147483647;font:14px system-ui;color:#172033}button{cursor:pointer;border:1px solid #cbd5e1;border-radius:7px;padding:8px;background:white;color:#172033}button:hover{background:#e2e8f0}#toggle{background:#174e84;color:white;border:0;box-shadow:0 2px 12px #0003}#panel{width:min(440px,90vw);max-height:70vh;overflow:auto;background:#fff;border:1px solid #cbd5e1;border-radius:12px;padding:14px;box-shadow:0 8px 30px #0003;margin-bottom:8px}h3{margin:0 0 12px}input{width:100px;padding:7px;border:1px solid #cbd5e1;border-radius:6px}#status{white-space:pre-wrap;color:#475569;margin:10px 0}li{padding:10px 0;border-top:1px solid #e2e8f0;overflow-wrap:anywhere}ul{padding:0;list-style:none}a{color:#175b99}small{display:block;color:#64748b;margin:4px 0}.bar{display:flex;gap:6px;flex-wrap:wrap;align-items:center}[hidden]{display:none!important}</style><section id="panel" hidden><h3>TronClass 教材連結</h3><div class="bar"><label>課程 ID <input id="cid" inputmode="numeric" placeholder="396330"></label><button id="scan">取得全部教材</button><button id="close">關閉</button></div><div id="status" role="status">請開啟課程或輸入課程 ID。</div><div class="bar"><button id="copy">複製全部網址</button><button id="export">匯出 CSV</button><button id="dom">擷取頁面連結</button><button id="preview">開啟目前預覽的 PDF</button></div><ul id="list"></ul><small>教材清單只列出平台標示可下載的附件。預覽按鈕僅開啟目前頁面已提供的 PDF 網址，不保存或匯出預覽網址；網址可能過期。</small></section><button id="toggle">📎 教材下載連結</button>`;
 const $=id=>root.getElementById(id); let files=[], busy=false, lastUrl='';
 function infer(){const u=new URL(location.href); const m=(u.pathname+u.hash).match(/\/courses?\/(\d+)(?:\D|$)/i); return m?.[1]||u.searchParams.get('course_id')||u.searchParams.get('courseId')||'';}
 function previewPdf(){
  const viewers=[location.href,...Array.from(document.querySelectorAll('iframe[src]'),f=>f.src)];
  for(const candidate of viewers){
   try{
    const viewer=new URL(candidate,location.href);
    if(viewer.origin!==location.origin||viewer.pathname!=='/note-bene/pdf-viewer')continue;
    const file=viewer.searchParams.get('file');
    if(!file)continue;
    const pdf=new URL(file);
    const mediaHost=pdf.hostname==='mediaelearn2.fju.edu.tw'||pdf.hostname.endsWith('.tronclass.com.tw');
    if(pdf.protocol==='https:'&&mediaHost&&/^\/download\/file\/[a-f\d]+$/i.test(pdf.pathname))return pdf.href;
   }catch{ /* Ignore an unrelated or malformed iframe URL. */ }
  }
  return null;
 }
 function status(s){$('status').textContent=s;}
 function render(){ $('list').replaceChildren(); for(const f of files){const li=document.createElement('li'), a=document.createElement('a'), s=document.createElement('small'), b=document.createElement('button'); a.textContent=f.name;a.href=f.url;a.target='_blank';a.rel='noopener';s.textContent=f.title+' · '+f.url;b.textContent='複製網址';b.onclick=()=>copy(f.url);li.append(a,s,b);$('list').append(li);} }
 async function copy(t){if(!t){status('沒有可複製的連結');return;}try{await navigator.clipboard.writeText(t);status('已複製');}catch{const el=document.createElement('textarea');el.value=t;root.append(el);el.select();const ok=document.execCommand('copy');el.remove();status(ok?'已複製':'複製失敗，請手動選取網址');}}
 async function scan(){if(busy)return;const id=$('cid').value.trim();if(!/^\d+$/.test(id)){status('請輸入正確的課程 ID');return;}busy=true;$('scan').disabled=true;files=[];render();const seen=new Set();try{for(let page=1;page<=500;page++){status(`正在讀取第 ${page} 頁…`);const p=new URLSearchParams({conditions:JSON.stringify({category:null,itemsSortBy:{predicate:'chapter',reverse:false},ignore_activity_types:['lesson']}),page:String(page),page_size:'20'});const r=await fetch(`/api/course/${id}/coursewares?${p}`,{credentials:'same-origin'});if(!r.ok)throw Error(`HTTP ${r.status}`);const d=await r.json();if(!Array.isArray(d.activities))throw Error('回傳格式不符，請確認已登入');for(const activity of d.activities){for(const f of activity.uploads||[]){if(f.allow_download!==true||f.deleted||!f.reference_id||seen.has(f.reference_id))continue;seen.add(f.reference_id);files.push({title:activity.title||'',name:f.name||String(f.reference_id),url:new URL(`/api/uploads/reference/${encodeURIComponent(f.reference_id)}/blob`,location.origin).href});}}render();if(!d.activities.length||page>=Number(d.pages||Infinity)||Number(d.end)>=Number(d.total)||(!d.pages&&d.activities.length<20)){status(`找到 ${files.length} 個可下載附件`);return;}if(page===500)throw Error('已達安全分頁上限');}}catch(e){status(`讀取中止：${e.message}。已取得 ${files.length} 個附件。`);}finally{busy=false;$('scan').disabled=false;}}
 $('scan').onclick=scan;$('close').onclick=()=>$('panel').hidden=true;$('toggle').onclick=()=>{const p=$('panel');p.hidden=!p.hidden;if(!p.hidden&&infer()&&!files.length){$('cid').value=infer();scan();}};
 $('copy').onclick=()=>copy(files.map(f=>f.url).join('\n'));
 $('export').onclick=()=>{if(!files.length){status('沒有可匯出的連結');return;}const q=v=>'"'+String(v).replace(/^[=+\-@\t\r]/,"'$&").replaceAll('"','""')+'"';const csv='\ufeff'+[['教材','檔名','下載網址'],...files.map(f=>[f.title,f.name,f.url])].map(r=>r.map(q).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='tronclass-links.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);};
 $('dom').onclick=()=>{if(busy)return;const seen=new Set(files.map(f=>f.url));for(const a of document.querySelectorAll('a[href*="/api/uploads/reference/"]')){if(!/^\/api\/uploads\/reference\/\d+\/blob$/.test(new URL(a.href).pathname)||new URL(a.href).origin!==location.origin||seen.has(a.href))continue;seen.add(a.href);files.push({title:'頁面附件',name:a.closest('.attachment-row')?.querySelector('.file-name')?.getAttribute('original-title')||a.href,url:a.href});}render();status(`目前共 ${files.length} 個連結`);};
 $('preview').onclick=()=>{const url=previewPdf();if(!url){status('請先在目前頁面開啟 PDF 預覽。');return;}const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';root.append(link);link.click();link.remove();status('已開啟目前預覽的 PDF；是否下載由伺服器與瀏覽器決定。');};
 function route(){if(lastUrl===location.href)return; if(busy)return;lastUrl=location.href;const id=infer();$('cid').value=id;files=[];render();if(id){$('panel').hidden=false;scan();}else{status('請開啟課程或輸入課程 ID。');}}
 route();setInterval(route,1000);
})();
