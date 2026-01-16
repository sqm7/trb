
import { AnalysisResult } from '@/types';

/**
 * js/modules/aggregator.js -> src/lib/aggregator.ts
 * Responsible for merging analysis results from multiple counties.
 */

export function aggregateAnalysisData(currentTotal: AnalysisResult | null, newData: AnalysisResult): AnalysisResult {
    if (!newData) return currentTotal as AnalysisResult;
    // Note: Cast is needed if return type strictness varies, but with same type it should be fine.
    if (!currentTotal) {
        // Deep copy to avoid side effects
        return JSON.parse(JSON.stringify(newData));
    }

    // 0. Merge Raw Transaction Details
    if (newData.transactionDetails && Array.isArray(newData.transactionDetails)) {
        if (!currentTotal.transactionDetails) currentTotal.transactionDetails = [];
        currentTotal.transactionDetails = [...currentTotal.transactionDetails, ...newData.transactionDetails];
    }

    // 1. Merge Core Metrics
    currentTotal.coreMetrics = aggregateCoreMetrics(currentTotal.coreMetrics, newData.coreMetrics);

    // 2. Merge Project Ranking
    if (newData.projectRanking && Array.isArray(newData.projectRanking)) {
        currentTotal.projectRanking = [...currentTotal.projectRanking, ...newData.projectRanking];
    }

    // 3. Merge Price Band Analysis
    currentTotal.priceBandAnalysis = aggregatePriceBandAnalysis(currentTotal.priceBandAnalysis, newData.priceBandAnalysis);

    // 4. Merge Unit Price Analysis
    currentTotal.unitPriceAnalysis = aggregateUnitPriceAnalysis(currentTotal.unitPriceAnalysis, newData.unitPriceAnalysis);

    // Recalculate medians if transactions exist
    if (currentTotal.transactionDetails && currentTotal.transactionDetails.length > 0) {
        recalculateUnitPriceStats(currentTotal.unitPriceAnalysis, currentTotal.transactionDetails);
    }

    // 5. Merge Parking Analysis
    currentTotal.parkingAnalysis = aggregateParkingAnalysis(currentTotal.parkingAnalysis, newData.parkingAnalysis);

    // 6. Merge Sales Velocity Analysis
    currentTotal.salesVelocityAnalysis = aggregateSalesVelocityAnalysis(currentTotal.salesVelocityAnalysis, newData.salesVelocityAnalysis);

    // 7. Merge Price Grid Analysis
    currentTotal.priceGridAnalysis = aggregatePriceGridAnalysis(currentTotal.priceGridAnalysis, newData.priceGridAnalysis);

    // 8. Merge Area Distribution Analysis
    currentTotal.areaDistributionAnalysis = aggregateAreaDistributionAnalysis(currentTotal.areaDistributionAnalysis, newData.areaDistributionAnalysis);

    return currentTotal;
}

function aggregateCoreMetrics(metricsA: any, metricsB: any) {
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
        medianPrice: 0, // Difficult to recalculate without raw data
        q1Price: 0,
        q3Price: 0,
        minPrice: Math.min(metricsA.minPrice || Infinity, metricsB.minPrice || Infinity),
        maxPrice: Math.max(metricsA.maxPrice || 0, metricsB.maxPrice || 0)
    };
}


