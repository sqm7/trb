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
- [ ] 實作系統設定頁面 (`/settings`)

### [Phase 4] 驗證與優化
- [x] 功能對齊測試 (多縣市、圖表互動、數據正確性)
- [x] 功能增強（建案組成按鈕、車位互動、資料列表排序）
- [x] 進階功能增強（單價分析切換、熱力圖控制項、銷售速度維度）
- [ ] PDF 導出功能遷移
- [x] 部署測試 Next.js 版本

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
- [x] 總價帶分析 (Price Band) 優化：新增「依房型合併」功能 (Merge Bathrooms) 與展開細節
- [x] 單價分析 (Unit Price) 修復：修正最高/最低價建案資訊缺失，並優化顯示過濾後戶型

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

### [2026-01-20] Parking Analysis Enhancements (Deployed to trb)
- [x] **Features**: Search Show-All, Tooltip Locking, Conditional Hover
- [x] **Command**: `bash scripts/deploy_next_trb.sh "feat: Enhance Parking Analysis Interaction"`

### [2026-01-20] Project Search UX (Deployed to trb)
- [x] **Feature**: Continuous Multi-select (Keep Open)
- [x] **Feature**: 'Clear All' Button

### [2026-01-20] Policy Timeline & Sidebar Enhancements (Deployed to Prod)
- [x] **Policy Timeline**: Localized Project Search & Reduced Layout Height
- [x] **Sidebar**: Redesign (Remove Logo, Add Subtitle, Responsive Title Stack)
- [x] **Parking Analysis**: Fix Dropdown Z-index & Search UX (Clear All)
- [x] **Parking Analysis**: Reorder 3D Floor Stack (B1 Top, Unknown Bottom)
- [x] **Bubble Chart**: Unified Control Toolbar (Integrated into Chart Header)
- [x] **UI Polish**: New App Icon (Favicon) - Cyberpunk Style
- [x] **Landing Page**: Update Branding Text (Vibe Coding -> sqmtalk.com)
- [x] **Landing Page**: Add Contact Email (sqmtalk7@gmail.com) to Footer
- [x] **Global Layout**: Add Footer (Copyright + Contact) to Dashboard & All Pages



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
### [Current Task] Fix Data List Discrepancy
- [x] Implement independent data fetching in `DataListReport.tsx` using `api.fetchData`
- [x] Add missing columns (`交易筆棟數`) and tooltip logic for `戶型`
- [x] Verify data loading and pagination

### [Completed Task] Line Login Integration (LIFF + Edge Function)
- [x] **Step 0**: User Configuration (Line Login Channel & LIFF App)
- [x] **Step 1**: Create `line-auth` Edge Function (Verify ID Token & Custom Sign-in)
- [x] **Step 2**: Install `@line/liff` SDK & Implement Frontend Logic
- [x] **Step 3**: Verify Login Flow & Session creation (Implemented & Deployed to Test)

### [Completed Task] Sync Registration Source to Public Profiles
- [x] **Step 1**: Update `line-auth` Edge Function and Registration logic to sync (`provider`, `line_user_id`) to `public.profiles`.
- [x] **Step 2**: Create SQL migration script to ensure `profiles` table has necessary columns.

### [Completed Task] Update Settings Page UI
- [x] **Step 1**: Remove the default 'U' avatar placeholder in Settings Page.
- [x] **Step 2**: Implement "Edit Name" functionality in Member Area.
- [x] **Step 3**: Sync name updates to `public.profiles` and `auth.users`.

### [Current Task] Implement Email Binding for LINE Users
- [ ] **Step 1**: Detect temporary LINE emails in `SettingsPage`.
- [ ] **Step 2**: Create UI for "Bind Email & Password" (Upgrade Account).
- [ ] **Step 3**: Implement `supabase.auth.updateUser` logic for binding.
    - [x] Create `/app/map/page.tsx`
    - [x] Implement `LeafletMap.tsx` (using react-leaflet)
    - [x] Port functionalities: Address Search, Overpass API (Buildings), GeoJSON Upload
    - [x] Apply Cyberpunk styling
- [x] **Floor Plan Tool Migration**
    - [x] Create `/app/tools/floor-plan/page.tsx`
    - [x] Implement `FloorPlanCanvas.tsx`
    - [x] Port functionalities: Scale setting, Line/Area measurement, Snap-to-point
    - [x] **Refinement**: Ortho Mode (Shift), Enter/Right-click finish, Auto-close polygon
- [x] **Sidebar Integration**
    - [x] Add "地圖模式" and "平面圖測量" links

