# SPEC.md - 專案需求與邏輯

## 專案概述
本專案為「平米內參 (sqmtalk.com)」的部署版本，包含 Next.js 靜態導出的 HTML/JS/CSS 資源。
主程式庫託管於 `https://github.com/sqm7/kthd.git` (`vibe01` 目錄)。

## 部署需求
1. **正式版 (Production)**: 部署於 `https://www.sqmtalk.com/` (由 `main` 分支管理)。
2. **測試版 (Testing)**: 部署於測試環境 (由 `trb` remote 的 `main` 分支管理)。

## 當前任務需求
- 將目前的代碼狀態 (包含最新的功能更新) 部署到測試版 (TRB)。
- 確保測試版本的路徑與配置正確。
