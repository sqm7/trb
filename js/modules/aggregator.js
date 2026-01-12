/**
 * js/modules/aggregator.js
 * 負責將多個縣市的分析結果合併為單一結果物件。
 */

/**
 * 合併分析資料
 * @param {Object} currentTotal - 當前的加總結果 (如果是第一次合併，此為 null/undefined)
 * @param {Object} newData - 新的單一縣市分析資料
 * @returns {Object} - 合併後的結果
 */
export function aggregateAnalysisData(currentTotal, newData) {
    if (!newData) return currentTotal;
    if (!currentTotal) {
        // 如果還沒有累積數據，直接複製一份 newData (深拷貝以避免副作用)
        return JSON.parse(JSON.stringify(newData));
    }

    // 1. 合併 Core Metrics
    currentTotal.coreMetrics = aggregateCoreMetrics(currentTotal.coreMetrics, newData.coreMetrics);

    // 2. 合併 Project Ranking
    if (newData.projectRanking && Array.isArray(newData.projectRanking)) {
        currentTotal.projectRanking = [...currentTotal.projectRanking, ...newData.projectRanking];
    }

    // 3. 合併 Price Band Analysis
    currentTotal.priceBandAnalysis = aggregatePriceBandAnalysis(currentTotal.priceBandAnalysis, newData.priceBandAnalysis);

    // 4. 合併 Unit Price Analysis
    currentTotal.unitPriceAnalysis = aggregateUnitPriceAnalysis(currentTotal.unitPriceAnalysis, newData.unitPriceAnalysis);

    // 5. 合併 Parking Analysis
    currentTotal.parkingAnalysis = aggregateParkingAnalysis(currentTotal.parkingAnalysis, newData.parkingAnalysis);

    // 6. 合併 Sales Velocity Analysis
    currentTotal.salesVelocityAnalysis = aggregateSalesVelocityAnalysis(currentTotal.salesVelocityAnalysis, newData.salesVelocityAnalysis);

    // 7. 合併 Price Grid Analysis (垂直水平分析)
    // 注意：垂直水平分析通常針對單一建案，但在跨縣市分析時，我們可能需要展示所有建案的列表供選擇
    currentTotal.priceGridAnalysis = aggregatePriceGridAnalysis(currentTotal.priceGridAnalysis, newData.priceGridAnalysis);

    // 8. 合併 Area Distribution Analysis (新增)
    currentTotal.areaDistributionAnalysis = aggregateAreaDistributionAnalysis(currentTotal.areaDistributionAnalysis, newData.areaDistributionAnalysis);

    return currentTotal;
}

function aggregateCoreMetrics(metricsA, metricsB) {
    if (!metricsB) return metricsA;
    if (!metricsA) return metricsB;

    const totalSaleAmount = (metricsA.totalSaleAmount || 0) + (metricsB.totalSaleAmount || 0);
    const totalHouseArea = (metricsA.totalHouseArea || 0) + (metricsB.totalHouseArea || 0);
    const transactionCount = (metricsA.transactionCount || 0) + (metricsB.transactionCount || 0);

    // 重新計算總平均價格 (加權平均)
    // 總平均 = 每一筆的 (總價 / 面積) ? 不，是 總銷 / 總坪
    const overallAveragePrice = totalHouseArea > 0 ? totalSaleAmount / totalHouseArea : 0;

    return {
        totalSaleAmount,
        totalHouseArea,
        overallAveragePrice,
        transactionCount,
        // 以下欄位較難合併，或者不重要
        medianPrice: 0, // 無法精確合併中位數
        q1Price: 0,
        q3Price: 0,
        minPrice: Math.min(metricsA.minPrice || Infinity, metricsB.minPrice || Infinity),
        maxPrice: Math.max(metricsA.maxPrice || 0, metricsB.maxPrice || 0)
    };
}