### [Current Task] Restore Parking Sub-table Button
- [x] Analyze legacy implementation of parking sub-table button
- [x] Add 'Parking Sub-table' button to `DataListReport.tsx`
- [x] Implement `fetchSubData` logic and display in a `Modal` component
- [x] Verify functionality (Button appearance, Modal opening, Data display)
- [x] Refine Modal UI (Hide raw Price/Area columns)

### [Current Task] Include Unknown Floors in Parking Analysis
- [x] Update `ParkingAnalysisReport.tsx` to include 'Unknown' in valid floors
- [x] Add color mapping for 'Unknown' floor
- [x] Verify chart display

### [Current Task] Documentation Refactoring (Legacy Separation)
- [x] Create `docs/legacy/` directory
- [x] Move `SPEC_NEW.md` to trash (redundant) -> moved to `SPEC_LEGACY.md`
- [x] Extract Legacy sections from `ARCHITECTURE.md` to `docs/legacy/ARCHITECTURE_LEGACY.md`
- [x] Clean up `ARCHITECTURE.md` to focus on Next.js
### [Current Task] Fix Heatmap Interaction Bug
- [x] Analyze legacy filtering logic in `charts.js`
- [x] Port `getRoomCategory` logic to new utility `src/lib/room-utils.ts`
- [x] Update `SalesVelocityReport.tsx` to use robust filtering
- [x] Verify click interaction logic

### [Current Task] Restore Heatmap Detail Aggregation
- [x] Implement data aggregation by `建案名稱` in `SalesVelocityReport.tsx`
- [x] Calculate min/max/median statistics for each project
- [x] Render aggregated summary table in modal
- [x] Render aggregated summary table in modal
- [x] Add expand/collapse functionality for details

### [Current Task] Refining UI and Integrations (2026-01-16)
- [x] Remove Legacy UI: "Data List" tab and "Advanced Analysis" sidebar item
- [x] Add Sidebar Social Links: Developer Log (Medium) and Threads
- [x] Enhance Project Search: Display County, District, and Date in suggestions
- [x] UI Refinement: Removed unused "Query Data List" button from FilterBar
- [x] UI Refinement: Fixed MultiSelect layout (Horizontal Scroll, District Context, Group Headers)
- [x] UI Refinement: Dynamic hint for county selection limit

### [Current Task] Heatmap Refinement & New Features (2026-01-17)
- [x] **Unit Correction**: Change "Floor Price Difference" unit to `萬/坪` in Heatmap
- [x] **UI Improvement**: Replcae parking circle with blue 'P' badge
- [x] **New Feature**: Floor Range Average Calculator (Weighted Average: Total Price/Area)
- [x] **New Feature**: Floor Premium Input (0.35 etc.) synced with slider
- [x] **Enhancement**: Increased Floor Premium Max Range to 10
- [x] **Bug Fix**: Fix Tooltip clipping using Portal implementation
- [x] **Data List**: Restore "交易明細列表" tab to main dashboard
- [x] **Filtering Fix**: Respect `excludeCommercial` in Heatmap
- [x] **Unit Normalization**: Port AdaptiveUnitResolver to frontend for smart unit naming

### [Current Task] Login Sidebar Integration (2026-01-18)
- [x] **Route Refactoring**
    - [x] Create `/app/dashboard/page.tsx` and migrate Dashboard content
    - [x] Update `/app/page.tsx` to implement Login UI
    - [x] Remove `/app/login/page.tsx`
- [x] **Sidebar Integration**
    - [x] Update Sidebar links (Dashboard -> `/dashboard`, Login -> `/`)
    - [x] Ensure AppLayout wraps the Login page correctly
- [x] **Auth UI Refinement**
    - [x] Remove static "Login" link from Header
    - [x] Implement dynamic Sidebar state (Login vs User Profile)
- [x] **Policy Data Update**
    - [x] Update `src/lib/data/policies.ts` with the new detailed content (2012-2025).
    - [x] Add new fields if necessary (Context, Background, Affected Audience).

- [x] **Policy Timeline Enhancements**
    - [x] Implement Zoom In/Out controls for the timeline to resolve overlapping issues.
    - [x] Add "Expand" button to the Policy Detail view to show full content (including unchanged parts).
    - [x] Populate `details` field in `policies.ts` with comprehensive regulation points.
    - [x] Support multi-project visualization in Policy Timeline (stacked tracks).

### [2026-01-18] Production Deployment & Custom Domain
- [x] Deploy Next.js to Production Repo (`kthd`) - [x] Validated with Bubble Chart v2
- [x] Implement Dynamic Base Path Configuration (`next.config.ts`)
- [x] Fix Custom Domain Support (`www.sqmtalk.com`)
    - [x] Create `deploy_next_prod.sh` (CNAME injection, empty Base Path)
    - [x] Resolve path conflicts between GitHub Pages default (`/kthd`) and Custom Domain Root (`/`)

