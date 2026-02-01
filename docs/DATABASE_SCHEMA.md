# Database Schema Documentation

本文檔記錄了 Supabase 資料庫各表格的功能、結構與用途。

## 1. 系統與用戶 (System & Users)

### `public.profiles`
- **用途**: 擴充 Supabase Auth 的用戶資料。
- **關鍵欄位**:
    - `id`: 關聯至 `auth.users.id`。
    - `full_name`: 用戶名稱。
    - `email`: 備份 Email（便於查詢）。

### `public.announcements`
- **用途**: 全站公告系統。
- **內容**: 包含公告標題、格式化內容及發布權限。


### `public.shared_snapshots` (New)
- **用途**: **Viral Snapshot System** 的核心表格。儲存不可變更、限時有效的報表快照。
- **關鍵欄位**:
    - `id` (UUID): 唯一識別碼，用於 URL (`/share/[id]`)。
    - `creator_id` (UUID): 建立者 (Partner/Admin)。
    - `config_json` (JSONB): 鎖定的視圖設定 (含 Filters, ViewState)。
    - `expires_at` (Timestamp): 過期時間。
    - `view_count` (Int): 瀏覽次數統計。

---

## 2. 房地產交易核心數據 (LVR Land)

這類表格遵循內政部實價登錄的原始命名慣例，主要分為「主表」、「建物」、「土地」及「車位」子表。

### 命名慣例 (Prefix Legend)
- 前綴字元 (如 `a`, `b`, `c`, `i`, `j`, `t` 等) 通常代表不同的資料批次、地區或交易性質（如買賣、預售、租賃）。
- `*_build`: 建物明細（構造、完工日、移轉情形）。
- `*_land`: 土地明細（使用分區、地號、持分）。
- `*_park`: 車位明細（單價、面積、樓層）。

### 範例：預售屋交易 (`t_lvr_land_b`)
- **功能**: 紀錄預售屋成交紀錄。
- **欄位**: `交易總價(萬)`, `建案名稱`, `單價`, `樓層` 等。

---

## 3. 資料處理與智能規則 (Data Intelligence & Rules)

### `public.project_name_mappings`
- **用途**: **建案名稱標準化**。將實價登錄中混亂的原始名稱（如「甲山林帝寶」）映射到系統統一的標準名稱。

### `public.[a-z]_projects` (建案索引表 - 按縣市分表)
- **用途**: 儲存各縣市已發現的建案清單，與 `lvr_land` 交易資料結構同步。
- **表格名稱**: `a_projects`, `b_projects` ... `z_projects`。
- **關鍵欄位**:
    - `project_name` (Text, PK/Unique): 標準化後的建案名稱。
    - `raw_project_name` (Text): 第一次抓到該建案時的原始名稱。
    - `is_new_case` (Boolean): 預設為 `true`，用於標記新發現建案。
    - `last_seen_at` (Timestamp): 該建案最後一次出現在交易紀錄的時間。
    - **建案規格與開發商資訊**:
        - `site_area` (Text): 基地規模(坪)。
        - `total_households` (Text): 總戶數。
        - `public_ratio` (Text): 公設比。
        - `total_floors` (Text): 總樓層數。
        - `basement_floors` (Text): 地下層數。
        - `structure` (Text): 結構 (e.g., RC, SRC)。
        - `land_usage_zone` (Text): 土地使用分區 (Legacy)。
        - `land_use_zoning` (Text): 土地使用分區 (New, Canonical)。
        - `land_plot_number` (Text): 地號。
        - `community_unit_count` (Integer): 社區戶數。
        - `parking_type` (Text): 車位類型。
        - `parking_count` (Text): 車位數量。
        - `developer` (Text): 建設公司。
        - `contractor` (Text): 工程營造。
        - `architect` (Text): 建築設計。
        - `sales_agent` (Text): 代銷企劃。
        - `affiliated_companies` (Text): 關係企業。
        - `construction_license` (Text): 建造號碼。
        - `enrichment_status` (Text): 補全狀態。
            - `requested`: 代辦 (Agent 執行中/待執行)。
            - `pending`: 待補 (人工核對/資料殘缺待補)。
            - `done`: 完備 (已達 15/16 欄位門檻或人工存檔)。
        - `last_enriched_at` (Timestamp): 最後補全嘗試時間。

### `public.project_parsing_rules_v2`
- **用途**: **建案解析引擎核心**。儲存正規表達式 (Regex) 與解析邏輯。
- **欄位**: `extraction_regex`, `parser_logic`, `confidence_score` (置信度)。

### `public.parsing_exceptions_v15`
- **用途**: 特殊案例例外規則，用於處理通用引擎無法正確解析的極端情況。

### `public.county_codes`
- **用途**: 縣市行政區代碼對照表。

---

## 4. 資料分析視圖 (Analysis Views)

### `public.all_transactions_view`
- **用途**: 整合所有 `lvr_land` 系列表格的 **Union View**。
- **功能**: 供前端 Dashboard 與報表生成器統一呼叫，避免複雜的聯集查詢。

---

## 5. 其他補助表格

包含各種統計用的輔助資料：
- `land_usage_types`: 土地使用分區定義。
- `building_material_codes`: 建物結構代碼。

> [!NOTE]
> 各表詳細的欄位定義與類型，請參考自動生成的 [DATABASE_SCHEMA_TEMP.txt](DATABASE_SCHEMA_TEMP.txt) 或使用 `scripts/fetch-full-schema.js` 重新獲取。
