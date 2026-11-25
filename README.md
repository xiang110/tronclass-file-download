# 檔案下載

TronClass 教材連結助手 V5.0（Chrome Manifest V3 擴充功能）。此儲存庫採用你提供的 `tronclass-links-v5.zip` 版本。

## 功能

- 整理課程教材清單，標示允許或限制下載；只有平台標示 `allow_download: true` 的附件提供下載網址。
- 比對教材活動的附件引用 API，顯示 Reference ID、Upload ID、Storage Key 等資訊。
- 偵測目前頁面的 PDF 預覽，對應教材清單與下載權限。
- 監測輔大 TronClass 與媒體服務的相關請求，顯示網域、HTTP 狀態、格式、大小與請求次數；不保留網址中的簽章或查詢參數。
- 複製允許下載的連結，或匯出教材資訊 CSV。

## 安裝

1. 下載 [tronclass-links.zip](tronclass-links.zip) 並解壓縮。
2. 在 Chrome 開啟 `chrome://extensions/`，啟用「開發人員模式」。
3. 停用舊版，點選「載入未封裝項目」，選擇解壓後含有 `manifest.json` 的 `tronclass-links-v5` 資料夾。
4. 重新整理輔大 TronClass 課程頁面，使用右下角的教材連結面板。

## 使用範圍

這版僅設定支援 `elearn2.fju.edu.tw`，Network 監測另需 `mediaelearn2.fju.edu.tw` 的網站權限。附件引用 API 尚未在登入環境驗證；若查詢失敗，原教材清單仍可使用。下載權限以教材清單的設定為準，Network 摘要不提供限制下載的簽章網址。請遵守課程教材的使用規定。

原包裝內的簡要說明見 [README.txt](README.txt)。