function aggregatePriceBandAnalysis(bandsA, bandsB) {
    if (!bandsB) return bandsA;

    // 將 B 的數據合併到 A
    // 假設結構為 Array of objects: { roomType, count, avgPrice, ... }

    // 使用 Map 來按房型合併
    const bandMap = new Map();

    const addToMap = (item) => {
        const key = item.roomType;
        if (!bandMap.has(key)) {
            bandMap.set(key, { ...item, projectNames: item.projectNames ? [...item.projectNames] : [] });
        } else {
            const existing = bandMap.get(key);

            // 加權平均單價
            // 注意：這裡我們可能只有 avgPrice 和 count，沒有總金額。我們只能用 avgPrice * count 近似總金額
            // 但更準確的是 avgPrice * count = totalAmount (假設 avgPrice 是算術平均)
            // 如果是加權平均單價，則需要面積。
            // 這裡簡化處理：使用 count 加權
            const totalAmountA = existing.avgPrice * existing.count;
            const totalAmountB = item.avgPrice * item.count;
            const newCount = existing.count + item.count;
            const newAvgPrice = newCount > 0 ? (totalAmountA + totalAmountB) / newCount : 0;

            existing.count = newCount;
            existing.avgPrice = newAvgPrice;
            existing.minPrice = Math.min(existing.minPrice, item.minPrice);
            existing.maxPrice = Math.max(existing.maxPrice, item.maxPrice);

            // 合併 projectNames
            if (item.projectNames) {
                const newProjectNames = new Set([...existing.projectNames, ...item.projectNames]);
                existing.projectNames = Array.from(newProjectNames);
            }
            // 中位數無法合併，暫時保留 A 的或取平均 (僅供參考)
            // existing.medianPrice = (existing.medianPrice + item.medianPrice) / 2; 
        }
    };

    bandsA.forEach(addToMap);
    bandsB.forEach(addToMap);

    return Array.from(bandMap.values());
}

function aggregateUnitPriceAnalysis(unitA, unitB) {
    if (!unitB) return unitA;

    // Helper to merge stats block
    const mergeStats = (statsA, statsB) => {
        if (!statsB) return statsA;
        if (!statsA) return statsB;
        if (!statsA.count) return statsB;
        if (!statsB.count) return statsA;

        const newCount = statsA.count + statsB.count;

        // 合併平均價格物件 (arithmetic, weighted)
        const newAvgPrice = {};
        ['arithmetic', 'weighted'].forEach(type => {
            const priceA = statsA.avgPrice?.[type] || 0;
            const priceB = statsB.avgPrice?.[type] || 0;
            // 這裡也只能用 count 加權近似，因為我們沒有每個類別的總坪數
            // 除非後端提供了該類別的總坪數 Sum Area
            // 假設 count 是足夠好的權重
            newAvgPrice[type] = (priceA * statsA.count + priceB * statsB.count) / newCount;
        });

        // Min/Max global
        const newMinPrice = Math.min(statsA.minPrice, statsB.minPrice);
        const newMaxPrice = Math.max(statsA.maxPrice, statsB.maxPrice);

        // 誰有極值，就繼承誰的 project info
        let minPriceProject = statsA.minPrice < statsB.minPrice ? statsA.minPriceProject : statsB.minPriceProject;
        let maxPriceProject = statsA.maxPrice > statsB.maxPrice ? statsA.maxPriceProject : statsB.maxPriceProject;

        return {
            count: newCount,
            avgPrice: newAvgPrice,
            minPrice: newMinPrice,
            maxPrice: newMaxPrice,
            minPriceProject,
            maxPriceProject,
            // 中位數無法合併
            medianPrice: 0,
            q1Price: 0,
            q3Price: 0
        };
    };

    const residentialStats = mergeStats(unitA.residentialStats, unitB.residentialStats);
    const officeStats = mergeStats(unitA.officeStats, unitB.officeStats);
    const storeStats = mergeStats(unitA.storeStats, unitB.storeStats);

    // Type Comparison Table 合併
    let typeComparison = [...(unitA.typeComparison || [])];
    if (unitB.typeComparison) {
        typeComparison = [...typeComparison, ...unitB.typeComparison];
    }

    return {
        residentialStats,
        officeStats,
        storeStats,
        typeComparison
    };
}

