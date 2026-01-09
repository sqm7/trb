// supabase/functions/public-report/index.ts (修正版)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { AdaptiveUnitResolver } from '../_shared/unit-parser.ts'
import {
  fetchAllData,
  calculatePriceGridAnalysis,
} from '../_shared/analysis-engine.ts'

// --- 輔助函式與靜態資料 ---
const heatmapColorMapping: Record<string, { label: string; color: string }> = {
    high: { label: '高度溢價 (> 5%)', color: 'rgba(244, 63, 94, 0.5)' },
    medium: { label: '中度溢價 (2-5%)', color: 'rgba(234, 179, 8, 0.4)' },
    low: { label: '微幅溢價 (0-2%)', color: 'rgba(34, 197, 94, 0.3)' },
    discount: { label: '建案折價 (< 0%)', color: 'rgba(139, 92, 246, 0.4)' },
};
const specialTypeMapping: Record<string, { label: string; icon: string }> = {
    storefront: { label: '店舖類型', icon: '<i class="fas fa-store"></i>' },
    anchor: { label: '基準戶', icon: '<i class="fas fa-anchor"></i>' },
    terrace: { label: '露台戶', icon: '<i class="fas fa-seedling"></i>' },
    insider: { label: '親友/員工', icon: '<i class="fas fa-users"></i>' },
};

function getPremiumCategory(premium: number | null): string {
    if (premium === null) return 'none';
    if (premium < 0) return 'discount';
    if (premium === 0) return 'anchor';
    if (premium > 5) return 'high';
    if (premium > 2) return 'medium';
    return 'low';
}

function getHeatmapColor(premium: number | null): string {
    if (premium === null) return '#1f2937';
    const category = getPremiumCategory(premium);
    return heatmapColorMapping[category] ? heatmapColorMapping[category].color : 'rgba(34, 197, 94, 0.2)';
}

// --- HTML 渲染函式 ---

function renderBaseHTML(title: string, content: string, dateRangeString: string): string {
    // 【修正】將 css/style.css 的完整內容複製到這裡，確保分享頁面排版一致
    return `
      <!DOCTYPE html>
      <html lang="zh-Hant">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Inter', 'Noto Sans TC', sans-serif; background: #1a1d29; color: #e5e7eb; }
              .glass-card { background: rgba(37, 40, 54, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
              table { width: 100%; border-collapse: collapse; }
              th, td { border-bottom: 1px solid #374151; padding: 0.75rem 1rem; text-align: left; font-size: 0.875rem; white-space: nowrap; }
              thead th { background-color: #252836; position: sticky; top: 0; z-index: 10; font-weight: 600; color: #9ca3af; }
              .report-section-title { font-size: 1.25rem; font-weight: 600; color: #e5e7eb; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #374151; }
              .legend-item { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 9999px; border: 1px solid #4b5563; font-size: 0.875rem; user-select: none; }
              .color-legend-swatch { width: 1rem; height: 1rem; border-radius: 0.25rem; margin-right: 0.5rem; border: 1px solid rgba(255,255,255,0.2); flex-shrink: 0; }
              .icon-legend-symbol { width: 1.5rem; text-align: center; margin-right: 0.5rem; }
              .grid-cell-content { line-height: 1.6; display: flex; flex-direction: column; align-items: flex-start; }
              .parking-icon { color: #a5b4fc; margin-left: 4px; font-size: 0.75rem; }
              .summary-table { border-collapse: separate; border-spacing: 0; }
              .summary-table th, .summary-table td { padding: 0.75rem; }
              .summary-table th { background-color: #1f2937; }
              .summary-table td { background-color: #252836; }
              .summary-table tr:first-child th:first-child { border-top-left-radius: 0.5rem; }
              .summary-table tr:first-child th:last-child { border-top-right-radius: 0.5rem; }
              .summary-table tr:last-child td:first-child { border-bottom-left-radius: 0.5rem; }
              .summary-table tr:last-child td:last-child { border-bottom-right-radius: 0.5rem; }
              .summary-value-positive { color: #f87171; }
              .summary-value-negative { color: #4ade80; }
          </style>
      </head>
      <body class="p-4 md:p-8">
          <div class="max-w-screen-2xl mx-auto">
              <header class="mb-8 text-center">
                  <h1 class="text-4xl font-extrabold text-white tracking-tight">${title}</h1>
                  <p class="mt-2 text-md text-gray-400">${dateRangeString}</p> 
                  <p class="mt-4 text-sm text-gray-500">資料來源：內政部實價登錄 | 彙整單位：SQM</p>
              </header>
              <main>
                  <div class="glass-card p-6 rounded-xl shadow-lg">
                      ${content}
                  </div>
              </main>
          </div>
      </body>
      </html>
    `;
}

