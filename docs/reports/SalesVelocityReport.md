# Sales Velocity Report (銷售速度與去化分析)

## 1. 概述
`SalesVelocityReport` 結合時間與空間維度，分析建案的銷售速度（Velocity）與產品去化分佈。

## 2. 功能特點
- **銷售趨勢圖 (`SalesVelocityChart`)**: 
  - **多維度切換**: 支援切換時間粒度（週、月、季、年）。
  - **指標切換**: 交易筆數、總銷金額、總銷坪數。
  - **房型篩選**: 透過上方 Toolbar 選擇要納入分析的房型（如僅看2房+3房趨勢）。
- **銷售明細表 (`VelocityTable`)**: 
  - 以表格形式對應展示趨勢圖的詳細數據。
- **面積分佈熱力圖 (`AreaHeatmapChart`)**:
  - X軸為坪數區間，Y軸為房型。
  - 顏色深淺代表成交熱度（筆數）。
  - **互動篩選**: 點擊熱力圖上的色塊，可彈出該特定房型與坪數區間的**詳細建案列表**。
  - **參數控制**: 可自訂坪數範圍（Min/Max）與級距（Interval）。

## 3. props 定義
- `data`: `AnalysisData`，需包含 `salesVelocityAnalysis` 與 `areaDistributionAnalysis`。

## 4. 關鍵邏輯
- **熱力圖下鑽 (`handleHeatmapClick`)**: 
  - 當用戶點擊熱力圖色塊（例如：2房, 20-25坪）時：
  - 1. 前端遍歷所有交易明細，篩選符合該條件的交易。
  - 2. 按建案名稱聚合數據 (`groupedByProject`)。
  - 3. 計算每個建案在該條件下的成交單價區間與中位數。
  - 4. 顯示模態視窗 (`Modal`) 供用戶檢視細節或匯出。
- **房型動態過濾**: 
  - 所有圖表與表格皆受控於上方的 `selectedRooms` 狀態，實現聯動更新。