function aggregatePriceBandAnalysis(bandsA: any, bandsB: any) {
    if (!bandsB) return bandsA;

    // Normalize: Handle both array format (legacy) and object format
    const detailsA = Array.isArray(bandsA) ? bandsA : (bandsA?.details || []);
    const detailsB = Array.isArray(bandsB) ? bandsB : (bandsB?.details || []);

    const crossTableA = bandsA?.locationCrossTable || {};
    const crossTableB = bandsB?.locationCrossTable || {};
    const districtsA = bandsA?.allDistricts || [];
    const districtsB = bandsB?.allDistricts || [];
    const roomTypesA = bandsA?.allRoomTypes || [];
    const roomTypesB = bandsB?.allRoomTypes || [];

    const bandMap = new Map();

    const addToMap = (item: any) => {
        // Robust Key Generation: Ensure bathrooms is treated consistently
        const baths = (item.bathrooms !== null && item.bathrooms !== undefined) ? String(item.bathrooms) : 'null';
        // Normalize roomType: remove all whitespace to match frontend 'selectedRoomTypes'
        const normalizedRoomType = (item.roomType || '').replace(/\s+/g, '');
        const key = `${normalizedRoomType}-${baths}`;

        // Ensure numeric values
        const itemCount = Number(item.count) || 0;
        const itemAvg = Number(item.avgPrice) || 0;
        const itemMin = Number(item.minPrice) || 0;
        const itemMax = Number(item.maxPrice) || 0;

        if (!bandMap.has(key)) {
            bandMap.set(key, {
                ...item,
                roomType: normalizedRoomType, // Store normalized value for frontend filtering
                count: itemCount,
                avgPrice: itemAvg,
                minPrice: itemMin,
                maxPrice: itemMax,
                projectNames: item.projectNames ? [...item.projectNames] : [],
                byDistrict: item.byDistrict ? { ...item.byDistrict } : {}
            });
        } else {
            const existing = bandMap.get(key);

            const existingCount = Number(existing.count) || 0;
            const existingAvg = Number(existing.avgPrice) || 0;

            const totalAmountA = existingAvg * existingCount;
            const totalAmountB = itemAvg * itemCount;
            const newCount = existingCount + itemCount;
            const newAvgPrice = newCount > 0 ? (totalAmountA + totalAmountB) / newCount : 0;

            existing.count = newCount;
            existing.avgPrice = parseFloat(newAvgPrice.toFixed(2));
            existing.minPrice = Math.min(existing.minPrice, itemMin);
            existing.maxPrice = Math.max(existing.maxPrice, itemMax);

            if (item.projectNames) {
                const newProjectNames = new Set([...existing.projectNames, ...item.projectNames]);
                existing.projectNames = Array.from(newProjectNames);
            }

            if (item.byDistrict) {
                Object.entries(item.byDistrict).forEach(([district, count]) => {
                    existing.byDistrict[district] = ((existing.byDistrict[district] as number) || 0) + (count as number);
                });
            }
        }
    };

    detailsA.forEach(addToMap);
    detailsB.forEach(addToMap);

    const mergedCrossTable = { ...crossTableA };
    Object.entries(crossTableB).forEach(([roomType, districtCounts]) => {
        if (!mergedCrossTable[roomType]) {
            mergedCrossTable[roomType] = { ...(districtCounts as any) };
        } else {
            Object.entries(districtCounts as any).forEach(([district, count]) => {
                mergedCrossTable[roomType][district] = (mergedCrossTable[roomType][district] || 0) + (count as number);
            });
        }
    });

    const mergedDistricts = Array.from(new Set([...districtsA, ...districtsB])).sort();
    const mergedRoomTypes = Array.from(new Set([...roomTypesA, ...roomTypesB])).sort();

    return {
        details: Array.from(bandMap.values()),
        locationCrossTable: mergedCrossTable,
        allDistricts: mergedDistricts,
        allRoomTypes: mergedRoomTypes
    };
}