### [2026-01-18] Sidebar & Reports UI Fixes
- [x] Implement Collapsible Sidebar
    - [x] Minimized state (Icons only, w-20)
    - [x] Expanded state (On Hover/Toggle, w-64)
    - [x] Update AppLayout padding
- [x] Create Reports Placeholder Page (`/app/reports/page.tsx`)

### [2026-01-18] Settings Member Area
- [x] Implement Member Profile Section in /settings
- [x] Display User Info (Email, ID)
- [x] Add Logout Functionality
- [x] Show Monthly Report Quota (3/month)

### [2026-01-18] Forgot Password Flow
- [x] Add Forgot Password Mode to Login UI
- [x] Implement Supabase Reset Password Logic
- [x] UI for Check Email Confirmation
- [x] Deploy to Production (`kthd`)

### [2026-01-18] Batch Data Modification (Legacy Restoration)
- [x] Create Server Actions (`searchData`, `batchUpdateData`) in `src/app/admin/uploader/actions.ts`
- [x] Implement UI in `src/app/admin/uploader/page.tsx`
    - [x] Add "Batch Data Modification" card (Section 4)
    - [x] Add Modal for search results
    - [x] Integrate with Server Actions
- [x] Implement `project_name_mappings` conditional logic (only record if `old_name` has `?`)
- [x] Verify functionality
- [x] Verify functionality
- [x] Deploy to Test Environment (`trb`)

### [2026-01-18] Batch Data Modification Improvements
- [x] Add Search Controls (County, Type, Field, Keyword) inside the Batch Update Modal
- [x] Ensure `handleSearch` works seamlessly within the modal
- [x] Verify UI layout and functionality
- [x] Implement "Click Outside to Close" for Batch Update Modal
- [x] Implement "Click Outside to Close" for Batch Update Modal
- [x] Implement "Click Outside to Close" for Batch Update Modal
- [x] Verify/Enhance "Close (X)" Button visibility
- [x] Deploy updates to Test Environment (`trb`)

### [2026-01-18] Mobile Sidebar Fix
- [x] Hide Desktop Sidebar on Mobile (`hidden lg:flex`)
- [x] Verify Mobile Menu functionality (already exists in Header)

### [2026-01-19] Report Generator (PDF Export)
- [x] Refactor: Extract `useAnalysisData` hook from DashboardPage
- [x] Refactor: Update Analysis Components (Ranking, PriceBand, etc.) to support `visibleSections` prop
- [x] UI: Create `ReportsPage` specific Selection Sidebar
- [x] Logic: Implement PDF Generation using `html2pdf.js`
- [x] Verification: Test PDF download with various selections (User Testing)
- [x] Deployment: Sync to Test Environment (`trb`)
- [x] Deployment: Sync to Production (`kthd`)
- [x] Fix: Replace html2pdf with native browser Print-to-PDF (bypass oklab color issue)

### [2026-01-19] UI Improvements
- [x] Rename sidebar "分析報告" → "生成報告"
- [x] Remove "輸出報表" button from FilterBar
- [x] Add animated "NEW" badge to sidebar when "分析報表" button is clicked
- [x] Badge auto-clears when user navigates to /reports page
- [x] Deployment: Sync to Test Environment (`trb`)

### [Current Task] Enhance Bubble Chart Display (Completed 2026-01-19)
- [x] **Step 10**: Compact Initial Spiral Layout (Reduce spread).
- [x] **Step 1**: Implement Mode Toggle (Coordinate / Natural) in `BubbleChart.tsx`.
- [x] **Step 2**: Enhance "Natural Mode" with packed/organic layout.
- [x] **Step 3**: Upgrade visuals (gradients, glassmorphism, animations).
- [x] **Step 4**: Verify toggle interaction and responsive behavior.
- [x] **Step 5**: Fix Tooltip Clipping (Implement Portal/Z-index fix).
- [x] **Step 6**: Refine Natural Layout (Organic offsets).
- [x] **Step 7**: Implement Physics/Force Layout for true "Zero Gravity" cluster.
- [x] **Step 8**: Implement Drag & Drop Interaction for bubbles.
- [x] **Step 9**: Tune Physics (Spread Init, Reduce Jitter/Spin, Smooth Dampening).
- [x] **Review**: Fixed Initial State (Overlapping Issue) with Physics Pre-warming.
- [x] **Bug Fix**: Initial Drag Issue (Fixed useEffect dependency).

### [Current Task] Implement Guest Mode
- [x] Add "Guest Login" button to Login Page
- [x] Verify redirection to Dashboard without auth

### [Current Task] Enhance Ranking Report Interaction
- [x] **Step 1**: Make Metric Cards Clickable in `RankingReport.tsx`.
- [x] **Step 2**: Implement Project Ranking Chart (Bar Chart) logic.
- [x] **Step 3**: styling Bar Chart with premium gradients.

