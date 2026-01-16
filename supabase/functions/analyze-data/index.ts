// supabase/functions/analyze-data/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createSupabaseClient } from '../_shared/supabase-client.ts';
import {
  calculatePriceBandAnalysis,
  calculateUnitPriceAnalysis,
  calculateParkingAnalysis,
  calculateSalesVelocityAnalysis,
  calculatePriceGridAnalysis,
  calculateAreaDistribution
} from '../_shared/analysis-engine.ts';
import { getFinalUnitIds } from '../_shared/unit-parser.ts';

interface FilterCriteria {
  county: string;
  districts: string[];
  type: string;
  buildingType: string;
  dateStart: string;
  dateEnd: string;
  projectNames?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { filters, userFloorPremium = 0.3 } = await req.json();
    const { county, districts, type, buildingType, dateStart, dateEnd, projectNames }: FilterCriteria = filters;

    const supabase = createSupabaseClient(req);

    // 1. Fetch Main Data
    let query = supabase.from('presale_data').select('*');
    if (county) query = query.eq('縣市', county);
    if (districts && districts.length > 0) query = query.in('行政區', districts);
    if (type) query = query.eq('交易類型', type);
    if (buildingType) query = query.eq('建物型態', buildingType);
    if (dateStart) query = query.gte('交易日', dateStart);
    if (dateEnd) query = query.lte('交易日', dateEnd);
    if (projectNames && projectNames.length > 0) query = query.in('建案名稱', projectNames);
    
    // Fallback simple fetch (Max 1000 rows) - To fix BOOT_ERROR
    const { data: mainData, error: mainError } = await query;
    if (mainError) throw new Error(`主資料查詢失敗: ${mainError.message}`);
    
    if (!mainData || mainData.length === 0) {
      return new Response(JSON.stringify({ message: "在指定條件下找不到任何交易資料。" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    // 2. Fetch Sub Data (Parking)
    const transactionIds = mainData.map(r => r['編號']);
    const { data: parkData, error: parkError } = await supabase.from('presale_data_parking')
      .select('transaction_id, 車位樓層, "車位價格(萬)"')
      .in('transaction_id', transactionIds);
    if (parkError) throw new Error(`車位附表資料查詢失敗: ${parkError.message}`);
    
    const parkDataMap = new Map<string, any[]>();
    if (parkData) {
        parkData.forEach(p => {
            if (!parkDataMap.has(p.transaction_id)) parkDataMap.set(p.transaction_id, []);
            parkDataMap.get(p.transaction_id)!.push(p);
        });
    }

    // 3. Perform Calculations
    const finalUnitIds = getFinalUnitIds(mainData);

    const reports: { [key: string]: any } = {};

    reports.priceBandAnalysis = calculatePriceBandAnalysis(mainData);
    
    // ▼▼▼ 【關鍵修改處】 ▼▼▼
    // 使用新的分析函式，並將其回傳的整個物件直接指派給 unitPriceAnalysis
    reports.unitPriceAnalysis = calculateUnitPriceAnalysis(mainData, finalUnitIds);
    // ▲▲▲ 【修改結束】 ▲▲▲

    reports.parkingAnalysis = calculateParkingAnalysis(mainData, parkDataMap, finalUnitIds);
    reports.salesVelocityAnalysis = calculateSalesVelocity(mainData);
    reports.priceGridAnalysis = calculatePriceGridAnalysis(mainData, parkDataMap, finalUnitIds, userFloorPremium);
    reports.areaDistribution = calculateAreaDistribution(mainData);
    
    // Core Metrics for Ranking Tab
    const totalSaleAmount = mainData.reduce((sum, r) => sum + (r['交易總價(萬)'] || 0), 0);
    const totalHouseArea = mainData.reduce((sum, r) => sum + (r['房屋面積(坪)'] || 0), 0);
    reports.coreMetrics = {
        totalSaleAmount,
        totalHouseArea,
        transactionCount: mainData.length,
        overallAveragePrice: safeDivide(totalSaleAmount, totalHouseArea),
    };

    return new Response(JSON.stringify({ reports }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('分析資料時發生錯誤:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

function safeDivide(numerator: number, denominator: number): number {
    if (denominator === 0 || !denominator) return 0;
    return numerator / denominator;
}
