# 檔案下載

TronClass 教材連結助手（Chrome 擴充功能）會在支援的 TronClass 課程頁面整理**平台標示可下載**的教材連結。可複製連結、個別開啟或匯出 CSV。

## 安裝

1. 下載本儲存庫的 `tronclass-links.zip` 並解壓縮。
2. 在 Chrome 開啟 `chrome://extensions/`，啟用「開發人員模式」。
3. 點選「載入未封裝項目」，選擇解壓後含有 `manifest.json` 的 `tronclass-links` 資料夾。
4. 登入 TronClass 並開啟課程頁面，點選右下角的教材連結按鈕。

## 範圍與限制

目前設定支援 `elearn2.fju.edu.tw` 與 `*.tronclass.com.tw`。這個版本使用已登入的瀏覽器工作階段，查詢課程教材 API；只列出 API 標示 `allow_download: true` 且有 `reference_id` 的附件。它不會取得無權限或被限制下載的教材，也不提供後端實體儲存位置。尚未在實際登入的課程環境完成驗證。

詳細操作與限制請見 [README.txt](README.txt)。