function aggregateUnitPriceAnalysis(unitA: any, unitB: any) {
    if (!unitB) return unitA;

    const mergeStats = (statsA: any, statsB: any) => {
        if (!statsB) return statsA;
        if (!statsA) return statsB;

        const newCount = (statsA.count || 0) + (statsB.count || 0);
        if (newCount === 0) return statsA;

        const newAvgPrice: any = { arithmetic: 0, weighted: 0 };

        // Helper to get price value safely
        const getPrice = (stats: any, type: string) => {
            if (typeof stats.avgPrice === 'number') {
                // If pure number, it's typically the arithmetic mean. 
                // For weighted, we might fall back to it if weighted is missing, 
                // but ideally weighted should be present.
                // If weighted is missing in source, use the number as fallback.
                return stats.weightedAvgPrice || stats.avgPrice;
            }
            return stats.avgPrice?.[type] || 0;
        };

        ['arithmetic', 'weighted'].forEach(type => {
            const priceA = getPrice(statsA, type);
            const priceB = getPrice(statsB, type);
            // Weighted average logic: (P1*N1 + P2*N2) / (N1+N2)
            newAvgPrice[type] = (priceA * (statsA.count || 0) + priceB * (statsB.count || 0)) / newCount;
        });

        const newMinPrice = Math.min(statsA.minPrice, statsB.minPrice);
        const newMaxPrice = Math.max(statsA.maxPrice, statsB.maxPrice);

        let minPriceProject = statsA.minPrice < statsB.minPrice ? statsA.minPriceProject : statsB.minPriceProject;
        let maxPriceProject = statsA.maxPrice > statsB.maxPrice ? statsA.maxPriceProject : statsB.maxPriceProject;

        return {
            count: newCount,
            avgPrice: newAvgPrice,
            minPrice: newMinPrice,
            maxPrice: newMaxPrice,
            minPriceProject,
            maxPriceProject,
            medianPrice: 0,
            q1Price: 0,
            q3Price: 0
        };
    };

    const residentialStats = mergeStats(unitA.residentialStats, unitB.residentialStats);
    const officeStats = mergeStats(unitA.officeStats, unitB.officeStats);
    const storeStats = mergeStats(unitA.storeStats, unitB.storeStats);

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

function recalculateUnitPriceStats(unitAnalysis: any, transactions: any[]) {
    if (!unitAnalysis || !transactions || transactions.length === 0) return;

    const residentialTx: number[] = [];
    const residentialSum: { price: number, area: number, count: number } = { price: 0, area: 0, count: 0 };
    const officeTx: number[] = [];
    const officeSum: { price: number, area: number, count: number } = { price: 0, area: 0, count: 0 };
    const storeTx: number[] = [];
    const storeSum: { price: number, area: number, count: number } = { price: 0, area: 0, count: 0 };

    transactions.forEach(record => {
        const type = record['建物型態'];
        const usage = record['主要用途'];
        const unitPrice = record['房屋單價(萬)'];
        const totalPrice = record['房屋總價(萬)'] || 0;
        const totalArea = record['建物移轉總面積'] || 0;

        if (typeof unitPrice !== 'number' || unitPrice <= 0) return;

        let targetTx = residentialTx;
        let targetSum = residentialSum;

        if (type?.includes('店') || usage === '商業用' || record['備註']?.includes('店')) {
            targetTx = storeTx;
            targetSum = storeSum;
        } else if (type?.includes('辦公') || type?.includes('廠辦') || type?.includes('事務所') || usage?.includes('辦公')) {
            targetTx = officeTx;
            targetSum = officeSum;
        }

        targetTx.push(unitPrice);
        targetSum.price += totalPrice;
        targetSum.area += totalArea;
        targetSum.count += 1;
    });

    const updateStats = (statsObj: any, tx: number[], sum: any) => {
        if (!statsObj) return;
        updateQuantiles(statsObj, tx);
        statsObj.count = sum.count;
        statsObj.avgPrice = sum.count > 0 ? tx.reduce((a, b) => a + b, 0) / sum.count : 0;
        statsObj.weightedAvgPrice = sum.area > 0 ? sum.price / sum.area : 0;
    };

    if (unitAnalysis.residentialStats) updateStats(unitAnalysis.residentialStats, residentialTx, residentialSum);
    if (unitAnalysis.officeStats) updateStats(unitAnalysis.officeStats, officeTx, officeSum);
    if (unitAnalysis.storeStats) updateStats(unitAnalysis.storeStats, storeTx, storeSum);

    // Rebuild Type Comparison Table from Transactions
    const projectMap = new Map<string, {
        resSum: { price: number, area: number, count: number },
        shopSum: { price: number, area: number, count: number },
        officeSum: { price: number, area: number, count: number },
        county: string,
        district: string
    }>();

    transactions.forEach(record => {
        const projectName = record['建案名稱'];
        if (!projectName) return;

        if (!projectMap.has(projectName)) {
            projectMap.set(projectName, {
                resSum: { price: 0, area: 0, count: 0 },
                shopSum: { price: 0, area: 0, count: 0 },
                officeSum: { price: 0, area: 0, count: 0 },
                county: record['縣市'],
                district: record['行政區']
            });
        }

        const stats = projectMap.get(projectName)!;
        const type = record['建物型態'];
        const usage = record['主要用途'];
        const unitPrice = record['房屋單價(萬)'];
        const totalPrice = record['房屋總價(萬)'] || 0;
        const totalArea = record['建物移轉總面積'] || 0;

        if (typeof unitPrice !== 'number' || unitPrice <= 0) return;

        if (type?.includes('店') || usage === '商業用' || record['備註']?.includes('店')) {
            stats.shopSum.price += totalPrice;
            stats.shopSum.area += totalArea;
            stats.shopSum.count += 1;
        } else if (type?.includes('辦公') || type?.includes('廠辦') || type?.includes('事務所') || usage?.includes('辦公')) {
            stats.officeSum.price += totalPrice;
            stats.officeSum.area += totalArea;
            stats.officeSum.count += 1;
        } else {
            stats.resSum.price += totalPrice;
            stats.resSum.area += totalArea;
            stats.resSum.count += 1;
        }
    });

    const newTypeComparison: any[] = [];
    projectMap.forEach((stats, projectName) => {
        // Calculate Weighted Averages (or fall back to arithmetic if needed, but weighted is better for this)
        const residentialAvg = stats.resSum.area > 0 ? stats.resSum.price / stats.resSum.area : 0;
        const shopAvg = stats.shopSum.area > 0 ? stats.shopSum.price / stats.shopSum.area : 0;
        const officeAvg = stats.officeSum.area > 0 ? stats.officeSum.price / stats.officeSum.area : 0;

        if (residentialAvg > 0 && (shopAvg > 0 || officeAvg > 0)) {
            newTypeComparison.push({
                projectName,
                county: stats.county,
                district: stats.district,
                residentialAvg,
                shopAvg,
                officeAvg,
                shopMultiple: residentialAvg > 0 ? shopAvg / residentialAvg : 0,
                officeMultiple: residentialAvg > 0 ? officeAvg / residentialAvg : 0
            });
        }
    });

    // Sort by project name
    newTypeComparison.sort((a, b) => a.projectName.localeCompare(b.projectName));
    unitAnalysis.typeComparison = newTypeComparison;
}

function updateQuantiles(statsObj: any, prices: number[]) {
    if (!prices || prices.length === 0) {
        statsObj.medianPrice = 0;
        statsObj.q1Price = 0;
        statsObj.q3Price = 0;
        return;
    }

    prices.sort((a, b) => a - b);

    statsObj.medianPrice = calculateQuantile(prices, 0.5);
    statsObj.q1Price = calculateQuantile(prices, 0.25);
    statsObj.q3Price = calculateQuantile(prices, 0.75);
}

function calculateQuantile(sortedArr: number[], q: number) {
    const pos = (sortedArr.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sortedArr[base + 1] !== undefined) {
        return parseFloat((sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base])).toFixed(2));
    } else {
        return parseFloat(sortedArr[base].toFixed(2));
    }
}

