// 檔案路徑: supabase/functions/analyze-district-price/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 標準的 CORS 標頭，允許前端呼叫
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 為了程式碼清晰，定義分析結果的型別
type AnalysisRecord = {
  '行政區': string;
  '平均單價': number;
};

serve(async (req) => {
  // 處理瀏覽器的 OPTIONS 預檢請求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 建立 Supabase Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 從前端請求中解析出篩選條件
    const { filters } = await req.json();
    const { countyCode, transactionType, buildingType, projectNames } = filters || {};

    // --- 參數驗證 ---
    if (!countyCode) {
      throw new Error("查詢缺少必要的「縣市代碼」參數。");
    }
    // 根據您的前端程式碼，分析功能主要針對有「房屋單價」的交易類型
    if (transactionType !== '預售交易' && transactionType !== '中古交易') {
        throw new Error(`目前僅支援「預售交易」與「中古交易」的分析，收到的類型為: ${transactionType}`);
    }

    // --- 查詢資料 ---
    // 根據交易類型決定要查詢的資料表後綴 ('b' 代表預售, 'a' 代表中古)
    const typeSuffix = transactionType === '預售交易' ? 'b' : 'a';
    const tableName = `${countyCode.toLowerCase()}_lvr_land_${typeSuffix}`;

    // 建立查詢器，只選取分析所需要的欄位：「行政區」和「房屋單價(萬)」
    let query = supabase
      .from(tableName)
      .select('行政區, "房屋單價(萬)"')
      .not('"房屋單價(萬)"', 'is', null) // 排除沒有單價的資料
      .gt('"房屋單價(萬)"', 0);          // 排除無效的單價資料 (例如 0)

    // 根據前端傳來的篩選條件，動態增加查詢語句
    if (buildingType) {
        query = query.eq('建物型態', buildingType);
    }
    // 「建案名稱」篩選只適用於預售交易
    if (transactionType === '預售交易' && projectNames && Array.isArray(projectNames) && projectNames.length > 0) {
        query = query.in('建案名稱', projectNames);
    }

    // 執行查詢，獲取所有符合條件的原始數據
    // 注意：這裡不使用分頁 (.range())，因為我們需要全部資料來進行統計分析
    const { data: rawData, error } = await query;

    if (error) {
      console.error(`【分析功能】資料庫查詢失敗於資料表: ${tableName}`, error);
      throw new Error(`資料庫查詢失敗: ${error.message}`);
    }

    // --- 在伺服器端進行資料彙總 ---
    if (!rawData || rawData.length === 0) {
      // 如果找不到任何資料，直接回傳一個空陣列
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 使用一個物件來按「行政區」分組加總
    const districtGroups: Record<string, { total: number; count: number }> = {};

    for (const record of rawData) {
      const district = record['行政區'];
      const price = record['房屋單價(萬)'];
      
      if (!district || typeof price !== 'number') continue;

      if (!districtGroups[district]) {
        districtGroups[district] = { total: 0, count: 0 };
      }
      districtGroups[district].total += price;
      districtGroups[district].count++;
    }

    // 將分組後的資料計算成平均值，並轉換成前端圖表需要的格式
    const analysisResult: AnalysisRecord[] = Object.entries(districtGroups)
      .map(([district, { total, count }]) => ({
        '行政區': district,
        '平均單價': parseFloat((total / count).toFixed(2)), // 計算平均值並四捨五入到小數點後兩位
      }))
      .sort((a, b) => b['平均單價'] - a['平均單價']); // 依平均單價從高到低排序

    // 回傳最終的分析結果
    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('【分析功能】處理過程發生錯誤:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});