function aggregateParkingAnalysis(parkA, parkB) {
    if (!parkB) return parkA;

    // 1. 合併 Parking Ratio
    const ratioA = parkA.parkingRatio;
    const ratioB = parkB.parkingRatio;
    let newRatio = null;

    if (ratioA && ratioB) {
        const withA = ratioA.withParking.count;
        const withoutA = ratioA.withoutParking.count;
        const withB = ratioB.withParking.count;
        const withoutB = ratioB.withoutParking.count;
        const totalWith = withA + withB;
        const totalWithout = withoutA + withoutB;
        const total = totalWith + totalWithout;

        newRatio = {
            withParking: { count: totalWith, percentage: total > 0 ? (totalWith / total) * 100 : 0 },
            withoutParking: { count: totalWithout, percentage: total > 0 ? (totalWithout / total) * 100 : 0 }
        };
    } else {
        newRatio = ratioA || ratioB;
    }

    // 2. 合併 avgPriceByType (Array)
    const typeMap = new Map();
    const mergeTypeItem = (item) => {
        if (!typeMap.has(item.type)) {
            typeMap.set(item.type, { ...item });
        } else {
            const existing = typeMap.get(item.type);
            const totalCount = existing.count + item.count; // 總車位數
            const totalTx = existing.transactionCount + item.transactionCount; // 有價交易數

            // 平均價格加權 (用有價交易數)
            const priceA = existing.avgPrice;
            const priceB = item.avgPrice;
            const newAvg = totalTx > 0 ? (priceA * existing.transactionCount + priceB * item.transactionCount) / totalTx : 0;

            existing.count = totalCount;
            existing.transactionCount = totalTx;
            existing.avgPrice = newAvg;

            // 中位數無法準確合併
        }
    };
    (parkA.avgPriceByType || []).forEach(mergeTypeItem);
    (parkB.avgPriceByType || []).forEach(mergeTypeItem);
    const newAvgPriceByType = Array.from(typeMap.values());

    // 3. 合併 rampPlanePriceByFloor (Array)
    const floorMap = new Map();
    const mergeFloorItem = (item) => {
        if (!floorMap.has(item.floor)) {
            floorMap.set(item.floor, { ...item, rawRecords: item.rawRecords ? [...item.rawRecords] : [] });
        } else {
            const existing = floorMap.get(item.floor);
            const newCount = existing.count + item.count;

            // 這裡我們可以合併 rawRecords，因為在前端我們需要它們來計算中位數等
            // 但如果數據量太大可能有性能問題。目前先合併。
            if (item.rawRecords) {
                existing.rawRecords = [...(existing.rawRecords || []), ...item.rawRecords];
            }

            // 重新計算平均 (如果 rawRecords 太大沒傳，就用 count 加權)
            const newAvg = newCount > 0 ? (existing.avgPrice * existing.count + item.avgPrice * item.count) / newCount : 0;

            existing.count = newCount;
            existing.avgPrice = newAvg;
            existing.minPrice = Math.min(existing.minPrice, item.minPrice);
            existing.maxPrice = Math.max(existing.maxPrice, item.maxPrice);

            // 繼承極值資料
            if (item.maxPrice > existing.maxPrice) {
                existing.maxPriceProject = item.maxPriceProject;
                existing.maxPriceUnit = item.maxPriceUnit;
                existing.maxPriceFloor = item.maxPriceFloor;
            }
            if (item.minPrice < existing.minPrice) {
                existing.minPriceProject = item.minPriceProject;
                existing.minPriceUnit = item.minPriceUnit;
                existing.minPriceFloor = item.minPriceFloor;
            }
        }
    };
    (parkA.rampPlanePriceByFloor || []).forEach(mergeFloorItem);
    (parkB.rampPlanePriceByFloor || []).forEach(mergeFloorItem);
    const newRampByFloor = Array.from(floorMap.values());

    return {
        parkingRatio: newRatio,
        avgPriceByType: newAvgPriceByType,
        rampPlanePriceByFloor: newRampByFloor
    };
}

