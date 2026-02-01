---
description: 掃描資料庫中標記為「代辦 (requested)」的建案，並使用 Agent 搜尋工具自動補全 16 個詳細欄位。
---

### 執行步驟：

### 執行步驟：

1. **第一道防線：自動化腳本掃描**：
   - 使用 `scripts/batch_enrich_projects.js` 快速批量掃描。
   - 優點：速度快、自動處理。
   - 缺點：容易被防火牆 (CAPTCHA) 擋下。

2. **第二道防線：Agent 智能補位 (Fallback)**：
   - 若自動腳本回報 `No data found` 或失效，**Agent 必須立即接手**。
   - **操作**：使用 `search_web` 工具，關鍵字：「`建案名稱` + `樂居`」、「`建案名稱` + `591`」。
   - **解析**：由 Agent 閱讀搜尋結果摘要，提取 16 個關鍵欄位。

3. **數據寫入 (Manual Enrich)**：
   - 當 Agent 找到數據後，不需手寫複雜 SQL。
   - **操作**：使用 `scripts/manual_enrich.js` 快速寫入。
   - **範例**：
     ```bash
     node scripts/manual_enrich.js "建案名稱" \
       --land_plot_number "XX段YY地號" \
       --community_unit_count "120"
     ```
   - **嚴格判定 (Strict Validation)**：
     -系統會先讀取資料庫現有資料，與新輸入資料合併。
     - **必須全倒**：包括 `land_plot_number` (地號)、`community_unit_count` (戶數) 等 15 個核心欄位 **全都有值** 且非「未提及/無資料」，才會標記為 `done`。
     - **排除欄位**：`sales_agent` (代銷) 與 `affiliated_companies` (關係企業) **不列入** 完備判定標準。
     - 否則一律標為 `pending`。
   - **車位型態標準化**：
     - 輸入時自動正規化為以下標籤：`坡道平面`、`升降平面`、`坡道機械`、`升降機械`、`塔式車位`、`其他`、`一樓平面`。
     - 支援多重標籤（如 `坡道平面、升降機械`）。

4. **數據保存聲明**：
   - 建案資料表 (`{code}_projects`) 與 交易資料表 (`lvr_land`) 是 **獨立儲存** 的。
   - 即使清空或重灌交易資料，**已補全的建案資料 (Developer, Architect...) 都不會消失**，請放心。

5. **最終手段：人工介入**：
   - 若 Agent 也找不到資料（極少見），將狀態標記為 `pending`，並產生 Google 搜尋連結請用戶協助。

5. **狀態判定邏輯 (自動執行)**：
   - **Request** (代辦) ➡ (Script/Agent 成功) ➡ **Done**。
   - **Request** (代辦) ➡ (找不到資料) ➡ **Pending** (待人工補)。
