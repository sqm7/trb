# 🏗️ ARCHITECTURE.md - 技術架構

**版本**: 3.0.0  
**最後更新**: 2026-01-15

---

## 📁 目錄結構

```
text antigravity/
├── index.html              # 主應用入口（分析儀表板）
├── login.html              # 登入頁面（目前停用）
├── map-tool.html           # 地圖工具
├── report-viewer.html      # 公開報告檢視器
├── toolA.html              # 工具 A
├── netlify.toml            # Netlify 部署配置
├── .gitignore              # Git忽略配置
├── docs/                   # 開發文檔
├── scripts/                # 自動化腳本
├── .cursorrules            # 編碼行為準則
│
├── css/
│   ├── images/
│   │   └── og-cover.png    # 社群分享預覽圖
│   └── style.css           # 全域樣式（深色主題）
│
├── js/
│   ├── app.js              # 應用入口
│   ├── supabase-client.js  # Supabase 客戶端
│   └── modules/
│       ├── api.js          # API 請求層
│       ├── config.js       # 應用配置（顏色、端點、縣市數據）
│       ├── state.js        # 中央狀態管理
│       ├── dom.js          # DOM 元素引用
│       ├── ui.js           # UI 通用邏輯
│       ├── aggregator.js   # 多縣市數據聚合器
│       ├── eventHandlers.js # 事件處理器（50+ 函式）
│       ├── pdfExport.js    # PDF 導出
│       └── renderers/      # 渲染模組
│           ├── reports.js  # 報告頁面渲染（12 個渲染函式）
│           ├── charts.js   # 圖表渲染（ApexCharts, 7 種圖表）
│           ├── tables.js   # 表格渲染
│           ├── heatmap.js  # 熱力圖渲染
│           └── uiComponents.js # UI 元件
│
├── supabase/
│   ├── config.toml         # Supabase 本地配置
│   └── functions/          # Edge Functions
│       ├── _shared/        # 共享模組
│       │   ├── analysis-engine.ts  # 分析引擎（10+ 計算函式）
│       │   ├── unit-parser.ts      # 戶別解析器（870+ 行）
│       │   ├── constants.ts        # 常數定義（縣市代碼對照）
│       │   ├── supabase-client.ts  # Supabase 客戶端
│       │   └── cors.ts             # CORS 設定
│       ├── analyze-project-ranking/  # 主分析端點
│       ├── analyze-data/     # 數據分析
│       ├── analyze-district-price/ # 區域價格分析
│       ├── query-data/       # 數據查詢端點
│       ├── query-names/      # 建案名稱查詢
│       ├── query-sub-data/   # 附表數據查詢
│       ├── generate-share-link/    # 分享連結生成
│       └── public-report/    # 公開報告
│
└── uploader/               # 數據上傳工具
    ├── index.html
    ├── update.html
    ├── create_mappings_table.sql  # 建案名稱對應表 SQL
    └── js/
        ├── main.js             # 主程式邏輯
        ├── supabase-service.js # Supabase 操作
        ├── file-handler.js     # 檔案處理（含建案名稱替換）
        ├── state.js            # 狀態管理
        └── ...
    └── ...

## 🏗️ Next.js 架構 (Migration)

### 目錄結構 (next-app/src)
```
src/
├── app/
│   ├── page.tsx               # 主儀表板頁面
│   ├── login/                 # [New] 登入頁面
│   │   └── page.tsx
│   ├── admin/                 # [New] 後台管理
│   │   └── uploader/          # 資料上傳工具
│   │       └── page.tsx
│   ├── layout.tsx             # Root layout
│   └── globals.css            # 全域樣式 (Tailwind) 全域樣式 (Aura Theme)
├── components/
│   ├── ui/                 # 基礎元件 (Button, Card, Input...)
│   ├── features/
│   │   └── FilterBar.tsx   # 篩選控制列
│   ├── charts/             # Atomic 圖表元件
│   │   ├── RankingChart.tsx
│   │   ├── PriceBandChart.tsx
│   │   ├── SalesVelocityChart.tsx
│   │   ├── AreaHeatmapChart.tsx
│   │   └── ParkingRatioChart.tsx
│   └── reports/            # 整合報告視圖
│       ├── ReportWrapper.tsx
│       ├── RankingReport.tsx
│       ├── PriceBandReport.tsx
│       ├── SalesVelocityReport.tsx
│       ├── ParkingAnalysisReport.tsx
│       ├── UnitPriceAnalysisReport.tsx
│       ├── HeatmapReport.tsx
│       └── DataListReport.tsx
├── lib/
│   ├── api.ts              # API 客戶端
│   ├── config.ts           # 設定檔
│   ├── utils.ts            # 工具函式 (cn)
│   └── store/
│       └── useFilterStore.ts # Zustand 全域狀態
```

---

## 🔄 數據流架構

```
┌─────────────────────────────────────────────────────────────────┐
│                         使用者瀏覽器                              │
├─────────────────────────────────────────────────────────────────┤
│  index.html                                                     │
│    ├── app.js (入口)                                            │
│    ├── modules/                                                 │
│    │   ├── state.js ◄──────── 中央狀態管理                     │
│    │   ├── eventHandlers.js ── 事件處理                        │
│    │   ├── api.js ─────────── API 請求                         │
│    │   ├── aggregator.js ──── 多縣市聚合                       │
│    │   └── renderers/* ────── UI 渲染                          │
│    └── config.js ───────────── 配置常數                        │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS POST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Edge Functions                      │
├─────────────────────────────────────────────────────────────────┤
│  analyze-project-ranking/index.ts                               │
│    ├── 讀取 filters 參數                                        │
│    ├── 建構 SQL 查詢（含特殊店面篩選）                           │
│    ├── 調用 _shared/unit-parser.ts (戶別解析)                   │
│    ├── 調用 _shared/analysis-engine.ts (分析計算)               │
│    ├── 注入縣市名稱至 transactionDetails                        │
│    └── 回傳 JSON 結果                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │ Postgres Query
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase PostgreSQL                          │
├─────────────────────────────────────────────────────────────────┤
│  資料表: {縣市}_lvr_land_{交易類型}                              │
│    ├── a_lvr_land_b (台北市預售)                                │
│    ├── a_lvr_land_a (台北市中古)                                │
│    ├── a_lvr_land_b_park (台北市預售車位附表)                   │
│    └── ...                                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 前端模組詳解

### state.js - 中央狀態管理

```javascript
export const state = {
    // 分頁
    currentPage: 1,
    pageSize: 30,
    totalRecords: 0,
    
    // 多縣市選擇
    selectedCounties: [],
    selectedDistricts: [],
    selectedProjects: [],
    
    // 分析數據快取
    analysisDataCache: null,  // 所有分析結果的快取
    
    // 排序設定
    currentSort: { key: 'saleAmountSum', order: 'desc' },
    
    // 報告控制
    currentAverageType: 'arithmetic',
    currentVelocityView: 'monthly',
    currentVelocityMetric: 'count',
    
    // 總價帶區域分析
    currentPriceBandDimension: 'district',  // 'district' 或 'county'
    priceBandCountyFilter: 'all',
    
    // 熱力圖狀態
    isHeatmapActive: false,
    currentLegendFilter: { type: null, value: null },
    
    // 泡泡圖設定
    bubbleSizeMetric: 'count',  // 'count' 或 'area'
    
    // 開關
    excludeCommercialInRanking: false,
};
```


### aggregator.js - 數據聚合器
| 函式 | 功能 |
|------|------|
| `aggregateAnalysisData(current, new)` | 合併多縣市分析結果 |
| `aggregateCoreMetrics(...)` | 合併核心指標 |
| `aggregatePriceBandAnalysis(...)` | 合併總價帶分析 |
| `aggregateSalesVelocityAnalysis(...)` | 合併去化分析 (含時間序列處理) |


### eventHandlers.js - 主要事件處理器

| 函式 | 功能 |
|------|------|
| `mainFetchData()` | 觸發數據查詢 (支援多縣市並行) |
| `mainAnalyzeData()` | 觸發分析計算 (含前端 Metadata 補全) |
| `handleExcludeCommercialToggle()` | 排除商辦開關 |
| `handlePriceBandRoomFilterClick()` | 總價帶房型篩選 |
| `handlePriceBandDimensionClick()` | 區域維度切換 (行政區/縣市) |
| `handlePriceBandCountyFilterChange()` | 區域表格縣市篩選 |
| `handleBubbleMetricToggle()` | 泡泡圖指標切換 |
| `handleBubbleChartRefresh()` | 泡泡圖更新 |
| `handleVelocityRoomFilterClick()` | 銷售速度房型篩選 |
| `handleParkingFloorFilterChange()` | 車位樓層篩選 |
| `handleHeatmapMetricToggle()` | 熱力圖指標切換 |
| `handleSuggestFloorPremium()` | 建議樓層價差 |
| `analyzeHeatmap()` | 觸發熱力圖分析 |
| `handleShareClick()` | 分享報告 |
| `togglePriceGridFullScreen()` | 全螢幕切換 |

### renderers/reports.js - 報告渲染

| 函式 | 對應報告 |
|------|----------|
| `renderRankingReport()` | 核心指標與排名 |
| `renderPriceBandReport()` | 總價帶分析 |
| `renderPriceBandLocationTableOnly()` | 區域房型交叉表格 (外部調用) |
| `renderPriceBandLocationTable()` | 區域房型交叉表格 |
| `renderPriceBandLocationChart()` | 區域房型長條圖 |
| `renderUnitPriceReport()` | 房屋單價分析 |
| `renderParkingAnalysisReport()` | 車位單價分析 |
| `renderSalesVelocityReport()` | 房型去化分析 |
| `renderPriceGridAnalysis()` | 垂直水平分析 |
| `renderPriceBandDetails()` | 總價帶明細 Modal |
| `calculateFloorPremiumSuggestion()` | 樓層價差建議計算 |

### renderers/charts.js - 圖表渲染

| 函式 | 圖表類型 |
|------|----------|
| `renderRankingChart()` | Treemap / Bar Chart |
| `renderPriceBandChart()` | 箱型圖 |
| `renderSalesVelocityChart()` | 堆疊長條圖 |
| `renderAreaHeatmap()` | 熱力圖 |
| `renderParkingRatioChart()` | 圓餅圖 |
| `renderUnitPriceBubbleChart()` | 單價分佈泡泡圖 (新增) |

---

## 🔧 後端模組詳解

### analysis-engine.ts - 分析引擎

| 函式 | 功能 |
|------|------|
| `getRoomCategory(record)` | 房型分類（互斥優先級） |
| `calculatePriceBandAnalysis(data)` | 總價帶分析計算 (含 `byDistrict` 區域統計) |
| `calculateUnitPriceAnalysis(data, unitIds)` | 房屋單價分析 |
| `calculateParkingAnalysis(data, parkMap, unitIds)` | 車位分析 |
| `calculateSalesVelocity(data)` | 銷售速度計算 |
| `calculatePriceGridAnalysis(data, parkMap, unitIds, premium)` | 垂直水平分析 |
| `calculateAreaDistribution(data)` | 面積分佈計算 |
| `calculateStats(transactions, unitIds)` | 統計數據計算 |
| `calculateQuantile(arr, q)` | 分位數計算 |
| `fetchAllData(query)` | 自動分頁撈取 |

### unit-parser.ts - 戶別解析器

| 類別/函式 | 功能 |
|-----------|------|
| `PatternDetector` | 模式偵測器（20+ 正規表示式） |
| `AdaptiveUnitResolver` | 自適應解析器 |
| `resolveWithContext(record)` | 單筆解析 |
| `getProjectProfile(projectName)` | 建案風格分析 |

### constants.ts - 常數定義

| 常數 | 功能 |
|------|------|
| `countyCodeToName` | 縣市代碼轉縣市名稱對照表 |

---

## 🏛️ 關鍵技術決策 (Technical Decisions)

### 1. 多縣市數據聚合策略 (2026-01-15)

**問題**：用戶需要同時分析多個縣市的數據。

**解決方案**：
- 在 `eventHandlers.js` 實作並行 API 請求
- 使用 `aggregator.js` 合併多縣市分析結果
- 對於分位數等需要原始數據的計算，在前端使用 `transactionDetails` 重新計算

### 4. 混合式數據聚合 (Hybrid Aggregation) - Next.js Price Band (2026-01-16)

**問題**：後端 API 預聚合的 `locationCrossTable` 僅包含單一維度（通常是行政區），無法即時切換至縣市層級。

**解決方案**：
- 保留後端預聚合數據用於預設顯示 (District)。
- 當用戶切換至「縣市 (County)」維度時，前端即時對 `transactionDetails` 進行聚合計算。
- 優點：無需重新發送 API 請求即可切換維度，提升互動體驗。

### 2. 區域房型交叉表格 (2026-01-15)

**問題**：用戶需要查看各行政區/縣市的房型成交筆數分佈。

**解決方案**：
- 在 `analyze-project-ranking` 後端為每筆交易注入縣市名稱
- 前端使用 `transactionDetails` 重新聚合數據
- 支援行政區/縣市維度切換
- 支援縣市篩選（只顯示特定縣市的行政區）

### 3. 單價泡泡圖 (2026-01-15)

**功能**：可視化不同單價區間的成交分佈與影響力。

**技術實作**：
- 使用 ApexCharts Bubble Chart
- 泡泡大小 = 影響力（成交件數或總坪數）
- 漸層顏色 = 單價高低
- 支援自訂單價區間和級距

---

## 🗄️ 資料庫 Schema

### 表命名規則
```
{縣市代碼}_lvr_land_{交易類型}
{縣市代碼}_lvr_land_{交易類型}_park  (車位附表)

縣市代碼: A=台北, B=台中, C=基隆, D=台南, E=高雄, F=新北...
交易類型: a=中古交易, b=預售交易
```

### 主表欄位

| 欄位 | 說明 |
|------|------|
| `編號` | 主鍵 |
| `建案名稱` | 建案識別 |
| `行政區` | 區域 |
| `交易日` | 交易日期 |
| `戶別` | 原始戶別字串 |
| `樓層` | 樓層數 |
| `建物型態` | 住宅大樓/華廈/透天等 |
| `主要用途` | 住家用/商業用等 |
| `交易總價(萬)` | 總交易金額 |
| `房屋總價(萬)` | 不含車位價格 |
| `房屋面積(坪)` | 房屋面積 |
| `房屋單價(萬)` | 計算欄位 |
| `車位總價(萬)` | 車位價格 |
| `車位數` | 車位數量 |
| `房數` | 房間數 |
| `備註` | 特殊交易備註 |

### 車位附表欄位

| 欄位 | 說明 |
|------|------|
| `編號` | 對應主表 |
| `車位樓層` | B1, B2 等 |
| `車位價格(萬)` | 單一車位價格 |
| `車位面積(坪)` | 車位面積 |

### 建案名稱對應表 (project_name_mappings)

| 欄位 | 說明 |
|------|------|
| `id` | 主鍵 |
| `old_name` | 原始名稱（含亂碼或錯字） |
| `new_name` | 修正後的名稱 |
| `city` | 縣市名稱 |
| `county_code` | 縣市代碼（可選） |
| `created_at` | 創建時間 |
| `updated_at` | 更新時間 |

---

## 🔌 API 端點

| Endpoint | 方法 | 功能 |
|----------|------|------|
| `/functions/v1/query-data` | POST | 查詢交易數據列表 |
| `/functions/v1/query-names` | POST | 查詢建案名稱建議 |
| `/functions/v1/query-sub-data` | POST | 查詢附表數據 |
| `/functions/v1/analyze-project-ranking` | POST | 完整分析報告 |
| `/functions/v1/generate-share-link` | POST | 生成分享連結 |
| `/functions/v1/public-report` | GET | 公開報告查看 |

### 請求格式範例

```javascript
// analyze-project-ranking
{
  filters: {
    countyCode: 'A',
    districts: ['信義區', '大安區'],
    type: '預售交易',
    dateStart: '2025-01-01',
    dateEnd: '2025-12-31',
    projectNames: ['建案A', '建案B'],
    buildingType: '住宅大樓',
    excludeCommercial: false,
    floorPremium: 0.3
  }
}
```

### 回應格式

```javascript
{
  coreMetrics: { totalSaleAmount, totalHouseArea, overallAveragePrice, transactionCount },
  projectRanking: [...],
  priceBandAnalysis: { details, locationCrossTable, allDistricts, allRoomTypes },
  unitPriceAnalysis: { residence, shop, office, multipliers },
  parkingAnalysis: { rampParking, mechanicalParking, ratioData },
  salesVelocityAnalysis: { monthly, weekly, roomTypes },
  priceGridAnalysis: { projects: [...], summary },
  areaDistributionAnalysis: [...],
  transactionDetails: [...] // 每筆含 '縣市' 欄位
}
```

---

## 🛠️ 技術棧

| 類別 | 技術 |
|------|------|
| 前端 | Vanilla JavaScript (ES6 Modules) |
| 樣式 | Vanilla CSS (深色主題) |
| 後端 | Supabase Edge Functions (Deno + TypeScript) |
| 資料庫 | PostgreSQL (Supabase) |
| 圖表 | ApexCharts |
| PDF | html2pdf.js |
| 部署 | GitHub Pages (Netlify 備用) |

---

## 📦 外部依賴

### 前端 CDN
- ApexCharts
- html2pdf.js
- Supabase JS Client
- **`aggregator.ts`**: 資料聚合核心邏輯 (計算中位數、平均數、去化速度等)。
- **`heatmap-utils.ts`**: 熱力圖數據生成邏輯。
- **`file-handler.ts`**: [New] 處理本地檔案系統存取 (File System Access API) 與 CSV 解析 (PapaParse)。
- **`uploader-service.ts`**: [New] 資料上傳服務，包含智慧更新檢測與 Supabase 批次寫入邏輯。
- **`uploader-config.ts`**: [New] 上傳工具專用配置 (欄位對應、縣市代碼)。
- **`api.ts`**: API 請求封裝。
- **`supabase.ts`**: Supabase Client 初始化。

### 後端 Deno
- `https://deno.land/std@0.168.0/http/server.ts`
- Supabase JS Client

---

## 🚀 部署環境

### GitHub Pages 配置

| 環境 | 倉庫 | 網址 | 部署腳本 |
|------|------|------|----------|
| **測試版** | `sqm7/trb` | https://sqm7.github.io/trb | `deploy_trb.sh` |
| **正式版** | `sqm7/kthd` | https://sqm7.github.io/kthd | `deploy_github.sh` |

### Git 遠端配置

```bash
origin → https://github.com/sqm7/kthd.git (正式版)
trb    → https://github.com/sqm7/trb.git  (測試版)
```

### 部署指令

```bash
# 部署到測試版
bash scripts/deploy_trb.sh "commit message"

# 部署到正式版  
bash scripts/deploy_github.sh "commit message"
```

> ⚠️ **注意**: `deploy_trb.sh` 和 `deploy_github.sh` 包含 GitHub Token，已加入 `.gitignore`，不會上傳到 GitHub。

### 資料庫備份

| 項目 | 說明 |
|------|------|
| **備份腳本** | `backup_supabase.sh` |
| **備份目錄** | `supabase_schema_sqm/YYYY-MM-DD/` |
| **Project Ref** | `zxbmbbfrzbtuueysicoc` |

```bash
# 執行資料庫結構備份
bash scripts/backup_supabase.sh
```

> ⚠️ **注意**: `backup_supabase.sh` 和 `supabase_schema_sqm/` 已加入 `.gitignore`，不會上傳到 GitHub。
