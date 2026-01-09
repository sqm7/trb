// 檔案路徑: supabase/functions/query-data/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { AdaptiveUnitResolver } from '../_shared/unit-parser.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { fetchAllData } from '../_shared/analysis-engine.ts'; // 引用共用的 fetchAllData 函式
import { createSupabaseClient } from '../_shared/supabase-client.ts'; // 使用共用的 client

// 定義各交易類型需要查詢的欄位
const SELECT_COLUMNS = {
  '中古交易': '"編號","行政區","地址","交易日","交易筆棟數","樓層","建物型態","主要用途","交易總價(萬)","房屋總價(萬)","房屋面積(坪)","房屋單價(萬)","車位總價(萬)","車位面積(坪)","車位類別","車位數","房數","廳數","衛浴數","主建物面積(坪)","附屬建物面積(坪)","陽台面積(坪)","雨遮、花台、其他(坪)","備註"',
  '預售交易': '"編號","行政區","建案名稱","地址","交易日","交易筆棟數","戶別","樓層","總樓層","建物型態","主要用途","交易總價(萬)","房屋總價(萬)","房屋面積(坪)","房屋單價(萬)","車位總價(萬)","車位面積(坪)","車位類別","車位數","房數","廳數","衛浴數","備註","解約情形"',
  '租賃交易': '"編號","行政區","地址","交易日","交易筆棟數","樓層","建物型態","主要用途","租賃面積","房數","廳數","衛浴數","車位類別","備註","出租型態","租賃期間","附屬設備","租賃住宅服務","車位數","租賃房屋面積(坪)","租賃期(月)"'
};


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 【暫時修改】使用共用的 supabase client，不再驗證用戶身份
    const supabase = createSupabaseClient(req);
    // 移除用戶驗證檢查，允許未登入使用者存取

    // 獲取參數
    const { filters, pagination } = await req.json();
    const { countyCode, districts, type, dateStart, dateEnd, projectNames, buildingType } = filters || {};
    const { page = 1, limit = 30 } = pagination || {};
    const offset = (page - 1) * limit;

    if (!countyCode || !type) throw new Error("查詢缺少縣市代碼或交易類型。");

    const tableName = `${countyCode.toLowerCase()}_lvr_land_${type === '預售交易' ? 'b' : (type === '中古交易' ? 'a' : 'c')}`;
    const selectString = SELECT_COLUMNS[type as keyof typeof SELECT_COLUMNS];
    if (!selectString) throw new Error(`不支援的交易類型: ${type}`);

    // --- 【核心修正邏輯】 ---

    let correctedUnitIds = new Map<string, string>();

    // 僅對預售交易執行戶型校正
    if (type === '預售交易') {

      // 【步驟 1: 建立一個包含所有篩選條件的基礎查詢】
      // 這個 baseQuery 將被重複使用，確保資料來源一致
      let baseQuery = supabase.from(tableName).select(`"編號", "建案名稱", "戶別", "樓層"`);

      if (districts && Array.isArray(districts) && districts.length > 0) {
        baseQuery = baseQuery.in('行政區', districts);
      }
      if (dateStart) baseQuery = baseQuery.gte('交易日', dateStart);
      if (dateEnd) baseQuery = baseQuery.lte('交易日', dateEnd);
      if (projectNames && Array.isArray(projectNames) && projectNames.length > 0) {
        baseQuery = baseQuery.in('建案名稱', projectNames);
      }
      // ▼▼▼ 【最終 Bug 修正】▼▼▼
      if (buildingType) {
        if (buildingType === '店面(店鋪)') {
          const orConditions = [
            '"建物型態".ilike.%店面%',
            '"建物型態".ilike.%店舖%',
            '"建物型態".ilike.%店鋪%',
            'and("主要用途".eq.商業用,"樓層".eq.1)',
            'and("主要用途".eq.住商用,"樓層".eq.1)',
            '"備註".ilike.%店面%',
            '"備註".ilike.%店舖%',
            '"備註".ilike.%店鋪%',
            '"戶別".ilike.%店面%',
            '"戶別".ilike.%店舖%',
            '"戶別".ilike.%店鋪%',
            'and("建物型態".ilike.%住宅大樓%,"樓層".eq.1,"房數".eq.0)'
          ].join(',');
          baseQuery = baseQuery.or(orConditions);
        } else if (buildingType === '工廠') {
          baseQuery = baseQuery.in('建物型態', ['工廠', '廠辦']);
        } else {
          baseQuery = baseQuery.eq('建物型態', buildingType);
        }
      }
      // ▲▲▲ 【修改結束】 ▲▲▲

      // 【步驟 2: 取得完整解析情境】
      // 使用 `fetchAllData` 輔助函式，無視分頁，撈取所有符合條件的資料來建立模型
      // 這是最關鍵的修正：確保 `allContextData` 和「分析報告」功能所用的資料範圍完全相同
      const allContextData = await fetchAllData(baseQuery);

      if (allContextData && allContextData.length > 0) {
        // 【步驟 3: 建立全域校正模型】
        const unitResolver = new AdaptiveUnitResolver(allContextData);
        // 這段二次校正邏輯與 analyze-project-ranking 函式中的完全相同
        const initialResults = new Map();
        allContextData.forEach(record => {
          initialResults.set(record['編號'], { record, result: unitResolver.resolveWithContext(record) });
        });
        const projectsMap = new Map<string, any[]>();
        allContextData.forEach(r => {
          const projectName = r['建案名稱'];
          if (projectName) {
            if (!projectsMap.has(projectName)) projectsMap.set(projectName, []);
            projectsMap.get(projectName)!.push(r);
          }
        });
        for (const [_projectName, records] of projectsMap.entries()) {
          const styleTally = new Map<string, number>();
          const recordStyles = new Map<string, string>();
          records.forEach(record => {
            const result = initialResults.get(record['編號']);
            if (!result) return;
            const id = result.result.identifier;
            let style = 'other';
            if (/^[A-Z]$/.test(id)) { style = 'plainLetter'; }
            else if (/^[A-Z]+\d+$/.test(id)) { style = 'letterNumber'; }
            recordStyles.set(record['編號'], style);
            styleTally.set(style, (styleTally.get(style) || 0) + 1);
          });
          let dominantStyle: string | null = null;
          let maxCount = 0;
          for (const [style, count] of styleTally.entries()) { if (count > maxCount) { maxCount = count; dominantStyle = style; } }
          if (dominantStyle === 'letterNumber' && styleTally.has('plainLetter')) {
            records.forEach(record => {
              if (recordStyles.get(record['編號']) === 'plainLetter') {
                const resultContainer = initialResults.get(record['編號']);
                const rawUnit = record['戶別'];
                if (resultContainer && typeof rawUnit === 'string') {
                  const correctedId = rawUnit.toUpperCase().replace(/[\uff01-\uff5e]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)).replace(/[棟樓F室號\s\-]/g, '');
                  resultContainer.result.identifier = correctedId;
                }
              }
            });
          }
        }
        initialResults.forEach((value, key) => {
          correctedUnitIds.set(key, value.result.identifier);
        });
      }
    }

    // 【步驟 4: 查詢當前頁面的詳細資料】
    // 重新建立一個查詢，這次是為了顯示在列表上，所以包含所有欄位和分頁設定
    let displayQuery = supabase.from(tableName).select(selectString, { count: 'exact' });
    if (districts && Array.isArray(districts) && districts.length > 0) {
      displayQuery = displayQuery.in('行政區', districts);
    }
    if (dateStart) displayQuery = displayQuery.gte('交易日', dateStart);
    if (dateEnd) displayQuery = displayQuery.lte('交易日', dateEnd);
    if (projectNames && Array.isArray(projectNames) && projectNames.length > 0) {
      displayQuery = displayQuery.in('建案名稱', projectNames);
    }
    // ▼▼▼ 【最終 Bug 修正】▼▼▼
    if (buildingType) {
      if (buildingType === '店面(店鋪)') {
        const orConditions = [
          '"建物型態".ilike.%店面%',
          '"建物型態".ilike.%店舖%',
          '"建物型態".ilike.%店鋪%',
          'and("主要用途".eq.商業用,"樓層".eq.1)',
          'and("主要用途".eq.住商用,"樓層".eq.1)',
          '"備註".ilike.%店面%',
          '"備註".ilike.%店舖%',
          '"備註".ilike.%店鋪%',
          '"戶別".ilike.%店面%',
          '"戶別".ilike.%店舖%',
          '"戶別".ilike.%店鋪%',
          'and("建物型態".ilike.%住宅大樓%,"樓層".eq.1,"房數".eq.0)'
        ].join(',');
        displayQuery = displayQuery.or(orConditions);
      } else if (buildingType === '工廠') {
        displayQuery = displayQuery.in('建物型態', ['工廠', '廠辦']);
      } else {
        displayQuery = displayQuery.eq('建物型態', buildingType);
      }
    }
    // ▲▲▲ 【修改結束】 ▲▲▲

    // 套用分頁和排序
    displayQuery = displayQuery.range(offset, offset + limit - 1).order('交易日', { ascending: false });

    const { data, error, count } = await displayQuery;

    if (error) throw new Error(`資料庫查詢失敗: ${error.message}`);

    // 【步驟 5: 合併結果並回傳】
    const processedData = data?.map(row => ({
      ...row,
      '縣市代碼': countyCode,
      '交易類型': type,
      '戶型': correctedUnitIds.get(row['編號']) || null
    })) || [];

    return new Response(
      JSON.stringify({ data: processedData, count }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('【後端】Function error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});