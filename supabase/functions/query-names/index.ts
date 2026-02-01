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

    // 判斷是否為「熱門建案查詢」模式 (無搜尋字串)
    const isPopularMode = !searchQuery || searchQuery.trim() === '';

    let query = supabase
      .from(tableName)
      .select('建案名稱, 行政區, 交易日');

    if (isPopularMode) {
      // 模式 A: 熱門建案 (空搜尋)
      // 策略: 抓取最近 2500 筆交易，統計出現頻率最高的建案
      query = query.order('交易日', { ascending: false }).limit(2500);
    } else {
      // 模式 B: 關鍵字搜尋
      if (searchQuery && searchQuery.trim() !== '%') {
        const cleanQuery = searchQuery.trim();
        // 支援多關鍵字 (例如: "中山 帝寶")
        if (cleanQuery.includes(' ')) {
          // 簡單處理：只要匹配任一即可，或者全部匹配 (視需求，這邊先做單一匹配)
          query = query.ilike('建案名稱', `%${cleanQuery}%`);
        } else {
          query = query.ilike('建案名稱', `%${cleanQuery}%`);
        }
      }
    }

    if (districts && Array.isArray(districts) && districts.length > 0) {
      query = query.in('行政區', districts);
    }

    const { data, error } = await query;

    if (error) {
      console.error('查詢建案名稱失敗:', error);
      throw new Error(`查詢建案名稱時發生錯誤: ${error.message}`);
    }

    // Map<name, { district, earliestDate, count }>
    const projectMap = new Map<string, { district: string, earliestDate: string, count: number }>();

    data.forEach(item => {
      const name = item['建案名稱'];
      const district = item['行政區'] || '';
      const date = item['交易日'];

      if (name) {
        if (!projectMap.has(name)) {
          projectMap.set(name, { district, earliestDate: date, count: 1 });
        } else {
          const current = projectMap.get(name)!;
          current.count += 1; // 增加計數

          // 更新最早日期
          if (date && (!current.earliestDate || date < current.earliestDate)) {
            current.earliestDate = date;
            if (!current.district && district) current.district = district;
          }
        }
      }
    });

    // 處理結果轉陣列
    let sortedResults = Array.from(projectMap.entries()).map(([name, info]) => ({
      name,
      district: info.district,
      earliestDate: info.earliestDate,
      count: info.count
    }));

    // 如果是熱門模式，依據「交易筆數」排序 (取前 20 名)
    // 如果是搜尋模式，依據「建案名稱」排序 ? 或者也是依據熱門度 ? 
    // 通常搜尋也希望熱門的在前面
    sortedResults.sort((a, b) => b.count - a.count);

    if (isPopularMode) {
      sortedResults = sortedResults.slice(0, 20);
    } else {
      // 搜尋模式下，如果筆數太多，也可以截斷，避免傳輸過大
      sortedResults = sortedResults.slice(0, 100);
    }

    let result;
    if (detailed) {
      // 新模式：回傳物件陣列 [{ name, district, earliestDate }]
      result = sortedResults.map(item => ({
        name: item.name,
        district: item.district,
        earliestDate: item.earliestDate
      }));
    } else {
      // 兼容模式(預設)：只回傳字串陣列 ["name1", "name2"]
      result = sortedResults.map(item => item.name);
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
