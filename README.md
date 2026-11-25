# 檔案下載

TronClass 教材連結助手（Chrome 擴充功能）會在支援的 TronClass 課程頁面整理**平台標示可下載**的教材連結。可複製連結、個別開啟或匯出 CSV。1.1.0 版也加入「開啟目前預覽的 PDF」按鈕。

## 安裝

1. 下載本儲存庫的 `tronclass-links.zip` 並解壓縮。
2. 在 Chrome 開啟 `chrome://extensions/`，啟用「開發人員模式」。
3. 點選「載入未封裝項目」，選擇解壓後含有 `manifest.json` 的 `tronclass-links` 資料夾。
4. 登入 TronClass 並開啟課程頁面，點選右下角的教材連結按鈕。
5. 若要開啟正在預覽的 PDF，先在頁面上打開該教材的預覽，再按面板中的「開啟目前預覽的 PDF」。伺服器可能允許在新分頁檢視或觸發下載。

## 範圍與限制

目前設定支援 `elearn2.fju.edu.tw` 與 `*.tronclass.com.tw`。教材清單使用已登入的瀏覽器工作階段，查詢課程教材 API；只列出 API 標示 `allow_download: true` 且有 `reference_id` 的附件。預覽按鈕只從目前頁面上的 PDF 檢視器讀取已提供的媒體網址並立即開啟；不會批次搜尋、保存或匯出帶有時效簽章的預覽網址。能否下載由伺服器與瀏覽器決定，請遵守課程教材的使用規定。尚未在實際登入的課程環境完成驗證。

預覽功能參考使用者提供的舊版 TronClass-PDF-Downloader 1.1 的操作方式，已改寫為 Manifest V3，沒有沿用其圖示或背景腳本。

詳細操作與限制請見 [README.txt](README.txt)。
