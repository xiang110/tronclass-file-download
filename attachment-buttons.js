(() => {
  'use strict';
  if (window.top !== window || location.hostname !== 'elearn2.fju.edu.tw') return;
  const marker = 'tc-v6-official-button';
  function officialLink(row) {
    return [...row.querySelectorAll('a[href][original-title="下載"]')].find(a => {
      try {
        const url = new URL(a.href);
        return url.origin === location.origin && /^\/api\/uploads\/reference\/\d+\/blob$/.test(url.pathname) && a.getClientRects().length > 0 && !a.closest('[hidden]');
      } catch { return false; }
    });
  }
  function update() {
    for (const row of document.querySelectorAll('.attachment-row')) {
      const a = officialLink(row);
      let b = row.querySelector('.' + marker);
      if (!a) { b?.remove(); continue; }
      if (b) continue;
      b = document.createElement('button');
      b.type = 'button'; b.className = marker; b.textContent = '下載附件';
      b.style.cssText = 'margin-left:8px;padding:4px 9px;border:1px solid #174e84;border-radius:5px;background:white;color:#174e84;cursor:pointer';
      b.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        officialLink(row)?.click();
      });
      (row.querySelector('.attachment-operations') || row).append(b);
    }
  }
  let timer;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(update, 250); };
  new MutationObserver(schedule).observe(document.documentElement, {childList:true,subtree:true,attributes:true,attributeFilter:['href','style','hidden','class']});
  window.addEventListener('hashchange', schedule);
  window.addEventListener('popstate', schedule);
  schedule();
})();
