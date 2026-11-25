const records = new Map();
const filter = {urls:['https://mediaelearn2.fju.edu.tw/download/file/*','https://elearn2.fju.edu.tw/api/uploads/reference/*/blob']};
function record(d){
 if(d.tabId<0)return;
 const u=new URL(d.url);
 const m=u.pathname.match(/^\/download\/file\/([a-f0-9]+)$/i);
 const r=u.pathname.match(/^\/api\/uploads\/reference\/(\d+)\/blob$/);
 if(!m&&!r)return;
 const key=m?m[1]:'ref:'+r[1];
 const map=records.get(d.tabId)||new Map(); records.set(d.tabId,map);
 const prev=map.get(key)||{key,host:u.hostname,count:0};
 const headers=Object.fromEntries((d.responseHeaders||[]).map(h=>[h.name.toLowerCase(),h.value]));
 const total=headers['content-range']?.match(/\/(\d+)$/)?.[1];
 const next={...prev,count:prev.count+1,status:d.statusCode||0,error:d.error||'',mime:headers['content-type']||prev.mime||'',size:total?Number(total):d.statusCode===200&&headers['content-length']?Number(headers['content-length']):prev.size||null,time:Date.now()};
 map.set(key,next);if(map.size>1000)map.delete(map.keys().next().value);
 chrome.tabs.sendMessage(d.tabId,{type:'tc-network-update',record:next}).catch(()=>{});
}
chrome.webRequest.onCompleted.addListener(record,filter,['responseHeaders']);
chrome.webRequest.onErrorOccurred.addListener(record,filter);
chrome.tabs.onRemoved.addListener(id=>records.delete(id));
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
 if(!sender.tab||!sender.url||!sender.url.startsWith('https://elearn2.fju.edu.tw/'))return;
 if(msg.type==='tc-network-list')reply([... (records.get(sender.tab.id)||new Map()).values()]);
 if(msg.type==='tc-network-clear'){records.delete(sender.tab.id);reply(true);}
});
