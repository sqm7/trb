// 檔案路徑: supabase/functions/query-names/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClient } from '../_shared/supabase-client.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient(req);

    // 接收 detailed 參數，預設為 false (保持向後兼容)
    const { countyCode, query: searchQuery, districts, detailed = false } = await req.json();

    if (!countyCode) {
      throw new Error("缺少 countyCode 參數。");
    }

    const tableName = `${countyCode.toLowerCase()}_lvr_land_b`;

    // 【修正#2】同時查詢建案名稱、行政區和交易日
    let query = supabase
      .from(tableName)
      .select('建案名稱, 行政區, 交易日');

    // 只有在 searchQuery 確實有內容時，才加入 ilike 篩選
    if (searchQuery && searchQuery.trim() !== '' && searchQuery.trim() !== '%') {
      query = query.ilike('建案名稱', `%${searchQuery}%`);
    }

    if (districts && Array.isArray(districts) && districts.length > 0) {
      query = query.in('行政區', districts);
    }

    const { data, error } = await query;

    if (error) {
      console.error('查詢建案名稱失敗:', error);
      throw new Error(`查詢建案名稱時發生錯誤: ${error.message}`);
    }

    // 【修正#3】使用 Map 來建立建案名稱對應資料 (行政區, 最早交易日)
    // Map<name, { district: string, earliestDate: string }>
    const projectMap = new Map<string, { district: string, earliestDate: string }>();
    
    data.forEach(item => {
      const name = item['建案名稱'];
      const district = item['行政區'] || '';
      const date = item['交易日']; // 假設格式為 YYYY-MM-DD

      if (name) {
        if (!projectMap.has(name)) {
          projectMap.set(name, { district, earliestDate: date });
        } else {
          // 如果已存在，檢查日期是否更早
          const current = projectMap.get(name)!;
          // 如果當前記錄的日期存在且比已儲存的日期更早 (字串比較對 ISO 日期有效)
          if (date && (!current.earliestDate || date < current.earliestDate)) {
             current.earliestDate = date;
             // 如果原本沒行政區但這次有，也更新行政區
             if (!current.district && district) current.district = district;
          }
        }
      }
    });

    let result;
    if (detailed) {
      // 新模式：回傳物件陣列 [{ name, district, earliestDate }]
      result = Array.from(projectMap.entries()).map(([name, info]) => ({
        name,
        district: info.district,
        earliestDate: info.earliestDate
      }));
    } else {
      // 兼容模式(預設)：只回傳字串陣列 ["name1", "name2"]
      result = Array.from(projectMap.keys());
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
