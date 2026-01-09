// 檔案路徑: supabase/functions/query-names/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClient } from '../_shared/supabase-client.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 【暫時修改】使用共用的 supabase client，不再驗證用戶身份
    const supabase = createSupabaseClient(req);
    // 移除用戶驗證檢查，允許未登入使用者存取


    const { countyCode, query: searchQuery, districts } = await req.json();

    if (!countyCode) {
      throw new Error("缺少 countyCode 參數。");
    }

    const tableName = `${countyCode.toLowerCase()}_lvr_land_b`;

    // 【修正#1】修改查詢邏輯以正確處理空查詢
    let query = supabase
      .from(tableName)
      .select('建案名稱');

    // 只有在 searchQuery 確實有內容時，才加入 ilike 篩選
    if (searchQuery && searchQuery.trim() !== '' && searchQuery.trim() !== '%') {
      query = query.ilike('建案名稱', `%${searchQuery}%`);
    }

    if (districts && Array.isArray(districts) && districts.length > 0) {
      query = query.in('行政區', districts);
    }

    // 最後才加上筆數限制
    //query = query.limit(30);

    const { data, error } = await query;

    if (error) {
      console.error('查詢建案名稱失敗:', error);
      throw new Error(`查詢建案名稱時發生錯誤: ${error.message}`);
    }

    // 使用 Set 去除重複的建案名稱
    const projectNames = [...new Set(data.map(item => item['建案名稱']).filter(Boolean))];

    return new Response(
      JSON.stringify(projectNames),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});