function renderPriceGridHTML(analysisData: any): string {
    const { horizontalGrid, sortedFloors, sortedUnits, unitColorMap } = analysisData.priceGridAnalysis.allProjects;
    let tableHeader = '<thead><tr><th class="sticky left-0 bg-dark-card z-10 p-2">樓層 \\ 戶別</th>';
    sortedUnits.forEach((unit: string) => {
        tableHeader += `<th class="text-center p-2 text-white" style="background-color:${unitColorMap[unit] || '#4b5563'}80;">${unit}</th>`;
    });
    tableHeader += '</tr></thead>';
    let tableBody = '<tbody>';
    sortedFloors.forEach((floor: string) => {
        tableBody += `<tr class="hover:bg-gray-800/50"><td class="font-bold sticky left-0 bg-dark-card z-10 p-2">${floor}</td>`;
        sortedUnits.forEach((unit: string) => {
            const cellDataArray = horizontalGrid[floor]?.[unit];
            if (cellDataArray && cellDataArray.length > 0) {
                const hasStorefront = cellDataArray.some((tx: any) => tx.isStorefront);
                const bgColor = hasStorefront ? 'rgba(107, 33, 168, 0.2)' : `${unitColorMap[unit] || '#374151'}40`;
                const cellContent = cellDataArray.map((tx: any) => {
                    const parkingIcon = tx.hasParking ? ` <i class="fas fa-parking parking-icon" title="含車位"></i>` : '';
                    const storefrontIcon = tx.isStorefront ? `<i class="fas fa-store" title="店舖類型"></i> ` : '';
                    return `<div class="py-1"><span>${storefrontIcon}${tx.unitPrice.toFixed(1)}萬</span>${parkingIcon}<br><span class="text-xs text-gray-400">(${tx.transactionDate})</span></div>`;
                }).join('');
                tableBody += `<td style="background-color: ${bgColor}; vertical-align: top; padding: 4px 8px; border-left: 1px solid #374151;"><div class="grid-cell-content">${cellContent}</div></td>`;
            } else {
                tableBody += `<td class="bg-dark-card/50" style="border-left: 1px solid #374151;">-</td>`;
            }
        });
        tableBody += '</tr>';
    });
    tableBody += '</tbody>';
    const legendHtml = Object.entries(unitColorMap).map(([unit, color]) => `<div class="flex items-center text-sm"><span class="w-4 h-4 rounded-full mr-2" style="background-color: ${color};"></span><span>${unit}</span></div>`).join('');
    const content = `
        <div class="flex flex-wrap gap-x-4 gap-y-2 my-4">${legendHtml}</div>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-800">${tableHeader}${tableBody}</table>
        </div>
    `;
    return content;
}

