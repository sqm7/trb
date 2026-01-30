# Data Query Edge Functions

本文件涵蓋純數據查詢與特定報表 API。這些函數主要負責從資料庫提取特定格式的數據。

## 1. Query Data (`query-data`)
- **用途**: 通用型數據查詢介面。
- **邏輯**:
    - 接收 SQL-like 的過濾參數。
    - 支援分頁 (`page`, `pageSize`)。
    - 直接映射到 `presale_data` 表的查詢。
    - 用於「交易列表」或「原始數據檢視」功能。

## 2. Query Names (`query-names`)
- **用途**: 建案名稱自動完成 (Autocomplete) 與搜尋。
- **邏輯**:
    - 接收關鍵字 (Keyword)。
    - 查詢 `presale_data` 中不重複的 `建案名稱`。
    - 支援模糊比對 (`ilike`)。
    - 回傳符合的建案名稱列表。

## 3. Query Sub Data (`query-sub-data`)
- **用途**:查詢交易的附屬資料（如詳細車位資訊、備註欄位）。
- **邏輯**:
    - 接收 `transaction_id`。
    - 查詢 `presale_data_parking` 或其他關聯表。

## 4. Specific Report Analyzers
除了通用的 `analyze-data`，還有針對特定視圖最佳化的分析函數：

- **`analyze-district-price`**:
    - 專注於計算「區域價格趨勢」。
    - 僅回傳該區域的時間序列價格數據，減少傳輸量。
- **`analyze-project-ranking`**:
    - 專注於計算「建案排名」。
    - 執行大量的 aggregate 運算 (Sum, Avg)，回傳排序後的建案列表。
- **`public-report`**:
    - 用於公開頁面的報表渲染。
    - 可能包含快取機制 (Cache) 或簡化的數據結構，以應對高併發與 SEO 需求。
