(() => {
  if (window.top !== window || document.getElementById('tc-link-helper')) return;
  const host = document.createElement('div');
  host.id = 'tc-link-helper';
  document.documentElement.append(host);
  const root = host.attachShadow({ mode: 'open' });

  root.innerHTML = `
<style>
:host { position: fixed; right: 18px; bottom: 18px; z-index: 2147483647; font: 14px system-ui; color: #172033; }
button { cursor: pointer; border: 1px solid #cbd5e1; border-radius: 7px; padding: 6px 10px; background: white; color: #172033; }
button:hover { background: #e2e8f0; }
#toggle { background: #174e84; color: white; border: 0; box-shadow: 0 2px 12px #0003; padding: 9px 14px; border-radius: 8px; font-weight: 500; }
#panel { width: min(450px, 92vw); max-height: 75vh; overflow: auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; box-shadow: 0 8px 30px #0003; margin-bottom: 8px; }
h3 { margin: 0 0 12px; font-size: 16px; }
input { width: 100px; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
#status { white-space: pre-wrap; color: #475569; margin: 10px 0; font-size: 13px; }
li { padding: 10px 0; border-top: 1px solid #e2e8f0; overflow-wrap: anywhere; }
ul { padding: 0; list-style: none; margin: 8px 0; }
a { color: #175b99; text-decoration: none; font-weight: 600; }
a:hover { text-decoration: underline; }
small { display: block; color: #64748b; margin: 4px 0; font-size: 12px; }
.bar { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.download-action-btn { background: #174e84; color: white; border: none; padding: 3px 8px; border-radius: 4px; font-size: 12px; margin-left: 6px; }
.download-action-btn:hover { background: #123e6b; }
.download-action-btn:disabled { background: #94a3b8; cursor: not-allowed; }
[hidden] { display: none !important; }
</style>
<section id="panel" hidden>
  <h3>TronClass 教材連結助手</h3>
  <div class="bar">
    <label>課程 ID <input id="cid" inputmode="numeric" placeholder="396276"></label>
    <button id="scan">取得全部教材</button>
    <button id="close">關閉</button>
  </div>
  <div id="status" role="status">請開啟課程或輸入課程 ID。</div>
  <div class="bar">
    <button id="copy">複製全部網址</button>
    <button id="export">匯出 CSV</button>
    <button id="dom">擷取頁面連結</button>
    <button id="refs">查詢附件引用</button>
  </div>
  <div id="viewerstatus" role="status" style="margin: 10px 0; padding: 10px; background: #eff6ff; border-radius: 8px;"></div>
  <ul id="list"></ul>
  <small style="color:#94a3b8">支援直接調用 /api/uploads/reference/document/{id}/url 取得授權直鏈進行下載。</small>
</section>
<button id="toggle">📎 教材下載連結</button>
`;

  const $ = id => root.getElementById(id);
  let files = [], busy = false, lastUrl = '';

  function renderViewer() {
    const out = $('viewerstatus');
    out.replaceChildren();
    const viewers = [];
    for (const frame of document.querySelectorAll('iframe')) {
      let u;
      try { u = new URL(frame.getAttribute('src') || '', location.origin); } catch { continue; }
      if (u.origin !== location.origin) continue;
      if (frame.id !== 'pdf-viewer' && !/^\/note-bene\/pdf-viewer\/?$/.test(u.pathname)) continue;
      if (frame.getClientRects().length === 0 || getComputedStyle(frame).visibility === 'hidden') continue;
      const id = u.searchParams.get('upload_id') || '';
      viewers.push({ id: /^\d+$/.test(id) ? id : '', course: u.searchParams.get('course_id') || '' });
    }
    const heading = document.createElement('strong');
    heading.textContent = viewers.length ? 'PDF Viewer：偵測到預覽' : 'PDF Viewer：尚未偵測到預覽';
    out.append(heading);

    for (const v of viewers) {
      const f = files.find(f => v.id && String(f.id) === v.id && (!v.course || v.course === $('cid').value.trim()));
      const line = document.createElement('small');
      line.textContent = (f?.name || '尚未比對教材') + (v.id ? ' · Upload ID ' + v.id : '');
      out.append(line);

      if (f) {
        const btn = document.createElement('button');
        btn.className = 'download-action-btn';
        btn.textContent = '下載目前教材';
        btn.onclick = () => downloadFile(f, btn);
        out.append(btn);
      }
    }
  }

  function summary() {
    return `共 ${files.length} 個附件`;
  }

  function infer() {
    const u = new URL(location.href);
    const m = (u.pathname + u.hash).match(/\/courses?\/(\d+)(?:\D|$)/i);
    return m?.[1] || u.searchParams.get('course_id') || u.searchParams.get('courseId') || '';
  }

  function status(s) { $('status').textContent = s; }

  // 核心下載函式（支援呼叫 url API）
  async function downloadFile(f, btn) {
    const refId = f.ref || f.id;
    if (!refId) {
      alert('無可用的 Reference ID');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = '取得連結中...';
    }

    try {
      // 1. 優先嘗試你的原版 URL 授權取得 API
      const res = await fetch(`/api/uploads/reference/document/${refId}/url`, { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.url) {
          window.open(data.url, '_blank', 'noopener');
          if (btn) {
            btn.disabled = false;
            btn.textContent = '下載';
          }
          return;
        }
      }
    } catch (e) {
      console.warn('API 取得下載網址失敗，嘗試 blob 備援:', e);
    }

    // 2. 備援直開 blob
    window.open(`/api/uploads/reference/${refId}/blob`, '_blank', 'noopener');
    if (btn) {
      btn.disabled = false;
      btn.textContent = '下載';
    }
  }

  function render() {
    $('list').replaceChildren();
    for (const f of files) {
      const li = document.createElement('li');
      const titleSpan = document.createElement('strong');
      titleSpan.textContent = f.name;

      const sub = document.createElement('small');
      sub.textContent = f.title;

      // 替換反白處為醒目的「下載」按鈕
      const meta = document.createElement('small');
      meta.style.display = 'flex';
      meta.style.alignItems = 'center';
      meta.style.gap = '8px';
      meta.style.flexWrap = 'wrap';
      meta.style.marginTop = '6px';

      const infoText = document.createElement('span');
      infoText.textContent = `Reference ID: ${f.ref || '—'} | Upload ID: ${f.id || '—'} | 大小: ${f.size ?? '—'} bytes${f.referenceVerified ? ' | 引用已比對' : ''}`;
      meta.append(infoText);

      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'download-action-btn';
      downloadBtn.textContent = '下載';
      downloadBtn.onclick = () => downloadFile(f, downloadBtn);
      meta.append(downloadBtn);

      li.append(titleSpan, sub, meta);

      if (f.url) {
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '複製網址';
        copyBtn.style.marginLeft = '6px';
        copyBtn.style.padding = '2px 6px';
        copyBtn.style.fontSize = '11px';
        copyBtn.onclick = () => copy(f.url);
        meta.append(copyBtn);
      }

      $('list').append(li);
    }
    renderViewer();
  }

  async function copy(t) {
    if (!t) { status('沒有可複製的連結'); return; }
    try {
      await navigator.clipboard.writeText(t);
      status('已複製');
    } catch {
      const el = document.createElement('textarea');
      el.value = t;
      root.append(el);
      el.select();
      const ok = document.execCommand('copy');
      el.remove();
      status(ok ? '已複製' : '複製失敗，請手動選取網址');
    }
  }

  async function scan() {
    if (busy) return;
    const id = $('cid').value.trim();
    if (!/^\d+$/.test(id)) {
      status('請輸入正確的課程 ID');
      return;
    }
    busy = true;
    $('scan').disabled = true;
    files = [];
    render();
    const seen = new Set();
    try {
      for (let page = 1; page <= 500; page++) {
        status(`正在讀取第 ${page} 頁…`);
        const p = new URLSearchParams({
          conditions: JSON.stringify({ category: null, itemsSortBy: { predicate: 'chapter', reverse: false }, ignore_activity_types: ['lesson'] }),
          page: String(page),
          page_size: '20'
        });
        const r = await fetch(`/api/course/${id}/coursewares?${p}`, { credentials: 'same-origin' });
        if (!r.ok) throw Error(`HTTP ${r.status}`);
        const d = await r.json();
        if (!Array.isArray(d.activities)) throw Error('回傳格式不符，請確認已登入');

        for (const activity of d.activities) {
          for (const f of activity.uploads || []) {
            if (f.deleted) continue;
            const k = String(f.reference_id || f.id || '') + '@' + activity.id;
            if (seen.has(k)) continue;
            seen.add(k);
            files.push({
              activityId: activity.id,
              title: activity.title || '',
              name: f.name || String(f.reference_id || f.id),
              ref: f.reference_id,
              id: f.id,
              key: f.key,
              size: f.size,
              published: activity.data?.publish_time || '',
              url: f.reference_id ? new URL(`/api/uploads/reference/${encodeURIComponent(f.reference_id)}/blob`, location.origin).href : ''
            });
          }
        }
        render();
        if (!d.activities.length || page >= Number(d.pages || Infinity) || Number(d.end) >= Number(d.total) || (!d.pages && d.activities.length < 20)) {
          status(summary());
          return;
        }
        if (page === 500) throw Error('已達安全分頁上限');
      }
    } catch (e) {
      status(`讀取中止：${e.message}。已取得 ${files.length} 個附件。`);
    } finally {
      busy = false;
      $('scan').disabled = false;
    }
  }

  $('refs').onclick = async () => {
    if (busy) return;
    const ids = [...new Set(files.map(f => String(f.activityId || '')).filter(x => /^\d+$/.test(x)))];
    if (!ids.length) { status('請先取得全部教材'); return; }
    busy = true;
    $('refs').disabled = true;
    $('scan').disabled = true;
    let ok = 0, failed = 0, matched = 0;
    try {
      for (const id of ids) {
        try {
          const r = await fetch(`/api/activities/${id}/upload_references`, { credentials: 'same-origin' });
          if (!r.ok) throw Error(`HTTP ${r.status}`);
          const d = await r.json();
          if (!Array.isArray(d.references)) throw Error('格式不符');
          for (const ref of d.references) {
            const f = files.find(x => String(x.activityId) === id && String(x.ref) === String(ref.id));
            if (f) { f.referenceVerified = true; matched++; }
          }
          ok++;
        } catch (e) { failed++; }
        status(`附件引用查詢：${ok + failed}/${ids.length}`);
      }
      render();
      status(`附件引用查詢完成：成功 ${ok}、失敗 ${failed} 個活動；比對 ${matched} 筆。`);
    } finally {
      busy = false;
      $('refs').disabled = false;
      $('scan').disabled = false;
    }
  };

  $('scan').onclick = scan;
  $('close').onclick = () => $('panel').hidden = true;
  $('toggle').onclick = () => {
    const p = $('panel');
    p.hidden = !p.hidden;
    if (!p.hidden && infer() && !files.length) {
      $('cid').value = infer();
      scan();
    }
  };
  $('copy').onclick = () => copy(files.filter(f => f.url).map(f => f.url).join('\n'));
  $('export').onclick = () => {
    if (!files.length) { status('沒有可匯出的連結'); return; }
    const q = v => '"' + String(v).replace(/^[=+\-@\t\r]/, "'$&").replaceAll('"', '""') + '"';
    const csv = '\ufeff' + [['教材', '檔名', 'Reference ID', 'Upload ID', '大小 bytes', '下載網址'], ...files.map(f => [f.title, f.name, f.ref ?? '', f.id ?? '', f.size ?? '', f.url])].map(r => r.map(q).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tronclass-links.csv';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  $('dom').onclick = () => {
    if (busy) return;
    const seen = new Set(files.map(f => f.url));
    for (const a of document.querySelectorAll('a[href*="/api/uploads/reference/"]')) {
      if (a.getAttribute('original-title') !== '下載' || a.getClientRects().length === 0) continue;
      if (!/^\/api\/uploads\/reference\/\d+\/blob$/.test(new URL(a.href).pathname) || new URL(a.href).origin !== location.origin || seen.has(a.href)) continue;
      seen.add(a.href);
      files.push({ title: '頁面附件', name: a.closest('.attachment-row')?.querySelector('.file-name')?.getAttribute('original-title') || a.href, url: a.href });
    }
    render();
    status(`目前共 ${files.length} 個連結`);
  };

  function route() {
    if (lastUrl === location.href) return;
    if (busy) return;
    lastUrl = location.href;
    const id = infer();
    $('cid').value = id;
    files = [];
    render();
    if (id) {
      $('panel').hidden = false;
      scan();
    } else {
      status('請開啟課程或輸入課程 ID。');
    }
  }

  route();
  renderViewer();
  setInterval(() => {
    route();
    if (!$('panel').hidden) renderViewer();
  }, 1000);
})();
