---
description: Search and extract detailed real estate project information (Developer, Site Area, Public Ratio, etc.) from the web.
---

# Project Lookup & Enrichment Workflow

Use this workflow to enrich project data, either for a single request or in batch mode using Agent capabilities.

## Mode 1: Single Project Lookup
**Trigger**: User asks for details of a specific project (e.g., "幫我查 ASTER ONE").

1.  **Search**: Use `search_web` to find the project on major platforms (Priority: Leju 樂居 > 591 > Google).
    *   Query: `[Project Name] 建案詳情 樂居 591 基地規模 公設比 建造執照`
2.  **Extract**: Identify the 16 key fields (see Field List below).
3.  **Format**: Present the data to the user.
4.  **Update**: If approved, update the specific `[code]_projects` table.

---

## Mode 2: Batch Enrichment (Agent-Driven)
**Trigger**: User says "幫我補全下一批" or "繼續補全".

### Phase 1: Fetch Requested Projects (Agent Queue)
1.  **Query Database**: Find projects where `enrichment_status` is 'requested'.
    *   Target a specific county (e.g., Taipei `a_projects`).
    *   Limit to 10 projects per batch.
    *   *Example Command*:
        ```javascript
        const { data } = await supabase.from('a_projects')
          .select('project_name')
          .eq('enrichment_status', 'requested')
          .limit(10);
        ```

### Phase 2: Agent Search Loop
For each project in the list:
1.  **Search**: Perform a targeted web search using `search_web`.
    *   *Key Query*: `[Name] 建案詳情 樂居 591 建造執照 土地使用分區 代銷`
2.  **Extract**: Parse the search summary to find:
    *   *Basic*: Developer, Site Area, Public Ratio, Floors, Households, Structure.
    *   *Advanced*: Construction License, Land Usage Zone, Sales Agent, Affiliated Companies.
    *   *Note*: If specific fields are missing, perform a 2nd targeted search (e.g., `[Name] 建造執照`).

### Phase 3: Database Update
1.  **Update Record**: Write the found values to the `[code]_projects` table.
2.  **Update Status (Strict Completeness Rule)**:
    *   **IF** (All fields EXCEPT `sales_agent` are filled) ➡ Set `enrichment_status = 'done'`.
    *   **ELSE** ➡ Set `enrichment_status = 'pending'`.
    *   **ALWAYS** Update `last_enriched_at = NOW()`.
    *   *Note*: This ensures high-quality direct completion, while preserving manual review for any edge cases with missing data.

---

## Field List (Target Columns)
1.  `project_name` (建案名稱)
2.  `site_area` (基地規模 - 單位: 坪, 僅存數字)
3.  `total_households` (總戶數)
4.  `public_ratio` (公設比)
5.  `total_floors` (總樓層數)
6.  `basement_floors` (地下層數)
7.  `structure` (結構: RC/SC/SRC)
8.  `land_usage_zone` (土地使用分區)
9.  `parking_type` (車位類型)
10. `parking_count` (車位數量)
11. `developer` (建設公司)
12. `contractor` (工程營造)
13. `architect` (建築設計)
14. `sales_agent` (代銷企劃)
15. `affiliated_companies` (關係企業)
16. `construction_license` (建造號碼)
