# 📝 PLAN.md - 執行路線圖

**版本**: 2.0.0  
**最後更新**: 2026-01-15

---

## 🎯 當前專案狀態

**🔥 進行中任務**: 框架遷移 (Vanilla JS → Next.js)

✅ **已完成核心功能 (Vanilla JS Version)**
- 銷控表分析
- 多維單價分析
- PDF 導出
- 行動版響應式
- 多縣市選擇與聚合
- 區域房型交叉表格
- 單價分佈泡泡圖

---

## 📋 執行計劃 (Next.js Migration)

### [Phase 1] 環境準備與依賴安裝
- [x] 檢查並初始化 `next-app` 結構
- [x] 安裝核心依賴 (`supabase-js`, `apexcharts`, `zustand`, `lucide-react`)
- [x] 設定 Tailwind CSS 與全域樣式變數 (Dark Mode)

### [Phase 2] 核心邏輯遷移
- [x] 遷移 `config.js` → `src/lib/config.ts`
- [x] 遷移 `api.js` → `src/lib/api.ts` (API Client)
- [x] 遷移 `aggregator.js` → `src/lib/aggregator.ts`
- [x] 建立 Global Store (`src/store/useFilterStore.ts`)

### [Phase 3] UI 元件重構
- [x] 重構篩選器元件 (`FilterBar`)
- [x] 重構圖表元件 (`Charts/*`)
- [x] 重構報告視圖 (`RankingReport`, `PriceBandReport` 等)
- [x] 實作主儀表板頁面 (`page.tsx`)

### [Phase 4] 驗證與優化
- [x] 功能對齊測試 (多縣市、圖表互動、數據正確性)
- [x] 功能增強（建案組成按鈕、車位互動、資料列表排序）
- [x] 進階功能增強（單價分析切換、熱力圖控制項、銷售速度維度）
- [ ] PDF 導出功能遷移
- [ ] 部署測試 Next.js 版本

### [Phase 5] Login & Uploader Migration
- [x] 遷移登入頁面 (`login.html` -> `/app/login`)
- [x] 遷移資料上傳工具 (`uploader/` -> `/app/admin/uploader`)
- [x] 整合 Supabase Auth 與 File System Access API


---

## 📋 已完成任務

### [2026-01-16] Next.js 報表功能修復與對齊 (Regression Fixes)
- [x] 修復總價帶分析 (Price Band)：恢復縣市/行政區切換，實作前端縣市聚合邏輯
- [x] 修復單價分析 (Unit Price)：實作加權平均計算，重建建案比較表
- [x] 修復熱力圖 (Heatmap)：增強錯誤處理，支援中英文欄位解析
- [x] 修復銷售速度 (Sales Velocity)：修正標題、面積區間解析 logic (`< 15`, `> 65`)
- [x] 修復資料列表 (Data List)：補回「戶號」欄位與詳細面積資訊
- [x] 修復總價帶分佈數據缺失問題：增強房型正規化邏輯 (Price Band Empty Data)

### [2026-01-15] 區域房型交叉表格與泡泡圖
- [x] 新增區域房型成交筆數交叉表格
- [x] 支援行政區/縣市維度切換
- [x] 支援縣市篩選功能
- [x] 與房型篩選器連動
- [x] 新增堆疊長條圖可視化
- [x] 後端注入縣市名稱至 transactionDetails
- [x] 新增單價分佈泡泡圖
- [x] 支援成交件數/房屋坪數指標切換
- [x] 支援自訂單價區間設定
- [x] 部署至測試版

### [2026-01-14] 修復多縣市分析問題
- [x] 修復多縣市中位數/Q1/Q3 顯示為 0 的問題
- [x] 在 aggregator.js 實作 transactionDetails 合併
- [x] 前端重新計算分位數
- [x] 修復後端 BOOT_ERROR 問題

### [2026-01-12] 多縣市選擇功能
- [x] 實作 Aggregator 模組
- [x] 更新 UI 支援多縣市選擇
- [x] 更新 UI 支援多縣市選擇
- [x] 並行 API 請求
- [x] 結果聚合與顯示
- [x] 資料列表報告 (`DataListReport`)
- [x] 銷售速度與房型分析 (`SalesVelocityReport`)
- [x] 熱力圖與車位分析修復 (`HeatmapReport`, `ParkingAnalysisReport`)

### [History] 建案名稱自動替換功能
- [x] 設計 Supabase table schema
- [x] 創建 `project_name_mappings` 表
- [x] 修改 uploader 保存對應關係
- [x] 修改 file-handler 套用對應

### [History] 車位分析修復
- [x] 分離計數邏輯與定價邏輯
- [x] 修復坡道平面車位統計
- [x] 前端 reports.js 修復

---

## 🔮 待辦事項 (Backlog)

### 高優先級
- [ ] 3D 車位圖表互動優化
- [ ] 行動版表格滾動優化
- [ ] PDF 導出優化（新增泡泡圖）

### 中優先級
- [ ] 使用者系統引入
- [ ] 我的最愛功能
- [ ] 報告分享權限控制

### 低優先級
- [ ] 深色/淺色主題切換
- [ ] 更多圖表類型
- [ ] 歷史數據趨勢分析
- [ ] 數據匯出 (Excel/CSV)

---

## 🚀 部署檢查清單

### 測試版部署
```bash
bash scripts/deploy_trb.sh "commit message"
```

### 正式版部署
```bash
bash scripts/deploy_github.sh "commit message"
```

### 後端部署 (Supabase Edge Function)
```bash
cd supabase
supabase functions deploy analyze-project-ranking --project-ref zxbmbbfrzbtuueysicoc
```

---

## 📝 開發備註

### 編碼風格
- 使用 ES6 Modules
- 函式命名：camelCase
- 常數命名：UPPER_SNAKE_CASE
- 檔案命名：kebab-case

### 提交訊息格式
```
feat: 新增功能
fix: 修復錯誤
docs: 文件更新
style: 格式調整
refactor: 重構
```
