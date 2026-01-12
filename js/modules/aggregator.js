// js/modules/aggregator.js
// 多縣市資料聚合模組

/**
 * 聚合多個縣市的 projectRanking 資料
 * @param {Array} rankingsArray - 各縣市的 projectRanking 陣列
 * @returns {Array} 合併並重新排序的 projectRanking
 */
export function aggregateProjectRanking(rankingsArray) {
    // 1. 合併所有 projectRanking 陣列
    const allProjects = rankingsArray.flat();

    // 2. 計算新的 totalSaleAmount (跨縣市總和)
    const totalSaleAmount = allProjects.reduce((sum, p) => sum + (p.saleAmountSum || 0), 0);

    // 3. 重新計算每個建案的 marketShare
    allProjects.forEach(proj => {
        proj.marketShare = totalSaleAmount > 0
            ? parseFloat(((proj.saleAmountSum / totalSaleAmount) * 100).toFixed(2))
            : 0;
    });

    // 4. 依 saleAmountSum 排序 (降序)
    allProjects.sort((a, b) => b.saleAmountSum - a.saleAmountSum);

    return allProjects;
}

/**
 * 聚合多個縣市的 coreMetrics 資料
 * @param {Array} metricsArray - 各縣市的 coreMetrics 物件陣列
 * @returns {Object} 合併後的 coreMetrics
 */
export function aggregateCoreMetrics(metricsArray) {
    const merged = {
        totalSaleAmount: 0,
        totalHouseArea: 0,
        transactionCount: 0,
        overallAveragePrice: 0
    };

    metricsArray.forEach(m => {
        merged.totalSaleAmount += m.totalSaleAmount || 0;
        merged.totalHouseArea += m.totalHouseArea || 0;
        merged.transactionCount += m.transactionCount || 0;
    });

    // 重新計算 overallAveragePrice (總房價 / 總面積)
    // 注意：這裡需要用加權平均，所以需要 totalHousePrice
    // 但 coreMetrics 只有 overallAveragePrice，無法直接加權
    // 解決方案：用各縣市的 (平均單價 * 面積) 加總 / 總面積
    let weightedSum = 0;
    metricsArray.forEach(m => {
        weightedSum += (m.overallAveragePrice || 0) * (m.totalHouseArea || 0);
    });
    merged.overallAveragePrice = merged.totalHouseArea > 0
        ? parseFloat((weightedSum / merged.totalHouseArea).toFixed(2))
        : 0;

    return merged;
}

/**
 * 聚合多個縣市的完整分析資料
 * @param {Array} resultsArray - 各縣市的完整分析結果陣列
 * @returns {Object} 合併後的分析資料
 */
export function aggregateMultiCountyData(resultsArray) {
    if (!resultsArray || resultsArray.length === 0) {
        return null;
    }

    // 如果只有一個縣市，直接返回
    if (resultsArray.length === 1) {
        return resultsArray[0];
    }

    const merged = {
        // 核心指標與排名 - 需要合併
        coreMetrics: aggregateCoreMetrics(resultsArray.map(r => r.coreMetrics).filter(Boolean)),
        projectRanking: aggregateProjectRanking(resultsArray.map(r => r.projectRanking || []).filter(Boolean)),

        // 其他分析 - 目前僅使用第一個縣市的資料，或合併陣列
        // TODO: 未來可以擴展為真正的多縣市合併
        priceBandAnalysis: mergeArrayProperty(resultsArray, 'priceBandAnalysis'),
        unitPriceAnalysis: resultsArray[0]?.unitPriceAnalysis || null,
        parkingAnalysis: resultsArray[0]?.parkingAnalysis || null,
        salesVelocityAnalysis: resultsArray[0]?.salesVelocityAnalysis || null,
        priceGridAnalysis: mergeArrayProperty(resultsArray, 'priceGridAnalysis'),
        areaDistributionAnalysis: resultsArray[0]?.areaDistributionAnalysis || null,
        transactionDetails: mergeArrayProperty(resultsArray, 'transactionDetails'),
    };

    return merged;
}

/**
 * 合併多個結果中的陣列屬性
 */
function mergeArrayProperty(resultsArray, propertyName) {
    const arrays = resultsArray
        .map(r => r[propertyName])
        .filter(arr => Array.isArray(arr));

    return arrays.flat();
}
