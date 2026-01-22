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
        // 確保 transactionDetails 存在以便後續計算
        return JSON.parse(JSON.stringify(newData));
    }

    // 0. 合併 Raw Transaction Details (關鍵！用於重算中位數)
    if (newData.transactionDetails && Array.isArray(newData.transactionDetails)) {
        if (!currentTotal.transactionDetails) currentTotal.transactionDetails = [];
        currentTotal.transactionDetails = [...currentTotal.transactionDetails, ...newData.transactionDetails];
    }

    // 1. 合併 Core Metrics
    currentTotal.coreMetrics = aggregateCoreMetrics(currentTotal.coreMetrics, newData.coreMetrics);

    // 2. 合併 Project Ranking
    if (newData.projectRanking && Array.isArray(newData.projectRanking)) {
        currentTotal.projectRanking = [...currentTotal.projectRanking, ...newData.projectRanking];
    }

    // 3. 合併 Price Band Analysis
    currentTotal.priceBandAnalysis = aggregatePriceBandAnalysis(currentTotal.priceBandAnalysis, newData.priceBandAnalysis);

    // 4. 合併 Unit Price Analysis (並進行重算)
    // 我們先做簡單的合併，然後利用 accumulated raw data 進行修正
    currentTotal.unitPriceAnalysis = aggregateUnitPriceAnalysis(currentTotal.unitPriceAnalysis, newData.unitPriceAnalysis);

    // 【重算中位數與分位數】
    if (currentTotal.transactionDetails && currentTotal.transactionDetails.length > 0) {
        recalculateUnitPriceStats(currentTotal.unitPriceAnalysis, currentTotal.transactionDetails);
    }

    // 5. 合併 Parking Analysis
    currentTotal.parkingAnalysis = aggregateParkingAnalysis(currentTotal.parkingAnalysis, newData.parkingAnalysis);

    // 6. 合併 Sales Velocity Analysis
    currentTotal.salesVelocityAnalysis = aggregateSalesVelocityAnalysis(currentTotal.salesVelocityAnalysis, newData.salesVelocityAnalysis);

    // 7. 合併 Price Grid Analysis (垂直水平分析)
    currentTotal.priceGridAnalysis = aggregatePriceGridAnalysis(currentTotal.priceGridAnalysis, newData.priceGridAnalysis);

    // 8. 合併 Area Distribution Analysis
    currentTotal.areaDistributionAnalysis = aggregateAreaDistributionAnalysis(currentTotal.areaDistributionAnalysis, newData.areaDistributionAnalysis);

    return currentTotal;
}

function aggregateCoreMetrics(metricsA, metricsB) {
    if (!metricsB) return metricsA;
    if (!metricsA) return metricsB;

    const totalSaleAmount = (metricsA.totalSaleAmount || 0) + (metricsB.totalSaleAmount || 0);
    const totalHouseArea = (metricsA.totalHouseArea || 0) + (metricsB.totalHouseArea || 0);
    const transactionCount = (metricsA.transactionCount || 0) + (metricsB.transactionCount || 0);

    const overallAveragePrice = totalHouseArea > 0 ? totalSaleAmount / totalHouseArea : 0;

    return {
        totalSaleAmount,
        totalHouseArea,
        overallAveragePrice,
        transactionCount,
        // 這裡的中位數較難重算，且 UI 上似乎較少強調全域總中位數 (報表多是分類中位數)
        // 如果需要，也可以用 transactionDetails 重算
        medianPrice: 0,
        q1Price: 0,
        q3Price: 0,
        minPrice: Math.min(metricsA.minPrice || Infinity, metricsB.minPrice || Infinity),
        maxPrice: Math.max(metricsA.maxPrice || 0, metricsB.maxPrice || 0)
    };
}