function renderHeatmapHTML(analysisData: any): string {
    const { horizontalGrid, sortedFloors, sortedUnits, unitColorMap, summary, horizontalComparison, refFloorForComparison } = analysisData.priceGridAnalysis.allProjects;
    
    let tableHeader = '<thead><tr><th class="sticky left-0 bg-dark-card z-10 p-2">樓層 \\ 戶別</th>';
    sortedUnits.forEach((unit: string) => {
        tableHeader += `<th class="text-center p-2 text-white" style="background-color:${unitColorMap[unit] || '#4b5563'}80;">${unit}</th>`;
    });
    tableHeader += '</tr></thead>';

    let tableBody = '<tbody>';
    sortedFloors.forEach((floor: string) => {
        tableBody += `<tr class="hover:bg-gray-800/50"><td class="font-bold sticky left-0 bg-dark-card z-10 p-2">${floor}</td>`;
        sortedUnits.forEach((unit: string) => {
            const cellDataArray = horizontalGrid[floor]?.[unit];
            if (cellDataArray && cellDataArray.length > 0) {
                const cellContent = cellDataArray.map((tx: any) => {
                    const { premium, isStorefront, remark } = tx;
                    const remarkText = remark || '';
                    let specialType = 'none';
                    let iconHtml = '';
                    let bgColor = getHeatmapColor(premium);
                    if (isStorefront) {
                        specialType = 'storefront';
                        iconHtml = specialTypeMapping[specialType].icon + ' ';
                        bgColor = '#1f2937';
                    } else if (premium === 0) {
                        specialType = 'anchor';
                        iconHtml = specialTypeMapping[specialType].icon + ' ';
                    } else if (remarkText.includes('露台')) {
                        specialType = 'terrace';
                        iconHtml = specialTypeMapping[specialType].icon + ' ';
                    } else if (remarkText.includes('親友') || remarkText.includes('員工')) {
                        specialType = 'insider';
                        iconHtml = specialTypeMapping[specialType].icon + ' ';
                    }
                    return `<div class="py-1" style="border-radius: 4px; margin-bottom: 4px; padding: 2px 4px; background-color: ${bgColor}; border: ${specialType === 'anchor' ? '1px solid #06b6d4' : 'none'};">
                                <span class="font-semibold">${iconHtml}${tx.unitPrice.toFixed(1)}萬</span>
                                <br>
                                <span class="text-xs text-gray-400">(${tx.transactionDate})</span>
                            </div>`;
                }).join('');
                tableBody += `<td style="vertical-align: top; padding: 4px 8px; border-left: 1px solid #374151;">${cellContent}</td>`;
            } else {
                tableBody += `<td style="background-color: #1a1d29; border-left: 1px solid #374151;">-</td>`;
            }
        });
        tableBody += `</tr>`;
    });
    tableBody += '</tbody>';
    
    const colorLegend = Object.entries(heatmapColorMapping).map(([key, {label, color}]) => `
        <div class="legend-item" data-filter-type="premium" data-filter-value="${key}">
            <span class="color-legend-swatch" style="background-color: ${color};"></span>
            <span>${label}</span>
        </div>
    `).join('');

    const iconLegend = Object.entries(specialTypeMapping).map(([key, {label, icon}]) => `
        <div class="legend-item" data-filter-type="special" data-filter-value="${key}">
            <span class="icon-legend-symbol">${icon}</span>
            <span>${label}</span>
        </div>
    `).join('');
    
    const formatValue = (value: number, unit = '', decimals = 2, addSign = false) => {
        if (typeof value !== 'number' || isNaN(value)) return '-';
        const num = value.toLocaleString('zh-TW', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        if (addSign) {
            return value > 0 ? `<span class="summary-value-positive">+${num}${unit}</span>` : value < 0 ? `<span class="summary-value-negative">${num}${unit}</span>` : `<span>${num}${unit}</span>`;
        }
        return (unit === '%') ? num + unit : num + ' ' + unit;
    };

    let summaryTableHtml = '';
    if (summary && summary.transactionCount > 0) {
        const { totalBaselineHousePrice, totalPricePremiumValue, totalSoldArea } = summary;
        const premiumPercentage = (totalPricePremiumValue / totalBaselineHousePrice) * 100;
        const avgPriceAdjustment = totalPricePremiumValue / totalSoldArea;
        summaryTableHtml = `
            <h3 class="report-section-title mt-8">調價幅度統計摘要 (排除店舖)</h3>
            <div class="overflow-x-auto">
                <table class="min-w-full summary-table">
                    <thead><tr><th>基準房屋總價</th><th>調價幅度總額</th><th>總溢價率</th><th>已售房屋坪數</th><th>平均單價調價</th></tr></thead>
                    <tbody><tr>
                        <td>${formatValue(totalBaselineHousePrice, ' 萬', 0)}</td>
                        <td>${formatValue(totalPricePremiumValue, ' 萬', 0, true)}</td>
                        <td>${formatValue(premiumPercentage, '%', 2, true)}</td>
                        <td>${formatValue(totalSoldArea, ' 坪')}</td>
                        <td>${formatValue(avgPriceAdjustment, ' 萬/坪', 2, true)}</td>
                    </tr></tbody>
                </table>
            </div>`;
    }

    let comparisonTableHtml = '';
    if (horizontalComparison && horizontalComparison.length > 0) {
        comparisonTableHtml = `
            <h3 class="report-section-title mt-8">戶型水平價差與溢價貢獻 (基準樓層: F${refFloorForComparison || 'N/A'})</h3>
            <p class="text-sm text-gray-500 mt-2 mb-4">* 水平價差是將各戶型基準價換算至共同基準樓層後的價差，以最低價戶型為 0 基準。</p>
            <div class="overflow-x-auto">
                <table class="min-w-full summary-table">
                    <thead><tr><th>戶型</th><th>基準戶 (樓/價)</th><th>水平價差(萬/坪)</th><th>去化戶數</th><th>溢價貢獻</th><th>貢獻佔比</th><th>基準房屋總價</th><th>平均單價調價</th></tr></thead>
                    <tbody>
                        ${horizontalComparison.map((item:any) => `
                            <tr>
                                <td>${item.unitType}</td>
                                <td>${item.anchorInfo}</td>
                                <td>${formatValue(item.horizontalPriceDiff, '萬/坪', 2, true)}</td>
                                <td>${item.unitsSold.toLocaleString()} 戶</td>
                                <td>${formatValue(item.timePremiumContribution, '萬', 0, true)}</td>
                                <td>${formatValue(item.contributionPercentage, '%')}</td>
                                <td>${formatValue(item.baselineHousePrice, ' 萬', 0)}</td>
                                <td>${formatValue(item.avgPriceAdjustment, '萬/坪', 2, true)}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    }

    const content = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="glass-card p-4 rounded-lg">
                <h4 class="font-bold mb-2 text-gray-200">溢價圖例</h4>
                <div class="flex flex-wrap gap-x-4 gap-y-2">${colorLegend}</div>
            </div>
            <div class="glass-card p-4 rounded-lg">
                <h4 class="font-bold mb-2 text-gray-200">特殊交易圖例</h4>
                <div class="flex flex-wrap gap-x-4 gap-y-2">${iconLegend}</div>
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-800">${tableHeader}${tableBody}</table>
        </div>
        ${summaryTableHtml}
        ${comparisonTableHtml}
    `;
    return content;
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.pathname.split('/').pop();
    if (!token) throw new Error("請求的網址中缺少分享權杖 (token)。");

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: sharedConfig, error: configError } = await supabaseAdmin
      .from('shared_reports')
      .select('filters, date_config, report_type, view_mode, view_options')
      .eq('token', token)
      .single();

    if (configError || !sharedConfig) {
      return new Response(JSON.stringify({ error: '找不到此分享連結或連結已過期' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
      });
    }

    let finalFilters = { ...sharedConfig.filters };
    const { type, value, start, end } = sharedConfig.date_config;
    if (type === 'relative') {
      const today = new Date();
      let startDate = new Date();
      if (value === '1y') startDate.setFullYear(today.getFullYear() - 1);
      else if (value === '1q') startDate.setMonth(today.getMonth() - 3);
      else if (value === '2q') startDate.setMonth(today.getMonth() - 6);
      else if (value === '3q') startDate.setMonth(today.getMonth() - 9);
      else if (value === 'this_year') startDate = new Date(today.getFullYear(), 0, 1);
      else if (value === 'last_2_years') startDate = new Date(today.getFullYear() - 1, 0, 1);
      else if (value === 'last_3_years') startDate = new Date(today.getFullYear() - 2, 0, 1);
      
      finalFilters.dateStart = startDate.toISOString().split('T')[0];
      finalFilters.dateEnd = today.toISOString().split('T')[0];
    } else if (type === 'absolute') {
      finalFilters.dateStart = start;
      finalFilters.dateEnd = end;
    }

    const mainTableName = `${finalFilters.countyCode.toLowerCase()}_lvr_land_b`;
    const parkTableName = `${finalFilters.countyCode.toLowerCase()}_lvr_land_b_park`;
    const mainSelectColumns = '"編號", "建案名稱", "行政區", "交易日", "戶別", "樓層", "建物型態", "交易總價(萬)", "房屋總價(萬)", "房屋面積(坪)", "房屋單價(萬)", "車位總價(萬)", "車位數", "車位類別", "房數", "衛浴數", "備註"';
    const parkSelectColumns = `"編號", "車位樓層", "車位價格(萬)"`;

    let query = supabaseAdmin.from(mainTableName).select(mainSelectColumns);
    if (finalFilters.districts && Array.isArray(finalFilters.districts) && finalFilters.districts.length > 0) {
      query = query.in('行政區', finalFilters.districts);
    }
    if (finalFilters.dateStart) query = query.gte('交易日', finalFilters.dateStart);
    if (finalFilters.dateEnd) query = query.lte('交易日', finalFilters.dateEnd);
    if (finalFilters.buildingType) query = query.eq('建物型態', finalFilters.buildingType);
    if (finalFilters.projectNames && Array.isArray(finalFilters.projectNames) && finalFilters.projectNames.length > 0) { 
      query = query.in('建案名稱', finalFilters.projectNames); 
    }

    const [allRawData, allParkData] = await Promise.all([
        fetchAllData(query), 
        fetchAllData(supabaseAdmin.from(parkTableName).select(parkSelectColumns))
    ]);

    if (!allRawData || allRawData.length === 0) {
        const dateRangeStr = `分析區間：${finalFilters.dateStart || 'N/A'} ~ ${finalFilters.dateEnd || 'N/A'}`;
        const errorHtml = renderBaseHTML('錯誤', '<p class="text-center text-red-400">找不到符合指定篩選條件的資料。</p>', dateRangeStr);
        return new Response(JSON.stringify({ html: errorHtml }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' }, status: 200
        });
    }

    const parkDataMap = new Map<string, any[]>();
    if (allParkData) { 
        for (const parkRecord of allParkData) { 
            const id = parkRecord['編號']; 
            if (!parkDataMap.has(id)) parkDataMap.set(id, []); 
            parkDataMap.get(id)!.push(parkRecord); 
        } 
    }

    const unitResolver = new AdaptiveUnitResolver(allRawData);
    const initialResults = new Map<string, { record: any, result: ReturnType<AdaptiveUnitResolver['resolveWithContext']> }>();
    allRawData.forEach(record => {
        initialResults.set(record['編號'], { record, result: unitResolver.resolveWithContext(record) });
    });
    const projectsMap = new Map<string, any[]>();
    allRawData.forEach(r => { 
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
        for (const [style, count] of styleTally.entries()) {
            if (count > maxCount) { maxCount = count; dominantStyle = style; }
        }
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
    initialResults.forEach((value, key) => { 
        finalUnitIds.set(key, value.result.identifier); 
    });

    let reportContent = '';
    let reportTitle = sharedConfig.filters?.projectNames?.join(', ') || '銷控表分析報告';

    if (sharedConfig.report_type === 'price_grid') {
         const userFloorPremium = sharedConfig.view_options?.floorPremium ?? 0.3;
         const priceGridAnalysis = calculatePriceGridAnalysis(allRawData, parkDataMap, finalUnitIds, userFloorPremium);
         
         if (sharedConfig.view_mode === 'heatmap') {
             reportTitle += ' - 調價熱力圖';
             reportContent = renderHeatmapHTML({ priceGridAnalysis });
         } else {
             reportTitle += ' - 標準銷控表';
             reportContent = renderPriceGridHTML({ priceGridAnalysis });
         }
    } else {
         reportContent = `<h1>不支援的報告類型: ${sharedConfig.report_type}</h1>`;
    }
    
    const dateRangeString = `分析區間：${finalFilters.dateStart || 'N/A'} ~ ${finalFilters.dateEnd || 'N/A'}`;
    const finalHtml = renderBaseHTML(reportTitle, reportContent, dateRangeString);
    const responsePayload = { html: finalHtml };

    return new Response(JSON.stringify(responsePayload), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8'
      },
      status: 200
    });
  } catch (err) {
    console.error('Public Report Error:', err);
    const dateRangeStr = `分析區間：資料錯誤`;
    const errorHtml = renderBaseHTML('伺服器錯誤', `<p class="text-center text-red-400">產生報告時發生錯誤: ${err.message}</p>`, dateRangeStr);
    return new Response(JSON.stringify({ html: errorHtml }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
      status: 200
    });
  }
});