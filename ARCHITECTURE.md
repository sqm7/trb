# 🏗️ ARCHITECTURE.md - 技術架構

**版本**: 2.0.0  
**最後更新**: 2026-01-08

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
├── SPEC.md                 # 需求真理源
├── PLAN.md                 # 執行路線圖
├── ARCHITECTURE.md         # 技術架構（本文件）
├── DEPLOYMENT.md           # 部署流程與 CI/CD
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
│       ├── eventHandlers.js # 事件處理器（40+ 函式）
│       ├── pdfExport.js    # PDF 導出
│       └── renderers/      # 渲染模組
│           ├── reports.js  # 報告頁面渲染（6 種報告）
│           ├── charts.js   # 圖表渲染（ApexCharts）
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
│       │   ├── supabase-client.ts  # Supabase 客戶端
│       │   └── cors.ts             # CORS 設定
│       ├── analyze-project-ranking/  # 主分析端點
│       ├── query-data/     # 數據查詢端點
│       ├── query-names/    # 建案名稱查詢
│       ├── query-sub-data/ # 附表數據查詢
│       ├── analyze-data/   # 數據分析
│       ├── analyze-district-price/ # 區域價格分析
│       ├── generate-share-link/    # 分享連結生成
│       └── public-report/  # 公開報告
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
    
    // 篩選選擇
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
    
    // 熱力圖狀態
    isHeatmapActive: false,
    currentLegendFilter: { type: null, value: null },
    
    // 開關
    excludeCommercialInRanking: false,
};
```

### eventHandlers.js - 主要事件處理器

| 函式 | 功能 |
|------|------|
| `mainFetchData()` | 觸發數據查詢 |
| `mainAnalyzeData()` | 觸發分析計算 |
| `handleExcludeCommercialToggle()` | 排除商辦開關 |
| `handlePriceBandRoomFilterClick()` | 總價帶房型篩選 |
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
| `renderUnitPriceReport()` | 房屋單價分析 |
| `renderParkingAnalysisReport()` | 車位單價分析 |
| `renderSalesVelocityReport()` | 房型去化分析 |
| `renderPriceGridAnalysis()` | 垂直水平分析 |

### renderers/charts.js - 圖表渲染

| 函式 | 圖表類型 |
|------|----------|
| `renderRankingChart()` | Treemap / Bar Chart |
| `renderPriceBandChart()` | 箱型圖 |
| `renderSalesVelocityChart()` | 堆疊長條圖 |
| `renderAreaHeatmap()` | 熱力圖 |
| `renderParkingRatioChart()` | 圓餅圖 |

---

## 🔧 後端模組詳解

### analysis-engine.ts - 分析引擎

| 函式 | 功能 |
|------|------|
| `getRoomCategory(record)` | 房型分類（互斥優先級） |
| `calculatePriceBandAnalysis(data)` | 總價帶分析計算 |
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
  priceBandAnalysis: { bands, roomTypeStats },
  unitPriceAnalysis: { residence, shop, office, multipliers },
  parkingAnalysis: { rampParking, mechanicalParking, ratioData },
  salesVelocityAnalysis: { monthly, weekly, roomTypes },
  priceGridAnalysis: { projects: [...], summary },
  areaDistributionAnalysis: [...],
  transactionDetails: [...]
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
| 部署 | Netlify |

---

## 📦 外部依賴

### 前端 CDN
- ApexCharts
- html2pdf.js
- Supabase JS Client
- Font Awesome (圖標)

### 後端 Deno
- `https://deno.land/std@0.168.0/http/server.ts`
- Supabase JS Client
