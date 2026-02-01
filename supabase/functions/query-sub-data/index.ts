// /supabase/functions/query-sub-data/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// 建立一個有效的縣市代碼列表，方便管理
const VALID_COUNTY_CODES = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'T', 'U', 'V', 'W', 'X', 'Z']);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { id, type, county } = await req.json();

    // 1. 檢查最基本的參數是否存在
    if (!id || !type) {
      return new Response(JSON.stringify({ error: `請求中缺少 'id' 或 'type' 參數。` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // 400 Bad Request 代表前端請求格式錯誤
      });
    }
    
    const cleanId = id.trim();
    let effectiveCounty = county;

    // 2. 檢查縣市代碼是否有效，如果無效，就直接回傳錯誤，【不再】使用從ID猜測的備用方案
    if (!effectiveCounty || !VALID_COUNTY_CODES.has(String(effectiveCounty).toUpperCase())) {
      console.error(`[錯誤] 前端傳入無效的縣市代碼: "${county}"，編號: "${cleanId}"。查詢中止。`);
      return new Response(JSON.stringify({ error: `無效的縣市代碼 "${county}"，無法確定要查詢的資料表。` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const typeChar = { '中古交易': 'a', '預售交易': 'b', '租賃交易': 'c' }[type];
    if (!typeChar) {
      return new Response(JSON.stringify({ error: `無效的交易類型: ${type}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    const countyCode = String(effectiveCounty).toLowerCase();
    
    const subTablesToQuery = {
      land: `${countyCode}_lvr_land_${typeChar}_land`,
      park: `${countyCode}_lvr_land_${typeChar}_park`,
      build: (type !== '預售交易') ? `${countyCode}_lvr_land_${typeChar}_build` : null
    };

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const queries = Object.entries(subTablesToQuery)
      .filter(([_, tableName]) => tableName !== null)
      .map(async ([key, tableName]) => {
        const { data, error } = await supabaseClient
          .from(tableName)
          .select('*')
          .eq('編號', cleanId);

        if (error) {
          console.error(`查詢 ${tableName} 時發生資料庫錯誤:`, JSON.stringify(error));
          return [key, null];
        }
        
        return [key, data];
      });

    const resultsArray = await Promise.all(queries);
    const responseData = Object.fromEntries(resultsArray);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('函式發生未預期的系統錯誤:', err.message);
    return new Response(JSON.stringify({ error: '伺服器發生未預期的錯誤。' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500, // 500 Internal Server Error
    });
  }
});