### [Current Task] Refine Ranking Chart Visuals
- [x] **Step 1**: Fix Y-Axis Labels (Use explicit categories instead of x/y pairs).
- [x] **Step 2**: Simplify Colors (Remove distributed colors, use single premium color).

### [Current Task] Vertical, Scrollable Ranking Chart
- [x] **Step 1**: Update `RankingReport` to add "Top N" controls (10, 30, 50, All) and pass `limit` to chart.
- [x] **Step 2**: Update `RankingChart` to:
    -   Switch to Vertical Bars (`horizontal: false`).
    -   Accept `limit` prop and slice data accordingly.
    -   Implement **Horizontal Scrolling** by calculating dynamic width based on data length.



### [Current Task] Redesign Ranking List Icons & Chart Controls
- [x] UI: Update Table Header to use side-by-side (horizontal) sorting icons for better intuition.
- [x] UI: Add Chart Type Toggle (Bar / Tree) to `RankingReport` header actions to fix "jumping chart" confusion.
- [x] Logic: Ensure Chart Type state respects user choice vs auto-detection.

### [Current Task] Heatmap Logic & UI Refinement
- [x] Logic: Switch Anchor Logic to **Per-Unit Type** (independent baseline for each stack).
- [x] Logic: Correct "Floor Premium" to use **Fixed Value (萬/坪)** instead of Percentage.
- [x] Logic: Refine Anchor Selection: Earliest Date + Window + Lowest Normalized Price.
- [x] Logic: Strict Exclusion for Anchor: Exclude Employees/Offices/Shops/Rough-ins to avoid skewing baseline.
- [x] Logic: Advanced Anchor: normalized value within **Initial Window** (default 14 days).
- [x] UI: Add "Auto Suggest" 🪄 button for Floor Premium.
- [x] UI: Expose "Initial Window Days" parameter.
- [x] UI/UX: Polish Heatmap styles (neutral headers) and remove unused buttons.
- [x] Bug: Fix Heatmap missing transaction date (mapped to `交易日`).

### [Current Task] Project Search UX Enhancement
- [x] Backend: Function `query-names` supports empty query to return Top 20 popular projects.
- [x] Frontend: `MultiSelect` supports `onFocus` to trigger empty search.
- [x] Frontend: `FilterBar` enables fetching top projects when search is empty.

### [2026-01-19] Report Generator PPT Layout (16:9)
- [x] UI: Create `SlideContainer` component (16:9 aspect ratio)
- [x] UI: Refactor `ReportsPage` to render as slides
- [x] PDF: Implement native browser print with `page-break-after` for slides
- [x] Styling: Dark theme PPT style with cover page

### [2026-01-20] Parking Report Fixes & Enhancements
- [x] **Layout Fix**: Moved Parking Ratio Chart legend to below the table to prevent overlap.
- [x] **Interaction**: Added "Drill-down" loop button to 3D Parking Floor Chart.
- [x] **Feature**: Implemented Parking Detail Modal showing records per floor.
- [x] **Feature**: Added "Show All Ramp Plane" toggle for loose matching in modal.

### [Current Task] Fix Parking Display Issue (2026-01-20)
- [x] **Data Logic Fix**: Update `ParkingAnalysisReport.tsx` to use `rawRecords` from `rampPlanePriceByFloor` as the source of truth for the details modal.
- [x] **UI Logic Fix**: Disable or adjust "Show All Ramp Plane" logic when using trusted backend data to prevent confusion.

### [Current Task] Implement Parking Area Scatter Plot
- [x] Create `ParkingScatterChart` component (Recharts/Custom)
- [x] Implement Scale Analysis Mode (Count vs Area)
- [x] Implement Value Analysis Mode (Price vs Area)
- [x] Integrate into `ParkingAnalysisReport`
- [x] Integrate into `ParkingAnalysisReport`
- [x] Deploy to Test Environment (`trb`)
- [x] **Refinement**: Restore summary stats & add explanatory tooltips
- [x] **Refinement**: Optimize layout to side-by-side (Table | Chart)
- [x] **Refinement**: Add Axis descriptions & Help icon (?)
- [x] **New Feature**: Summary Table Layout Optimization (Move Up)
- [x] **New Feature**: Project Search & Highlight (Multi-select, Max 6)

### [Current Task] Enhance Parking Chart Interactions
- [x] **Search**: Show all projects on input click (remove query dependency)
- [x] **Scatter Plot**: Implement "Tooltip Locking" on click
- [x] **Scatter Plot**: Implement "Tooltip Filtering" (Yellow dots only when filtered)
- [x] **Scatter Plot**: Tooltip follows mouse cursor (Bottom-Right)


