
/**
 * src/lib/heatmap-utils.ts
 * 負責將原始交易資料轉換為熱力圖所需的水平銷控表格式
 */

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

export function generateHeatmapData(projectTransactions: any[], floorPremiumPercent: number = 0.3): HeatmapOutput {
    // 1. Group by Floor and Unit
    const horizontalGrid: Record<string, Record<string, any[]>> = {};
    const floorsSet = new Set<string>();
    const unitsSet = new Set<string>();

    projectTransactions.forEach(tx => {
        // Safe property access
        let floor = tx['樓層'] || tx.floor || tx.layer;
        if (floor === undefined || floor === null) return; // Skip invalid records
        if (typeof floor === 'number') floor = String(floor);

        const unit = tx['戶別'] || tx['戶型'] || tx.unit || '?';

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

        horizontalGrid[floor][unit].push({
            ...tx,
            unitPrice,
            floor,
            unit,
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

    // 2. Identify Anchor (Baseline) Transactions
    let minPrice = Infinity;
    let anchorTx: any = null;

    projectTransactions.forEach(tx => {
        const mainPurpose = tx['主要用途'] || tx.mainPurpose || '';
        const buildingType = tx['建物型態'] || tx.buildingType || '';
        const note = tx['備註'] || tx.note || '';
        const unitPrice = parseFloat(tx['房屋單價(萬)'] || tx.unitPrice || 0);

        const isSpecial = mainPurpose.includes('商業') || buildingType.includes('店') || note.includes('特殊') || note.includes('親友');
        if (!isSpecial && unitPrice < minPrice && unitPrice > 0) {
            minPrice = unitPrice;
            anchorTx = tx;
        }
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

                if (anchorTx) {
                    // Theoretical price based on anchor
                    // Floor diff
                    const getFloorVal = (f: string) => f.startsWith('B') ? -parseInt(f.substring(1)) : parseInt(f);
                    const anchorFloorVal = getFloorVal(anchorTx['樓層'].toString());
                    const currentFloorVal = getFloorVal(tx.floor);
                    const floorDiff = currentFloorVal - anchorFloorVal;

                    // Theoretical Unit Price = Anchor Unit Price + (Floor Diff * Premium %)
                    // Wait, usually premium is percentage of BASE.
                    // Let's assume floor premium is % per floor.
                    // New Price = Old Price * (1 + rate)^diff ~ Old Price + Old Price * rate * diff
                    // Simplifed model: 
                    const floorAdjustment = floorDiff * floorPremiumPercent; // %

                    // Also need Unit Type adjustment?
                    // If we assume same unit type should have same price except floor...
                    // But we are comparing different units.

                    // If we treat the Anchor as THE baseline for the whole project:
                    const theoreticalPrice = anchorTx['房屋單價(萬)'] * (1 + floorAdjustment / 100);

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
        horizontalComparison: [], // TODO: Implement if needed
        refFloorForComparison: anchorTx ? anchorTx['樓層'] : '-'
    };
}
