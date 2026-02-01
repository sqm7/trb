# 🏗️ [LEGACY] ARCHITECTURE.md - 舊版技術架構 (Vanilla JS)

**狀態**: 已封存 (Archived)
**最後活躍版本**: 2.0.0
**替代版本**: 請參閱 `../ARCHITECTURE.md` (Next.js Version)

---

## 📁 舊版目錄結構 (Legacy Structure)

```
antigravity/
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
```

## 🔄 舊版數據流 (Legacy Data Flow)

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
```

## 📊 舊版前端模組詳解 (Legacy Modules)

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
