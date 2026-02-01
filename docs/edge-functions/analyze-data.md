# Analyze Data Edge Function (`analyze-data`)

## 1. 概述
此函數是系統的核心分析引擎，負責接收前端傳來的篩選條件，查詢數據庫，並執行複雜的房地產數據運算，最終回傳各類分析報表的數據結構。

## 2. 輸入參數 (Body)
```typescript
interface RequestBody {
    filters: {
        county: string;          // 縣市 (例: "臺北市")
        districts: string[];     // 行政區列表 (例: ["大安區", "信義區"])
        type: string;            // 交易標的 (例: "房地(土地+建物)+車位")
        buildingType: string;    // 建物型態 (例: "住宅大樓(11層含以上有電梯)")
        dateStart: string;       // 交易起始日 (YYYY-MM-DD)
        dateEnd: string;         // 交易結束日 (YYYY-MM-DD)
        projectNames?: string[]; // 指定建案名稱 (選填)
    };
    userFloorPremium?: number;   // 使用者自訂樓層價差係數 (預設 0.3)
}
```

## 3. 執行流程
1. **建立連線**: 初始化 Supabase Client。
2. **主資料查詢**: 查詢 `presale_data` 資料表，應用所有篩選條件。
3. **車位資料查詢**: 根據主資料的 `交易編號`，批量查詢 `presale_data_parking` 表，獲取車位樓層與價格資訊。
4. **戶別解析**: 使用 `unit-parser.ts` 解析每一筆交易的戶別代碼 (Unit ID)。
5. **分析運算**: 呼叫 `_shared/analysis-engine.ts` 中的各項分析函式：
    - `calculatePriceBandAnalysis`: 總價帶分析
    - `calculateUnitPriceAnalysis`: 單價分析 (住宅/辦公/店面)
    - `calculateParkingAnalysis`: 車位分析
    - `calculateSalesVelocityAnalysis`: 銷售速度分析
    - `calculatePriceGridAnalysis`: 銷控表與熱力圖
    - `calculateAreaDistribution`: 面積分佈
6. **核心指標**: 計算總銷金額、總坪數、交易筆數等 Summary 數據。
7. **回傳**: 將所有分析結果打包為 JSON 回傳。

## 4. 依賴模組
- `../_shared/analysis-engine.ts`: 包含所有數學與統計邏輯。
- `../_shared/unit-parser.ts`: 負責識別戶型與樓層。
