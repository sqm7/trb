import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { countyCodeToName, countyNameToCode } from '../_shared/constants.ts';
import { AdaptiveUnitResolver } from '../_shared/unit-parser.ts';
import { createSupabaseClient } from '../_shared/supabase-client.ts';


import {
  getRoomCategory, fetchAllData,
  calculateParkingAnalysis,
  calculateSalesVelocity,
  calculatePriceGridAnalysis,
  calculateQuantile,
  calculatePriceBandAnalysis,
  calculateUnitPriceAnalysis,
  calculateAreaDistribution,
  safeDivide
} from '../_shared/analysis-engine.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient(req);

    // 1. 建立查詢
    const mainSelectColumns = `"編號", "建案名稱", "行政區", "交易日", "交易總價(萬)", "房屋單價(萬)", "房屋面積(坪)", "樓層", "總樓層", "建物型態", "主要用途", "房數", "廳數", "衛浴數", "車位總價(萬)", "車位數", "車位面積(坪)", "備註", "戶別", "車位類別"`;
    // 即使不需要車位分析，也需要車位資料來扣除車位價格，計算純房屋單價
    const parkSelectColumns = `"編號", "車位類別", "車位價格(萬)", "車位面積(坪)", "車位所在樓層", "transaction_id"`;

    const { filters } = await req.json();
    const { countyCode, districts, type, dateStart, dateEnd, projectNames, buildingType, excludeCommercial, roomCategory, counties } = filters;
    const userFloorPremium = filters.userFloorPremium || 0.3;

    if ((!countyCode && (!counties || counties.length === 0)) || !type) {
        throw new Error("查詢缺少縣市代碼(或縣市列表)或交易類型。");
    }

    const targetCounties = (counties && counties.length > 0) 
      ? counties 
      : [countyCodeToName[countyCode] || countyCode];

    const queryPromises = targetCounties.map(async (cnty) => {
        const code = countyNameToCode[cnty] || cnty; 
        if (!code) return [];

        const tableName = `${code.toLowerCase()}_lvr_land_${type === '預售交易' ? 'b' : (type === '中古交易' ? 'a' : 'c')}`;
        const parkTableName = `${code.toLowerCase()}_lvr_land_${type === '預售交易' ? 'b' : (type === '中古交易' ? 'a' : 'c')}_parking`;

        let query = supabase.from(tableName).select(mainSelectColumns);

        if (districts && Array.isArray(districts) && districts.length > 0) {
            query = query.in('行政區', districts);
        }
        
        if (dateStart) query = query.gte('交易日', dateStart);
        if (dateEnd) query = query.lte('交易日', dateEnd);
        
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
                query = query.or(orConditions);
            } else if (buildingType === '工廠') {
                query = query.in('建物型態', ['工廠', '廠辦']);
            } else {
                query = query.eq('建物型態', buildingType);
            }
        }

        if (projectNames && Array.isArray(projectNames) && projectNames.length > 0) { 
            query = query.in('建案名稱', projectNames); 
        }

        const { data: rawData, error: rawError } = await fetchAllData(query);
        if (rawError) throw rawError;

        if (!rawData || rawData.length === 0) return { rawData: [], parkData: [] };

        const { data: parkData } = await fetchAllData(supabase.from(parkTableName).select(parkSelectColumns));
        
        return { rawData: rawData || [], parkData: parkData || [] };
    });

    const results = await Promise.all(queryPromises);
    
    let allRawData: any[] = [];
    let allParkData: any[] = [];
    
    results.forEach(res => {
        if (res && res.rawData) allRawData = allRawData.concat(res.rawData);
        if (res && res.parkData) allParkData = allParkData.concat(res.parkData);
    });

    if (!allRawData || allRawData.length === 0) {
        return new Response(JSON.stringify({ message: "在指定的條件下，找不到可用於分析的資料。" }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }

    const parkDataMap = new Map<string, any[]>();
    if (allParkData) { for (const parkRecord of allParkData) { const id = parkRecord['編號']; if (!parkDataMap.has(id)) parkDataMap.set(id, []); parkDataMap.get(id)!.push(parkRecord); } }

    const unitResolver = new AdaptiveUnitResolver(allRawData);
    const initialResults = new Map<string, { record: any, result: ReturnType<AdaptiveUnitResolver['resolveWithContext']> }>();
    allRawData.forEach(record => {
      initialResults.set(record['編號'], { record, result: unitResolver.resolveWithContext(record) });
    });
    const projectsMap = new Map<string, any[]>();
    allRawData.forEach(r => { const projectName = r['建案名稱']; if (projectName) { if (!projectsMap.has(projectName)) projectsMap.set(projectName, []); projectsMap.get(projectName)!.push(r); } });
    for (const [projectName, records] of projectsMap.entries()) {
      const styleTally = new Map<string, number>();
      const recordStyles = new Map<string, string>();
      records.forEach(record => {
        const result = initialResults.get(record['編號']);
        if (!result) return;
        const id = result.result.identifier;
        let style = 'other';
        if (/^[A-Z]$/.test(id)) { style = 'plainLetter'; } else if (/^[A-Z]+\d+$/.test(id)) { style = 'letterNumber'; }
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
    const finalUnitIds = new Map<string, string>();
    initialResults.forEach((value, key) => { finalUnitIds.set(key, value.result.identifier); });

    const dataForRanking = excludeCommercial
      ? allRawData.filter(item => {
        const category = getRoomCategory(item);
        return !['店舖', '辦公/事務所', '廠辦/工廠'].includes(category);
      })
      : allRawData;

    let totalSaleAmount = 0, totalHouseArea = 0, totalHousePrice = 0;
    dataForRanking.forEach(r => { totalSaleAmount += r['交易總價(萬)'] || 0; totalHouseArea += r['房屋面積(坪)'] || 0; totalHousePrice += r['房屋總價(萬)'] || 0; });
    const coreMetrics = { totalSaleAmount: parseFloat(totalSaleAmount.toFixed(2)), totalHouseArea: parseFloat(totalHouseArea.toFixed(2)), overallAveragePrice: parseFloat(safeDivide(totalHousePrice, totalHouseArea).toFixed(2)), transactionCount: dataForRanking.length };

    const projectGroups = new Map<string, any>();
    for (const record of dataForRanking) {
      const projectName = record['建案名稱'];
      if (!projectName) continue;
      if ((record['房屋面積(坪)'] || 0) <= 0) continue;
      if (!projectGroups.has(projectName)) { projectGroups.set(projectName, { houseAreaSum: 0, transactionCount: 0, saleAmountSum: 0, housePriceSum: 0, parkingPriceSum: 0, parkingCountSum: 0, unitPrices: [], district: record["行政區"] || "" }); }
      const group = projectGroups.get(projectName)!;
      group.houseAreaSum += record['房屋面積(坪)'] || 0;
      group.transactionCount += 1;
      group.saleAmountSum += record['交易總價(萬)'] || 0;
      group.housePriceSum += record['房屋總價(萬)'] || 0;
      group.parkingPriceSum += record['車位總價(萬)'] || 0;
      group.parkingCountSum += record['車位數'] || 0;
      if (typeof record['房屋單價(萬)'] === 'number') { group.unitPrices.push(record['房屋單價(萬)']); }
    }
    const projectRanking = Array.from(projectGroups.entries()).map(([projectName, group]) => { const sortedUnitPrices = [...group.unitPrices].sort((a, b) => a - b); return { projectName: projectName, houseAreaSum: parseFloat(group.houseAreaSum.toFixed(2)), transactionCount: group.transactionCount, saleAmountSum: parseFloat(group.saleAmountSum.toFixed(2)), marketShare: parseFloat(safeDivide(group.saleAmountSum, totalSaleAmount) * 100), averagePrice: parseFloat(safeDivide(group.housePriceSum, group.houseAreaSum).toFixed(2)), minPrice: sortedUnitPrices.length > 0 ? sortedUnitPrices[0] : 0, maxPrice: sortedUnitPrices.length > 0 ? sortedUnitPrices[sortedUnitPrices.length - 1] : 0, medianPrice: calculateQuantile(sortedUnitPrices, 0.5), avgParkingPrice: parseFloat(safeDivide(group.parkingPriceSum, group.parkingCountSum).toFixed(2)), district: group.district, county: countyCodeToName[countyCode] || countyCode }; });

    const priceBandAnalysis = calculatePriceBandAnalysis(allRawData);
    const unitPriceAnalysis = calculateUnitPriceAnalysis(allRawData, finalUnitIds);
    const parkingAnalysis = calculateParkingAnalysis(allRawData, parkDataMap, finalUnitIds);
    const salesVelocityAnalysis = calculateSalesVelocity(allRawData);
    const priceGridAnalysis = calculatePriceGridAnalysis(allRawData, parkDataMap, finalUnitIds, userFloorPremium);
    const areaDistributionAnalysis = calculateAreaDistribution(allRawData);

    let transactionDetails = allRawData;
    if (roomCategory) {
      // transactionDetails = allRawData.filter(record => getRoomCategoryForPriceBand(record) === roomCategory);
    }

    return new Response(
      JSON.stringify({
        coreMetrics,
        projectRanking,
        priceBandAnalysis,
        unitPriceAnalysis,
        parkingAnalysis,
        salesVelocityAnalysis,
        priceGridAnalysis,
        areaDistributionAnalysis,
        transactionDetails: transactionDetails
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('【分析功能】處理過程發生錯誤:', err);
    return new Response(JSON.stringify({ error: err.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
});
