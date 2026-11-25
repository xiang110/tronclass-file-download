(() => {
  'use strict';
  // 將課件清單上的注入標籤完全停用/清理，確保鼠標處不會出現按鈕
  const marker = 'tc-courseware-actions';
  function clean() {
    document.querySelectorAll('.' + marker).forEach(x => x.remove());
  }
  clean();
  new MutationObserver(clean).observe(document.documentElement, { subtree: true, childList: true });
})();