function aggregatePriceBandAnalysis(bandsA, bandsB) {
    if (!bandsB) return bandsA;

    // 相容性處理：支援新舊格式
    // 新格式: { details, locationCrossTable, allDistricts, allRoomTypes }
    // 舊格式: Array
    const detailsA = Array.isArray(bandsA) ? bandsA : (bandsA.details || []);
    const detailsB = Array.isArray(bandsB) ? bandsB : (bandsB.details || []);

    const crossTableA = bandsA.locationCrossTable || {};
    const crossTableB = bandsB.locationCrossTable || {};
    const districtsA = bandsA.allDistricts || [];
    const districtsB = bandsB.allDistricts || [];
    const roomTypesA = bandsA.allRoomTypes || [];
    const roomTypesB = bandsB.allRoomTypes || [];

    // 合併 details
    const bandMap = new Map();

    const addToMap = (item) => {
        const key = item.roomType;
        if (!bandMap.has(key)) {
            bandMap.set(key, {
                ...item,
                projectNames: item.projectNames ? [...item.projectNames] : [],
                byDistrict: item.byDistrict ? { ...item.byDistrict } : {}
            });
        } else {
            const existing = bandMap.get(key);
            const totalAmountA = existing.avgPrice * existing.count;
            const totalAmountB = item.avgPrice * item.count;
            const newCount = existing.count + item.count;
            const newAvgPrice = newCount > 0 ? (totalAmountA + totalAmountB) / newCount : 0;

            existing.count = newCount;
            existing.avgPrice = newAvgPrice;
            existing.minPrice = Math.min(existing.minPrice, item.minPrice);
            existing.maxPrice = Math.max(existing.maxPrice, item.maxPrice);

            if (item.projectNames) {
                const newProjectNames = new Set([...existing.projectNames, ...item.projectNames]);
                existing.projectNames = Array.from(newProjectNames);
            }

            // 合併 byDistrict
            if (item.byDistrict) {
                Object.entries(item.byDistrict).forEach(([district, count]) => {
                    existing.byDistrict[district] = (existing.byDistrict[district] || 0) + count;
                });
            }
        }
    };

    detailsA.forEach(addToMap);
    detailsB.forEach(addToMap);

    // 合併 locationCrossTable
    const mergedCrossTable = { ...crossTableA };
    Object.entries(crossTableB).forEach(([roomType, districtCounts]) => {
        if (!mergedCrossTable[roomType]) {
            mergedCrossTable[roomType] = { ...districtCounts };
        } else {
            Object.entries(districtCounts).forEach(([district, count]) => {
                mergedCrossTable[roomType][district] = (mergedCrossTable[roomType][district] || 0) + count;
            });
        }
    });

    // 合併 allDistricts 和 allRoomTypes
    const mergedDistricts = Array.from(new Set([...districtsA, ...districtsB])).sort();
    const mergedRoomTypes = Array.from(new Set([...roomTypesA, ...roomTypesB]));

    return {
        details: Array.from(bandMap.values()),
        locationCrossTable: mergedCrossTable,
        allDistricts: mergedDistricts,
        allRoomTypes: mergedRoomTypes
    };
}