function aggregateParkingAnalysis(parkA: any, parkB: any) {
    if (!parkB) return parkA;

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

    const typeMap = new Map();
    const mergeTypeItem = (item: any) => {
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

    const floorMap = new Map();
    const mergeFloorItem = (item: any) => {
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

function aggregateSalesVelocityAnalysis(velA: any, velB: any) {
    if (!velB) return velA;

    const allRoomTypes: any = Array.from(new Set([...(velA.allRoomTypes || []), ...(velB.allRoomTypes || [])]));
    const views = ['monthly', 'quarterly', 'yearly', 'weekly'];
    const mergedViews: any = {};

    views.forEach(view => {
        const viewDataA = velA[view] || {};
        const viewDataB = velB[view] || {};
        const mergedTimeKeys: any = {};
        const allTimeKeys = new Set([...Object.keys(viewDataA), ...Object.keys(viewDataB)]);

        allTimeKeys.forEach(timeKey => {
            const timeObjA = viewDataA[timeKey] || {};
            const timeObjB = viewDataB[timeKey] || {};
            const allRooms = new Set([...Object.keys(timeObjA), ...Object.keys(timeObjB)]);
            const mergedRooms: any = {};

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

function aggregateAreaDistributionAnalysis(distA: any, distB: any) {
    if (!distB) return distA;
    if (!distA) return distB;

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

function aggregatePriceGridAnalysis(gridA: any, gridB: any) {
    if (!gridB) return gridA;

    const projectNames = [...(gridA.projectNames || []), ...(gridB.projectNames || [])];
    const byProject = { ...(gridA.byProject || {}), ...(gridB.byProject || {}) };

    return {
        projectNames,
        byProject
    };
}
