# 檔案下載

TronClass 教材連結助手 V7.0.0（Chrome Manifest V3 擴充功能）。此儲存庫包含使用者提供的 `tronclass-integrated-v7-fixed.zip` 原始版本及其中的六個檔案。

## 功能

- 整理輔大 TronClass 課程教材與附件引用，顯示 Reference ID、Upload ID 和 PDF 預覽狀態。
- 在頁面已提供官方下載連結的附件列加入快捷按鈕；清除教材清單頁面舊的注入標籤。
- 面板上的「下載」按鈕會對每筆附件嘗試 `/api/uploads/reference/document/{id}/url`，失敗時開啟 reference blob 路徑。這段程式**沒有先檢查**教材的 `allow_download` 設定；是否取得檔案由伺服器的權限驗證決定。請遵守課程教材的使用規定。
- 複製連結或匯出 CSV。背景腳本記錄相關媒體請求的網域、狀態與格式，不保留 URL 的查詢參數或簽章。

## 安裝

1. 下載 [tronclass-links.zip](tronclass-links.zip) 並解壓縮。
2. 在 Chrome 開啟 `chrome://extensions/`，啟用「開發人員模式」。
3. 停用舊版，點選「載入未封裝項目」，選擇解壓後的 `tronclass-integrated-v7-fixed` 資料夾。
4. 重新整理 `elearn2.fju.edu.tw` 的課程頁面。

這份 ZIP 內的 `README.txt` 包含舊版 V6 的資料夾名稱；安裝 V7 請以本頁步驟為準。程式已通過 JavaScript 語法與 ZIP 完整性檢查，尚未在實際登入的課程環境驗證功能。