function aggregateUnitPriceAnalysis(unitA, unitB) {
    if (!unitB) return unitA;

    // Helper to merge stats block WITHOUT recalculating medians yet (reserving structure)
    const mergeStats = (statsA, statsB) => {
        if (!statsB) return statsA;
        if (!statsA) return statsB;

        const newCount = (statsA.count || 0) + (statsB.count || 0);
        if (newCount === 0) return statsA;

        // 加權平均計算
        const newAvgPrice = {};
        ['arithmetic', 'weighted'].forEach(type => {
            const priceA = statsA.avgPrice?.[type] || 0;
            const priceB = statsB.avgPrice?.[type] || 0;
            // Count weighting
            newAvgPrice[type] = (priceA * (statsA.count || 0) + priceB * (statsB.count || 0)) / newCount;
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
            // 佔位符，待 recalculateUnitPriceStats 填入
            medianPrice: 0,
            q1Price: 0,
            q3Price: 0
        };
    };

    const residentialStats = mergeStats(unitA.residentialStats, unitB.residentialStats);
    const officeStats = mergeStats(unitA.officeStats, unitB.officeStats);
    const storeStats = mergeStats(unitA.storeStats, unitB.storeStats);

    // Type Comparison Table 合併 (單純連接陣列)
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

// === 新增：重算單價分析的中位數與分位數 ===
function recalculateUnitPriceStats(unitAnalysis, transactions) {
    if (!unitAnalysis || !transactions || transactions.length === 0) return;

    // 1. 分類交易數據
    const residentialTx = [];
    const officeTx = [];
    const storeTx = [];

    // 需對應後端的 getRoomCategory 邏輯
    // 這裡進行簡易分類 (需與後端保持一致)
    transactions.forEach(record => {
        const type = record['建物型態'];
        const usage = record['主要用途'];
        const unitPrice = record['房屋單價(萬)'];

        if (typeof unitPrice !== 'number' || unitPrice <= 0) return;

        // 簡易分類邏輯 (參考 analysis-engine.ts)
        // 店舖
        if (type?.includes('店') || usage === '商業用' || record['備註']?.includes('店')) {
            storeTx.push(unitPrice);
            return;
        }

        // 辦公
        if (type?.includes('辦公') || type?.includes('廠辦') || type?.includes('事務所') || usage?.includes('辦公')) {
            officeTx.push(unitPrice);
            return;
        }

        // 住宅 (預設)
        residentialTx.push(unitPrice);
    });

    // 2. 計算並更新
    if (unitAnalysis.residentialStats) updateQuantiles(unitAnalysis.residentialStats, residentialTx);
    if (unitAnalysis.officeStats) updateQuantiles(unitAnalysis.officeStats, officeTx);
    if (unitAnalysis.storeStats) updateQuantiles(unitAnalysis.storeStats, storeTx);
}

function updateQuantiles(statsObj, prices) {
    if (!prices || prices.length === 0) {
        statsObj.medianPrice = 0;
        statsObj.q1Price = 0;
        statsObj.q3Price = 0;
        return;
    }

    // 排序
    prices.sort((a, b) => a - b);

    statsObj.medianPrice = calculateQuantile(prices, 0.5);
    statsObj.q1Price = calculateQuantile(prices, 0.25);
    statsObj.q3Price = calculateQuantile(prices, 0.75);
}

function calculateQuantile(sortedArr, q) {
    const pos = (sortedArr.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sortedArr[base + 1] !== undefined) {
        return parseFloat((sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base])).toFixed(2));
    } else {
        return parseFloat(sortedArr[base].toFixed(2));
    }
}
// === 結束新增 ===

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
            const totalCount = existing.count + item.count;
            const totalTx = existing.transactionCount + item.transactionCount;

            const priceA = existing.avgPrice;
            const priceB = item.avgPrice;
            const newAvg = totalTx > 0 ? (priceA * existing.transactionCount + priceB * item.transactionCount) / totalTx : 0;

            existing.count = totalCount;
            existing.transactionCount = totalTx;
            existing.avgPrice = newAvg;
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

            if (item.rawRecords) {
                existing.rawRecords = [...(existing.rawRecords || []), ...item.rawRecords];
            }

            const newAvg = newCount > 0 ? (existing.avgPrice * existing.count + item.avgPrice * item.count) / newCount : 0;

            existing.count = newCount;
            existing.avgPrice = newAvg;
            existing.minPrice = Math.min(existing.minPrice, item.minPrice);
            existing.maxPrice = Math.max(existing.maxPrice, item.maxPrice);

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

    // 2. 合併各個視圖
    const views = ['monthly', 'quarterly', 'yearly', 'weekly'];
    const mergedViews = {};

    views.forEach(view => {
        const viewDataA = velA[view] || {};
        const viewDataB = velB[view] || {};
        const mergedTimeKeys = {};
        const allTimeKeys = new Set([...Object.keys(viewDataA), ...Object.keys(viewDataB)]);

        allTimeKeys.forEach(timeKey => {
            const timeObjA = viewDataA[timeKey] || {};
            const timeObjB = viewDataB[timeKey] || {};
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

    return {
        allRoomTypes,
        ...mergedViews
    };
}

// 修正 Area Distribution 合併
function aggregateAreaDistributionAnalysis(distA, distB) {
    if (!distB) return distA;
    if (!distA) return distB;
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

    const projectNames = [...(gridA.projectNames || []), ...(gridB.projectNames || [])];
    const byProject = { ...(gridA.byProject || {}), ...(gridB.byProject || {}) };

    return {
        projectNames,
        byProject
    };
}
