# Unit Price Analysis Report (單價分析)

## 1. 概述
`UnitPriceAnalysisReport` 針對不同產品用途（住宅、辦公、店面）進行深入的單價分析。包含統計摘要、產品價差比較以及單價分佈泡泡圖。

## 2. 功能特點
- **用途統計區塊 (`UnitPriceStatsBlock`)**: 
  - 分別展示住宅、辦公室、店舖的三大關鍵指標：平均單價、中位數、交易筆數。
  - **平均算法切換**: 支援切換「算術平均」與「加權平均」（依坪數加權）。
- **產品類型比較表 (`TypeComparisonTable`)**: 
  - 針對同時包含多種用途的複合式建案，比較其住宅與非住宅產品的價差。
  - 計算「倍數比」（例如：店面單價是住宅單價的 1.5 倍）。
- **單價分佈泡泡圖 (`BubbleChart`)**:
  - X軸為單價，Y軸可為建案或區域（視實作而定，通常為隨機分佈或依時間）。
  - 泡泡大小代表交易量或坪數。
  - 透過滑桿控制單價顯示範圍 (`minPrice`, `maxPrice`)。

## 3. props 定義
- `data`: `AnalysisData`，需包含 `unitPriceAnalysis` 與 `transactionDetails`。

## 4. 關鍵邏輯
- **加權 vs 算術平均**: 
  - 算術平均：`Sum(Price) / Count`
  - 加權平均：`Sum(Total Price) / Sum(Total Area)`
  - 透過 `averageType` 狀態即時切換顯示數值。
- **泡泡圖數據**: 
  - 直接使用原始 `transactionDetails` 繪製，讓用戶能看到每一筆交易（或每一建案聚合）在單價光譜上的位置。
