# ARCHITECTURE.md - 技術架構

## 專案結構
本專案為 Next.js 的靜態導出版本。
- `_next/`: Next.js 內部靜態資源。
- `admin/`: 管理介面靜態頁面。
- `auth/`: 認證相關靜態頁面。
- `dashboard/`: 數據儀表板頁面。
- `images/`: 專案圖片資源。
- `index.html`: 首頁。
- `...`: 其他功能模組的 HTML/JS。

## 部署架構
- **Origin (vibe01)**: 本地工作目錄與正式版同步來源。
- **TRB (Test Version)**: `https://github.com/sqm7/trb.git`，作為測試/預覽環境。
- **流程**: 本地 `main` 分支推送到 `trb` 分支進行測試。
