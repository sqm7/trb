
/**
 * src/lib/heatmap-utils.ts
 * 負責將原始交易資料轉換為熱力圖所需的水平銷控表格式
 */
import { AdaptiveUnitResolver } from "@/lib/unit-parser";

export interface HeatmapDataInput {
    transactionDetails: any[];
}

interface HeatmapOutput {
    horizontalGrid: Record<string, Record<string, any[]>>; // [floor][unit] -> tx[]
    sortedFloors: string[];
    sortedUnits: string[];
    unitColorMap: Record<string, string>;
    summary: {
        totalBaselineHousePrice: number;
        totalPricePremiumValue: number;
        totalSoldArea: number;
        transactionCount: number;
    };
    horizontalComparison: any[];
    refFloorForComparison?: string;
}

export function generateHeatmapData(projectTransactions: any[], floorPremiumValue: number = 0.3, initialWindowDays: number = 14): HeatmapOutput {
    // 1. Group by Floor and Unit
    const horizontalGrid: Record<string, Record<string, any[]>> = {};
    const floorsSet = new Set<string>();
    const unitsSet = new Set<string>();

    // Initialize Unit Resolver with all transactions for context learning
    const unitResolver = new AdaptiveUnitResolver(projectTransactions);

    projectTransactions.forEach(tx => {
        // Safe property access
        let floor = tx['樓層'] || tx.floor || tx.layer;
        if (floor === undefined || floor === null) return; // Skip invalid records
        if (typeof floor === 'number') floor = String(floor);

        if (typeof floor === 'number') floor = String(floor);

        // Resolve Normalized Unit Name
        const unit = unitResolver.resolve(tx);
        // Fallback or keep raw if resolve returns empty? usually returns identifier.
        // If empty, fallback to raw? NO, resolver should handle fallback.
        // Original: const unit = tx['戶別'] || tx['戶型'] || tx.unit || '?';

        floorsSet.add(floor);
        unitsSet.add(unit);

        if (!horizontalGrid[floor]) horizontalGrid[floor] = {};
        if (!horizontalGrid[floor][unit]) horizontalGrid[floor][unit] = [];

        // Pre-calculate some fields
        const unitPrice = parseFloat(tx['房屋單價(萬)'] || tx.unitPrice || 0);
        const totalPrice = parseFloat(tx['交易總價(萬)'] || tx.totalPrice || 0);
        const housePrice = parseFloat(tx['房屋總價(萬)'] || tx.housePrice || 0);
        const parkingPrice = parseFloat(tx['車位總價(萬)'] || tx.parkingPrice || 0);
        const houseArea = parseFloat(tx['房屋面積(坪)'] || tx.houseArea || 0);
        const rooms = tx['房數'] || tx.rooms;

        const parkingType = tx['車位類別'] || tx.parkingType || '';
        const parkingCount = (typeof parkingType === 'string' && parkingType.includes('車位')) ? 1 : 0;

        const mainPurpose = tx['主要用途'] || tx.mainPurpose || '';
        const buildingType = tx['建物型態'] || tx.buildingType || '';

        const isStorefront = mainPurpose.includes('商業') || buildingType.includes('店') || mainPurpose.includes('店');
        const isOffice = mainPurpose.includes('辦公') || buildingType.includes('辦公') || buildingType.includes('事務所');

        const rawDate = tx['交易日'] || tx['交易年月日'] || tx.transactionDate || '';
        let formattedDate = rawDate;
        if (rawDate && /^\d{6,7}$/.test(String(rawDate))) {
            const s = String(rawDate);
            // 1120520 -> 112/05/20
            const yLen = s.length === 6 ? 2 : 3;
            formattedDate = `${s.substring(0, yLen)}/${s.substring(yLen, yLen + 2)}/${s.substring(yLen + 2)}`;
        }

        horizontalGrid[floor][unit].push({
            ...tx,
            unitPrice,
            floor,
            unit,
            transactionDate: formattedDate,
            isStorefront,
            isOffice,
            hasParking: parkingPrice > 0,
            tooltipInfo: {
                totalPrice,
                housePrice,
                parkingPrice,
                houseArea,
                rooms
            }
        });
    });

    if (floorsSet.size === 0) {
        // Return empty structure if no valid data
        return {
            horizontalGrid: {},
            sortedFloors: [],
            sortedUnits: [],
            unitColorMap: {},
            summary: { totalBaselineHousePrice: 0, totalPricePremiumValue: 0, totalSoldArea: 0, transactionCount: 0 },
            horizontalComparison: []
        };
    }

    // Sort floors (numeric desc, handled B1 etc)
    const sortedFloors = Array.from(floorsSet).sort((a, b) => {
        const getFloorVal = (f: string) => {
            if (!f) return 0;
            if (f.startsWith('B')) return -parseInt(f.substring(1));
            return parseInt(f) || 0;
        };
        return getFloorVal(b) - getFloorVal(a);
    });

    const sortedUnits = Array.from(unitsSet).sort();

    // 2. Identify Anchor (Baseline) Transactions per Unit Type
    const unitAnchors: Record<string, any> = {};

    // Helper: Parse ROC Date (e.g. "112/05/20") to JS Date
    const parseROCDate = (dateStr: string): Date | null => {
        if (!dateStr) return null;
        const cleanStr = dateStr.replace(/\//g, '');
        if (cleanStr.length < 6) return null;

        const yearLen = cleanStr.length === 6 ? 2 : 3;
        const yearROC = parseInt(cleanStr.substring(0, yearLen));
        const month = parseInt(cleanStr.substring(yearLen, yearLen + 2));
        const day = parseInt(cleanStr.substring(yearLen + 2));

        return new Date(1911 + yearROC, month - 1, day);
    };

    // Group by Unit first to find timeline
    const txByUnit: Record<string, any[]> = {};
    projectTransactions.forEach(tx => {
        const unit = unitResolver.resolve(tx);
        // Exclude specials here for anchor candidates
        const mainPurpose = tx['主要用途'] || tx.mainPurpose || '';
        const buildingType = tx['建物型態'] || tx.buildingType || '';
        const note = tx['備註'] || tx.note || '';
        const isSpecial = mainPurpose.includes('商業') || buildingType.includes('店') || note.includes('特殊') || note.includes('親友');
        const unitPrice = parseFloat(tx['房屋單價(萬)'] || tx.unitPrice || 0);

        if (!isSpecial && unitPrice > 0) {
            if (!txByUnit[unit]) txByUnit[unit] = [];
            txByUnit[unit].push(tx);
        }
    });

    Object.keys(txByUnit).forEach(unit => {
        const txs = txByUnit[unit];
        // Sort by Date ASC
        txs.sort((a, b) => {
            const dA = parseROCDate(a['交易年月日'] || a.transactionDate)?.getTime() || 9999999999999;
            const dB = parseROCDate(b['交易年月日'] || b.transactionDate)?.getTime() || 9999999999999;
            return dA - dB;
        });

        if (txs.length === 0) return;

        const firstDate = parseROCDate(txs[0]['交易年月日'] || txs[0].transactionDate);
        if (!firstDate) {
            // Fallback to lowest price if date parsing fails
            unitAnchors[unit] = txs.reduce((min, curr) =>
                parseFloat(curr['房屋單價(萬)']) < parseFloat(min['房屋單價(萬)']) ? curr : min
                , txs[0]);
            return;
        }

        // Define Window: First Date + N Days
        const windowLimit = new Date(firstDate);
        windowLimit.setDate(windowLimit.getDate() + initialWindowDays);

        // Filter Candidates in Initial Window
        const candidates = txs.filter(tx => {
            const d = parseROCDate(tx['交易年月日'] || tx.transactionDate);
            return d && d <= windowLimit;
        });

        // Find Best Normalized Value (Lowest Base Price)
        // Formula: NormalizedBase = ActualPrice - (FloorVal * Premium)
        // We want the one that implies the lowest "Zero Floor Base Price"
        let bestCandidate = candidates[0];
        let minNormalizedPrice = Infinity;

        candidates.forEach(tx => {
            const price = parseFloat(tx['房屋單價(萬)'] || 0);
            const getFloorVal = (f: string) => (!f) ? 0 : (f.startsWith('B') ? -parseInt(f.substring(1)) : parseInt(f));
            const floorVal = getFloorVal(String(tx['樓層']));

            // Adjusted Price (stripping away the floor premium)
            const normalizedBase = price - (floorVal * floorPremiumValue);

            if (normalizedBase < minNormalizedPrice) {
                minNormalizedPrice = normalizedBase;
                bestCandidate = tx;
            }
        });

        unitAnchors[unit] = bestCandidate;
    });

    // Calculate details
    let totalBaselineHousePrice = 0;
    let totalPricePremiumValue = 0;
    let totalSoldArea = 0;
    let transactionCount = 0;

    // We need to apply the logic to each cell
    Object.keys(horizontalGrid).forEach(floor => {
        Object.keys(horizontalGrid[floor]).forEach(unit => {
            horizontalGrid[floor][unit].forEach((tx: any, idx: number) => {
                // Determine premium
                let premium = null;
                const anchorTx = unitAnchors[unit]; // Get anchor specific to this unit type

                if (anchorTx) {
                    // Theoretical price based on anchor
                    // Floor diff
                    const getFloorVal = (f: string) => (!f) ? 0 : (f.startsWith('B') ? -parseInt(f.substring(1)) : parseInt(f));

                    const anchorFloorStr = String(anchorTx['樓層']);
                    const txFloorStr = String(tx.floor);

                    const anchorFloorVal = getFloorVal(anchorFloorStr);
                    const currentFloorVal = getFloorVal(txFloorStr);
                    const floorDiff = currentFloorVal - anchorFloorVal;

                    // Theoretical Unit Price = Anchor Unit Price + (Floor Diff * Premium Value)
                    // Premium Value IS ALREADY in Wan/Ping (e.g. 0.3, 0.5)
                    const floorAdjustment = floorDiff * floorPremiumValue;
                    const anchorPrice = parseFloat(anchorTx['房屋單價(萬)'] || anchorTx.unitPrice || 0);

                    const theoreticalPrice = anchorPrice + floorAdjustment;

                    // Premium = (Actual - Theoretical) / Theoretical * 100
                    if (theoreticalPrice > 0) {
                        premium = ((tx['房屋單價(萬)'] - theoreticalPrice) / theoreticalPrice) * 100;
                        // If it IS the anchor, premium is 0
                        if (tx === anchorTx || Math.abs(tx['房屋單價(萬)'] - theoreticalPrice) < 0.1) premium = 0;
                    }

                    // Accumulate summary stats (simplified)
                    if (tx.tooltipInfo.housePrice && tx.tooltipInfo.houseArea) {
                        const baselineHousePrice = (theoreticalPrice * tx.tooltipInfo.houseArea); // approx
                        totalBaselineHousePrice += baselineHousePrice;
                        totalPricePremiumValue += (tx.tooltipInfo.housePrice - baselineHousePrice);
                        totalSoldArea += tx.tooltipInfo.houseArea;
                        transactionCount++;
                    }
                }

                horizontalGrid[floor][unit][idx].premium = premium;
            });
        });
    });

    // Color map
    const unitColorMap: Record<string, string> = {};
    const colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#22d3ee', '#818cf8', '#c084fc', '#f472b6'];
    sortedUnits.forEach((u, i) => {
        unitColorMap[u] = colors[i % colors.length];
    });

    // 3. Horizontal Comparison (Unit Type Analysis)
    const unitTypeStats: Record<string, {
        totalPremium: number;
        totalSoldArea: number;
        count: number;
        anchorPrice: number | null;
        anchorFloor: string | null;
    }> = {};

    // Initialize map
    sortedUnits.forEach(u => {
        unitTypeStats[u] = { totalPremium: 0, totalSoldArea: 0, count: 0, anchorPrice: null, anchorFloor: null };
        const anchor = unitAnchors[u];
        if (anchor) {
            unitTypeStats[u].anchorPrice = parseFloat(anchor['房屋單價(萬)'] || 0);
            unitTypeStats[u].anchorFloor = String(anchor['樓層']);
        }
    });

    // Accumulate Stats
    Object.keys(horizontalGrid).forEach(floor => {
        Object.keys(horizontalGrid[floor]).forEach(unit => {
            horizontalGrid[floor][unit].forEach((tx: any) => {
                const anchorTx = unitAnchors[unit];
                if (tx.premium !== null && tx.tooltipInfo.housePrice && tx.tooltipInfo.houseArea && anchorTx) {
                    // Re-calculate theoretical price to ensure consistency
                    const getFloorVal = (f: string) => (!f) ? 0 : (f.startsWith('B') ? -parseInt(f.substring(1)) : parseInt(f));
                    const anchorFloorVal = getFloorVal(String(anchorTx['樓層']));
                    const currentFloorVal = getFloorVal(tx.floor);
                    const floorDiff = currentFloorVal - anchorFloorVal;

                    const floorAdjustment = floorDiff * floorPremiumValue;
                    const anchorPrice = parseFloat(anchorTx['房屋單價(萬)'] || anchorTx.unitPrice || 0);
                    const theoreticalPrice = anchorPrice + floorAdjustment;

                    if (theoreticalPrice > 0) {
                        const baselineHousePrice = (theoreticalPrice * tx.tooltipInfo.houseArea);
                        const premiumValue = tx.tooltipInfo.housePrice - baselineHousePrice;

                        if (unitTypeStats[unit]) {
                            unitTypeStats[unit].totalPremium += premiumValue;
                            unitTypeStats[unit].totalSoldArea += tx.tooltipInfo.houseArea;
                            unitTypeStats[unit].count++;
                        }
                    }
                }
            });
        });
    });

    const horizontalComparison = Object.keys(unitTypeStats).map(unit => {
        const stats = unitTypeStats[unit];
        if (stats.count === 0) return null;

        return {
            unitType: unit,
            anchorInfo: stats.anchorPrice ? `${stats.anchorFloor}F / ${stats.anchorPrice}萬` : 'N/A',
            horizontalPriceDiff: stats.totalSoldArea > 0 ? (stats.totalPremium / stats.totalSoldArea) : 0,
            unitsSold: stats.count,
            timePremiumContribution: stats.totalPremium,
            contributionPercentage: totalPricePremiumValue > 0 ? (stats.totalPremium / totalPricePremiumValue) * 100 : 0,
            baselineHousePrice: totalBaselineHousePrice,
            avgPriceAdjustment: stats.totalSoldArea > 0 ? (stats.totalPremium / stats.totalSoldArea) : 0
        };
    }).filter(Boolean);

    return {
        horizontalGrid,
        sortedFloors,
        sortedUnits,
        unitColorMap,
        summary: {
            totalBaselineHousePrice,
            totalPricePremiumValue,
            totalSoldArea,
            transactionCount
        },
        horizontalComparison
    };
}

/**
 * Calculates a suggested floor premium based on the median price difference between adjacent floors.
 */
export function calculateSuggestedFloorPremium(transactions: any[]): number {
    if (!transactions || transactions.length === 0) return 0.3; // Default fallback

    const unitResolver = new AdaptiveUnitResolver(transactions);
    const unitGroups: Record<string, any[]> = {};

    // Group by unit type
    transactions.forEach(tx => {
        const unit = unitResolver.resolve(tx);
        // Exclude special types for this calculation
        const mainPurpose = tx['主要用途'] || tx.mainPurpose || '';
        const buildingType = tx['建物型態'] || tx.buildingType || '';
        const note = tx['備註'] || tx.note || '';
        const isSpecial = mainPurpose.includes('商業') || buildingType.includes('店') || note.includes('特殊') || note.includes('親友');

        if (!isSpecial && parseFloat(tx['房屋單價(萬)']) > 0) {
            if (!unitGroups[unit]) unitGroups[unit] = [];
            unitGroups[unit].push(tx);
        }
    });

    const diffs: number[] = [];

    // Calculate diffs for each stack
    Object.values(unitGroups).forEach(group => {
        // Sort by floor numeric
        const getFloorVal = (f: string) => (!f) ? 0 : (f.startsWith('B') ? -parseInt(f.substring(1)) : parseInt(f));
        group.sort((a, b) => getFloorVal(String(a['樓層'])) - getFloorVal(String(b['樓層'])));

        for (let i = 0; i < group.length - 1; i++) {
            const current = group[i];
            const next = group[i + 1];
            const currentFloor = getFloorVal(String(current['樓層']));
            const nextFloor = getFloorVal(String(next['樓層']));

            const floorDiff = nextFloor - currentFloor;
            const priceDiff = parseFloat(next['房屋單價(萬)']) - parseFloat(current['房屋單價(萬)']);

            // Only consider adjacent floors or close enough (e.g. diff <= 3) to be representative
            // Actually, simply dividing priceDiff by floorDiff gives the "per floor" premium
            if (floorDiff > 0 && floorDiff <= 3) {
                const perFloorDiff = priceDiff / floorDiff;
                // Filter out extreme outliers (e.g. > 5万/ply or < -2万/ply)
                if (perFloorDiff > -2 && perFloorDiff < 10) {
                    diffs.push(perFloorDiff);
                }
            }
        }
    });

    if (diffs.length === 0) return 0.5; // Reasonable default if no data

    // Calculate Median
    diffs.sort((a, b) => a - b);
    const mid = Math.floor(diffs.length / 2);
    const median = diffs.length % 2 !== 0 ? diffs[mid] : (diffs[mid - 1] + diffs[mid]) / 2;

    // Return rounded to 2 decimals, minimum 0
    return Math.max(0, Math.round(median * 100) / 100);
}
