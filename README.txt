TronClass 教材連結助手 V5.0
安裝：解壓縮，開啟 chrome://extensions/，啟用開發人員模式，停用舊版並載入本資料夾，重新整理 TronClass。
新增：查詢附件引用按鈕，透過 upload_references 比對目前課程附件，保留 V4 功能。
不擷取預覽簽章網址；下載依教材清單中的 allow_download 設定。
附件引用 API 尚未於登入環境驗證；若查詢失敗，原教材清單仍可使用。

V6 整合版：原 V5 content.js 與 background.js 完整保留。
新增 attachment-buttons.js，動態偵測頁面已提供的官方下載連結並加入快捷按鈕；沒有官方下載連結時不新增按鈕。
另一次上傳的 content.js 未原樣載入；其未檢查授權的文件網址請求與備援下載邏輯未移植。
安裝：解壓縮後於 chrome://extensions/ 開啟開發人員模式，載入 tronclass-integrated-v6 資料夾，停用舊版並重新整理課程頁面。

V7：新增 courseware-buttons.js，支援 /course/{id}/courseware#/ 教材列表的動態按鈕，依教材清單的 Activity ID 對應 DOM，無下載授權僅顯示限制標記。實際頁面 DOM 未測試，無法配對時仍可使用原本浮動面板。