function aggregateSalesVelocityAnalysis(velA, velB) {
    if (!velB) return velA;

    // 1. 合併 allRoomTypes
    const allRoomTypes = Array.from(new Set([...(velA.allRoomTypes || []), ...(velB.allRoomTypes || [])]));

    // 2. 合併各個視圖 (monthly, quarterly, yearly, weekly)
    const views = ['monthly', 'quarterly', 'yearly', 'weekly'];
    const mergedViews = {};

    views.forEach(view => {
        const viewDataA = velA[view] || {};
        const viewDataB = velB[view] || {};

        // 結構: { '2023-01': { '2房': { count, priceSum, areaSum, avgPrice }, '3房': ... } }
        const mergedTimeKeys = {};

        // 取得所有時間鍵
        const allTimeKeys = new Set([...Object.keys(viewDataA), ...Object.keys(viewDataB)]);

        allTimeKeys.forEach(timeKey => {
            const timeObjA = viewDataA[timeKey] || {};
            const timeObjB = viewDataB[timeKey] || {};

            // 取得該時間點下所有房型
            const allRooms = new Set([...Object.keys(timeObjA), ...Object.keys(timeObjB)]);
            const mergedRooms = {};

            allRooms.forEach(room => {
                const dataA = timeObjA[room];
                const dataB = timeObjB[room];

                if (dataA && dataB) {
                    const totalCount = dataA.count + dataB.count;
                    const totalPriceSum = dataA.priceSum + dataB.priceSum;
                    const totalAreaSum = dataA.areaSum + dataB.areaSum;

                    mergedRooms[room] = {
                        count: totalCount,
                        priceSum: totalPriceSum,
                        areaSum: totalAreaSum,
                        avgPrice: totalAreaSum > 0 ? totalPriceSum / totalAreaSum : 0
                    };
                } else if (dataA) {
                    mergedRooms[room] = { ...dataA };
                } else if (dataB) {
                    mergedRooms[room] = { ...dataB };
                }
            });

            mergedTimeKeys[timeKey] = mergedRooms;
        });

        mergedViews[view] = mergedTimeKeys;
    });

    // 3. 合併 areaDistributionAnalysis (面積分佈)
    // 注意：原本 aggregator 裡寫的是 areaHeatmap，但 charts.js 讀取的是 state.analysisDataCache.areaDistributionAnalysis
    // 檢查 charts.js line 547: const distributionData = state.analysisDataCache.areaDistributionAnalysis;
    // 這裡 velA 是 salesVelocityAnalysis 還是整個物件? 
    // 上層呼叫: currentTotal.salesVelocityAnalysis = aggregateSalesVelocityAnalysis(...)
    // 但 areaDistributionAnalysis 是獨立的?
    // 查看 aggregateAnalysisData 函式...
    // 沒有 areaDistributionAnalysis 的合併！這也是個 bug。
    // Wait, areaHeatmap logic in aggregator seems to refer to something else? 
    // chart.js line 547 reads `state.analysisDataCache.areaDistributionAnalysis`.
    // aggregator.js line 12 only copies coreMetrics, projectRanking, etc.
    // IT IS MISSING areaDistributionAnalysis MERGE completely.

    // 暫時先修好 salesVelocityAnalysis 的結構
    return {
        allRoomTypes,
        ...mergedViews
    };
}

// Helper to add areaDistributionAnalysis if needed, but better do it in main function
function aggregateAreaDistributionAnalysis(distA, distB) {
    if (!distB) return distA;
    // Structure: { '2房': [23.5, 30.1, ...], '3房': [...] }
    const merged = { ...distA };
    Object.keys(distB).forEach(room => {
        if (merged[room]) {
            merged[room] = [...merged[room], ...distB[room]];
        } else {
            merged[room] = [...distB[room]];
        }
    });
    return merged;
}

function aggregatePriceGridAnalysis(gridA, gridB) {
    if (!gridB) return gridA;

    // 合併 Project List
    const projectNames = [...(gridA.projectNames || []), ...(gridB.projectNames || [])];

    // 合併 byProject map
    const byProject = { ...(gridA.byProject || {}), ...(gridB.byProject || {}) };

    return {
        projectNames,
        byProject
    };
}
