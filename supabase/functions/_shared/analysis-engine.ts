// supabase/functions/_shared/analysis-engine.ts

/**
 * 將字串標準化：轉換為半形、大寫，並移除所有空白字元
 * @param str - 輸入的原始字串
 * @returns 標準化後的字串
 */
function normalizeString(str: string | null | undefined): string {
    if (!str) return '';
    return str
        .normalize('NFKC') // 將全形字元轉換為半形
        .toUpperCase()      // 轉換為大寫以便統一比對
        .replace(/\s+/g, ''); // 移除所有空白字元 (包括全形空格)
}

/**
 * 計算給定陣列的特定分位數值
 * @param sortedArr - 一個已經排序好的數字陣列
 * @param q - 要計算的分位數 (例如 0.25 代表 Q1)
 * @returns 計算後的分位數值
 */
export function calculateQuantile(sortedArr: number[], q: number): number {
    if (!sortedArr.length) return 0;
    const pos = (sortedArr.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sortedArr[base + 1] !== undefined) {
        return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
    } else {
        return sortedArr[base];
    }
}

/**
 * 安全的除法函式，避免分母為 0 或 null/undefined 時產生錯誤
 * @param numerator - 分子
 * @param denominator - 分母
 * @returns 計算結果，若分母為 0 則回傳 0
 */
export function safeDivide(numerator: number, denominator: number): number {
    if (denominator === 0 || !denominator) return 0;
    return numerator / denominator;
}

/**
 * 從 Supabase 自動分頁撈取所有資料，直到撈完為止
 * @param query - 一個 Supabase 的查詢物件 (QueryBuilder)
 * @returns 包含所有查詢結果的陣列
 */
export async function fetchAllData(query: any): Promise<any[]> {
    const allData = [];
    let page = 0;
    const pageSize = 1000; // 每次撈取 1000 筆
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1);
        if (error) throw new Error(`資料庫分頁查詢失敗: ${error.message}`);
        if (data && data.length > 0) {
            allData.push(...data);
            page++;
            if (data.length < pageSize) hasMore = false;
        } else {
            hasMore = false;
        }
    }
    return allData;
}


// --- 核心房型分類邏輯 ---

/**
 * @description 根據最新的多層級優先規則，為一筆交易紀錄進行房型分類。
 * @param record - 一筆交易資料，需包含 '戶別', '建物型態', '主要用途', '房數', '房屋面積(坪)' 等欄位。
 * @returns {string} - 分類後的房型名稱。
 */
export const getRoomCategory = (record: any): string => {
    // 【強化】在比對前進行標準化
    const unitName = normalizeString(record['戶別']);
    const buildingType = normalizeString(record['建物型態']);
    const mainPurpose = normalizeString(record['主要用途']);
    const rooms = record['房數'];
    const houseArea = record['房屋面積(坪)'];
    const floor = record['樓層'];
    const note = normalizeString(record['備註']);

    // ▼▼▼ 【最高優先級修正】▼▼▼
    // 優先級 1: 只要滿足任何一項關於「店舖」的定義，就立刻回傳，不再往下判斷。
    if (
        buildingType.includes('店舖') || buildingType.includes('店面') || buildingType.includes('店鋪') ||
        unitName.includes('店舖') || unitName.includes('店面') || unitName.includes('店鋪') ||
        note.includes('店面') || note.includes('店舖') || note.includes('店鋪') ||
        (mainPurpose === '商業用' && String(floor) === '1') ||
        (mainPurpose === '住商用' && String(floor) === '1') ||
        (buildingType.includes('住宅大樓') && unitName.includes('S')) ||
        (buildingType.includes('住宅大樓') && String(floor) === '1' && rooms === 0)
    ) {
        return '店舖';
    }

    // 優先級 2: 判斷是否為「辦公/事務所」或「廠辦/工廠」
    if (unitName.includes('事務所') || unitName.includes('辦公')) return '辦公/事務所';
    if (buildingType.includes('工廠') || buildingType.includes('倉庫') || buildingType.includes('廠辦')) return '廠辦/工廠';
    if (mainPurpose.includes('商業') || buildingType.includes('辦公') || buildingType.includes('事務所')) return '辦公/事務所';
    // ▲▲▲ 【修改結束】 ▲▲▲

    // 優先級 3：特殊住宅格局 (0房)
    const isResidentialBuilding = buildingType.includes('住宅大樓') || buildingType.includes('華廈');
    if (isResidentialBuilding && rooms === 0) {
        if (houseArea > 35) return '毛胚';
        if (houseArea <= 35) return '套房';
    }

    // 優先級 4：標準住宅房型
    if (typeof rooms === 'number' && !isNaN(rooms)) {
        if (rooms === 1) return '1房';
        if (rooms === 2) return '2房';
        if (rooms === 3) return '3房';
        if (rooms === 4) return '4房';
        if (rooms >= 5) return '5房以上';
    }

    return '其他';
};

// --- 新增的輔助函式：計算一組交易數據的詳細統計資料 ---
function calculateStats(transactions: any[], finalUnitIds: Map<string, string>) {
    const count = transactions.length;
    if (count === 0) {
        return {
            count: 0, avgPrice: { arithmetic: 0, weighted: 0 }, minPrice: 0, maxPrice: 0, medianPrice: 0, q1Price: 0, q3Price: 0,
            minPriceProject: null, maxPriceProject: null, minPriceUnit: null, maxPriceUnit: null, minPriceFloor: null, maxPriceFloor: null
        };
    }

    const validTransactions = transactions.filter(t => typeof t['房屋單價(萬)'] === 'number' && t['房屋單價(萬)'] > 0);
    if (validTransactions.length === 0) {
        return { ...calculateStats([], finalUnitIds), count };
    }

    const prices = validTransactions.map(t => t['房屋單價(萬)']);
    const sortedPrices = [...prices].sort((a, b) => a - b);

    const totalHousePrice = validTransactions.reduce((sum, t) => sum + (t['房屋總價(萬)'] || 0), 0);
    const totalHouseArea = validTransactions.reduce((sum, t) => sum + (t['房屋面積(坪)'] || 0), 0);
    const totalUnitPriceSum = prices.reduce((sum, p) => sum + p, 0);

    const sortedByPrice = [...validTransactions].sort((a, b) => a['房屋單價(萬)'] - b['房屋單價(萬)']);
    const minPriceRecord = sortedByPrice[0];
    const maxPriceRecord = sortedByPrice[sortedByPrice.length - 1];

    return {
        count,
        avgPrice: {
            arithmetic: safeDivide(totalUnitPriceSum, prices.length),
            weighted: safeDivide(totalHousePrice, totalHouseArea),
        },
        minPrice: minPriceRecord['房屋單價(萬)'],
        maxPrice: maxPriceRecord['房屋單價(萬)'],
        medianPrice: calculateQuantile(sortedPrices, 0.5),
        q1Price: calculateQuantile(sortedPrices, 0.25),
        q3Price: calculateQuantile(sortedPrices, 0.75),
        minPriceProject: minPriceRecord['建案名稱'],
        maxPriceProject: maxPriceRecord['建案名稱'],
        minPriceUnit: finalUnitIds.get(minPriceRecord['編號']) || null,
        maxPriceUnit: finalUnitIds.get(maxPriceRecord['編號']) || null,
        minPriceFloor: minPriceRecord['樓層'],
        maxPriceFloor: maxPriceRecord['樓層'],
    };
}


// --- 主要分析計算函式 ---

export function calculatePriceBandAnalysis(mainData: any[]) {
    const layoutGroups = new Map<string, { prices: number[], projectNames: Set<string> }>();

    for (const record of mainData) {
        const housePrice = record['房屋總價(萬)'];
        if (typeof housePrice !== 'number' || housePrice <= 0) continue;

        const roomCategoryResult = getRoomCategory(record);
        const bathrooms = record['衛浴數'] || 0;

        const layoutKey = /房|套房|毛胚/.test(roomCategoryResult)
            ? `${roomCategoryResult}-${bathrooms}衛`
            : roomCategoryResult;

        if (!layoutGroups.has(layoutKey)) {
            layoutGroups.set(layoutKey, { prices: [], projectNames: new Set() });
        }

        const group = layoutGroups.get(layoutKey)!;
        group.prices.push(housePrice);

        if (record['建案名稱']) {
            group.projectNames.add(record['建案名稱']);
        }
    }

    const priceBandAnalysis = Array.from(layoutGroups.entries()).map(([layoutKey, groupData]) => {
        const { prices, projectNames } = groupData;
        const parts = layoutKey.split('-');
        const roomType = parts[0];
        const bathrooms = parts.length > 1 && parts[1].includes('衛') ? parseInt(parts[1], 10) : null;

        const sortedPrices = [...prices].sort((a, b) => a - b);
        const sum = prices.reduce((a, b) => a + b, 0);

        return {
            roomType: roomType,
            bathrooms: bathrooms,
            count: prices.length,
            avgPrice: parseFloat(safeDivide(sum, prices.length).toFixed(2)),
            minPrice: sortedPrices[0],
            q1Price: calculateQuantile(sortedPrices, 0.25),
            medianPrice: calculateQuantile(sortedPrices, 0.5),
            q3Price: calculateQuantile(sortedPrices, 0.75),
            maxPrice: sortedPrices[sortedPrices.length - 1],
            projectNames: Array.from(projectNames)
        };
    });
    return priceBandAnalysis;
}


export function calculateUnitPriceAnalysis(mainData: any[], finalUnitIds: Map<string, string>) {
    const storeTransactions = mainData.filter(r => getRoomCategory(r) === '店舖');
    const officeTransactions = mainData.filter(r => getRoomCategory(r) === '辦公/事務所');
    const commercialTypes = ['店舖', '辦公/事務所', '廠辦/工廠'];
    const residentialTransactions = mainData.filter(r => {
        const category = getRoomCategory(r);
        const buildingType = normalizeString(r['建物型態']);
        const isResidentialBuilding = buildingType.includes('住宅大樓') || buildingType.includes('華廈');
        return isResidentialBuilding && !commercialTypes.includes(category);
    });

    const residentialStats = calculateStats(residentialTransactions, finalUnitIds);
    const officeStats = calculateStats(officeTransactions, finalUnitIds);
    const storeStats = calculateStats(storeTransactions, finalUnitIds);

    const residentialTypes = ['住宅大樓(11層含以上有電梯)', '華廈(10層含以下有電梯)'].map(normalizeString);
    const typeComparisonGroups = new Map<string, any>();
    for (const record of mainData) {
        const projectName = record['建案名稱'];
        const unitPrice = record['房屋單價(萬)'];
        if (!projectName || typeof unitPrice !== 'number' || unitPrice <= 0) continue;

        if (!typeComparisonGroups.has(projectName)) {
            typeComparisonGroups.set(projectName, { '住宅': { sum: 0, count: 0, totalPrice: 0, totalArea: 0 }, '店舖': { sum: 0, count: 0, totalPrice: 0, totalArea: 0 }, '辦公/事務所': { sum: 0, count: 0, totalPrice: 0, totalArea: 0 }, });
        }
        const group = typeComparisonGroups.get(projectName)!;

        const category = getRoomCategory(record);
        if (category === '店舖') {
            group['店舖'].sum += unitPrice; group['店舖'].count++; group['店舖'].totalPrice += record['房屋總價(萬)'] || 0; group['店舖'].totalArea += record['房屋面積(坪)'] || 0;
        } else if (category === '辦公/事務所') {
            group['辦公/事務所'].sum += unitPrice; group['辦公/事務所'].count++; group['辦公/事務所'].totalPrice += record['房屋總價(萬)'] || 0; group['辦公/事務所'].totalArea += record['房屋面積(坪)'] || 0;
        } else {
            const buildingType = normalizeString(record['建物型態']);
            if (residentialTypes.includes(buildingType)) {
                group['住宅'].sum += unitPrice; group['住宅'].count++; group['住宅'].totalPrice += record['房屋總價(萬)'] || 0; group['住宅'].totalArea += record['房屋面積(坪)'] || 0;
            }
        }
    }
    const typeComparison = Array.from(typeComparisonGroups.entries()).map(([projectName, group]) => {
        const residentialAvg = { arithmetic: safeDivide(group['住宅'].sum, group['住宅'].count), weighted: safeDivide(group['住宅'].totalPrice, group['住宅'].totalArea) };
        const shopAvg = { arithmetic: safeDivide(group['店舖'].sum, group['店舖'].count), weighted: safeDivide(group['店舖'].totalPrice, group['店舖'].totalArea) };
        const officeAvg = { arithmetic: safeDivide(group['辦公/事務所'].sum, group['辦公/事務所'].count), weighted: safeDivide(group['辦公/事務所'].totalPrice, group['辦公/事務所'].totalArea) };
        if (residentialAvg.weighted > 0 && (shopAvg.weighted > 0 || officeAvg.weighted > 0)) {
            return {
                projectName,
                residentialAvg,
                shopAvg,
                shopMultiple: parseFloat(safeDivide(shopAvg.weighted, residentialAvg.weighted).toFixed(2)),
                officeAvg,
                officeMultiple: parseFloat(safeDivide(officeAvg.weighted, residentialAvg.weighted).toFixed(2)),
            };
        }
        return null;
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    return {
        residentialStats,
        officeStats,
        storeStats,
        typeComparison
    };
}

// ▼▼▼ 【開始修改】 ▼▼▼
export function calculateParkingAnalysis(mainData: any[], parkDataMap: Map<string, any[]>, finalUnitIds: Map<string, string>) {
    const totalTransactions = mainData.length;
    const withParkingCount = mainData.filter(r => (r['車位數'] || 0) > 0).length;
    const withoutParkingCount = totalTransactions - withParkingCount;

    const parkingRatio = {
        withParking: { count: withParkingCount, percentage: safeDivide(withParkingCount, totalTransactions) * 100 },
        withoutParking: { count: withoutParkingCount, percentage: safeDivide(withoutParkingCount, totalTransactions) * 100 },
    };

    // 【修改點 1】車位類型統計：分離「總數統計」與「價格統計」
    const typeGroups = new Map<string, {
        prices: number[],
        transactionCount: number,     // 僅包含有效價格的交易筆數 (用於計算均價的樣本數)
        totalCount: number,           // 總車位數 (包含價格為0或無效的)
        totalTransactionCount: number,// 總交易筆數 (包含價格為0或無效的)
        priceTransactionIds: Set<string>, // 用於計算價格樣本的交易筆數
        allTransactionIds: Set<string>    // 用於計算總交易筆數
    }>();

    mainData.forEach(r => {
        const transactionId = r['編號'];
        const parkRecords = parkDataMap.get(transactionId);

        // 即便沒有附表資料，如果主表有車位類別，也應該納入計數 (視專案資料狀況而定)
        // 但目前的架構高度依賴 parkDataMap，所以若無附表資料則無法準確得知車位類型
        // 遍歷該交易的每一個車位（來自附表）
        if (parkRecords && parkRecords.length > 0) {
            for (const park of parkRecords) {
                // 優先使用附表的車位類別，若沒有則回退到主表
                const parkType = park['車位類別'] || r['車位類別'] || '未知';
                const price = park['車位價格(萬)'] || park['車位價格'];

                if (!typeGroups.has(parkType)) {
                    typeGroups.set(parkType, {
                        prices: [],
                        transactionCount: 0,
                        totalCount: 0,
                        totalTransactionCount: 0,
                        priceTransactionIds: new Set(),
                        allTransactionIds: new Set()
                    });
                }

                const group = typeGroups.get(parkType)!;

                // 1. 總數統計 (包含無效價格)
                group.totalCount += 1;
                if (!group.allTransactionIds.has(transactionId)) {
                    group.allTransactionIds.add(transactionId);
                    group.totalTransactionCount += 1;
                }

                // 2. 價格統計 (僅限有效價格)
                if (typeof price === 'number' && price > 0) {
                    group.prices.push(price);
                    if (!group.priceTransactionIds.has(transactionId)) {
                        group.priceTransactionIds.add(transactionId);
                        group.transactionCount += 1;
                    }
                }
            }
        } else if ((r['車位數'] || 0) > 0) {
            // 【補救措施】若無附表資料但主表有車位數，則使用主表資訊進行統計
            // 這種情況下我們無法得知個別車位的價格，只能進行「數量統計」
            // 且通常這類情況價格是打包在總價裡的，或是純粹漏了附表
            const parkType = r['車位類別'] || '未知';
            const count = r['車位數'];

            if (!typeGroups.has(parkType)) {
                typeGroups.set(parkType, {
                    prices: [],
                    transactionCount: 0,
                    totalCount: 0,
                    totalTransactionCount: 0,
                    priceTransactionIds: new Set(),
                    allTransactionIds: new Set()
                });
            }

            const group = typeGroups.get(parkType)!;

            // 1. 總數統計
            group.totalCount += count;
            if (!group.allTransactionIds.has(transactionId)) {
                group.allTransactionIds.add(transactionId);
                group.totalTransactionCount += 1;
            }

            // 2. 價格統計 - 因為沒有明細，無法拆分價格，故不計入價格統計
        }
    });

    const avgPriceByType = Array.from(typeGroups.entries()).map(([type, group]) => {
        const sortedPrices = [...group.prices].sort((a, b) => a - b);
        const sum = sortedPrices.reduce((acc, curr) => acc + curr, 0);

        // 確保如果沒有有效價格數據，統計值為 0
        const hasPrices = sortedPrices.length > 0;

        return {
            type,
            // 這些欄位用於 UI 顯示「總量」
            transactionCount: group.totalTransactionCount, // 使用總交易筆數
            count: group.totalCount,                       // 使用總車位數

            // 這些欄位是價格分析結果
            avgPrice: hasPrices ? safeDivide(sum, sortedPrices.length) : 0,
            medianPrice: hasPrices ? calculateQuantile(sortedPrices, 0.5) : 0,
            q3Price: hasPrices ? calculateQuantile(sortedPrices, 0.75) : 0,

            // 保留除錯或進階分析用的資訊
            validPriceCount: sortedPrices.length,
            validPriceTransactionCount: group.transactionCount
        };
    });

    const mapFloor = (floorStr: string | null): string => {
        if (!floorStr) return '未知';
        const str = String(floorStr).toUpperCase();
        if (str.includes('B1') || str.includes('地下一')) return 'B1';
        if (str.includes('B2') || str.includes('地下二')) return 'B2';
        if (str.includes('B3') || str.includes('地下三')) return 'B3';
        if (str.includes('B4') || str.includes('地下四')) return 'B4';
        if (str.includes('B5') || str.includes('地下五') || str.includes('B6') || str.includes('地下六') || str.includes('B7') || str.includes('地下七')) return 'B5_below';
        return '其他';
    };

    // 【修改點 2】樓層統計同樣分離總數與價格
    // 在樓層分析中，通常只關注有價格的車位分佈，但為了 3D 圖表的完整性，
    // 若有需要顯示「該樓層總車位數」可在此擴充。目前維持原邏輯，只統計有價格的以便計算均價，
    // 但若使用者希望看到包含無價格車位的數量，需進一步調整。
    // 基於本次需求主要針對「車位單價分析」表格，故樓層部分暫時維持僅統計有效價格，
    // 除非使用者明確反饋 3D 圖的數量也不對。
    // *修正策略*：為了保險起見，我們將樓層統計也改為「總數包含無效價格，均價排除無效價格」。

    const floorStats: Record<string, {
        prices: number[],
        records: { price: number; record: any }[], // 僅含有效價格記錄
        allCount: number, // 包含無效價格的總數
        rawRecords: any[]
    }> = {
        'B1': { prices: [], records: [], allCount: 0, rawRecords: [] },
        'B2': { prices: [], records: [], allCount: 0, rawRecords: [] },
        'B3': { prices: [], records: [], allCount: 0, rawRecords: [] },
        'B4': { prices: [], records: [], allCount: 0, rawRecords: [] },
        'B5_below': { prices: [], records: [], allCount: 0, rawRecords: [] },
        'Unknown': { prices: [], records: [], allCount: 0, rawRecords: [] }
    };

    const rampPlaneTransactions = mainData.filter(r => r['車位類別'] === '坡道平面'); // 在這裡先不嚴格過濾 parkDataMap.has，而在迴圈內檢查

    for (const transaction of rampPlaneTransactions) {
        const parkRecords = parkDataMap.get(transaction['編號']) || [];

        if (parkRecords.length > 0) {
            for (const park of parkRecords) {
                const floorKey = mapFloor(park['車位樓層']);

                // 如果是其他，歸類到 Unknown，不要丟棄
                const targetKey = (floorKey === '未知' || floorKey === '其他') ? 'Unknown' : floorKey;

                // 1. 總數累加 (不管有無價格)
                floorStats[targetKey].allCount += 1;

                // 2. 記錄原始資料
                floorStats[targetKey].rawRecords.push({
                    transactionId: transaction['編號'],
                    parkingPrice: park['車位價格(萬)'] || park['車位價格'] || 0,
                    parkingArea: park['車位面積(坪)'] || 0,
                });

                // 3. 價格統計 (僅限有效價格)
                const price = park['車位價格(萬)'] || park['車位價格'];
                if (typeof price === 'number' && price > 0) {
                    floorStats[targetKey].prices.push(price);
                    floorStats[targetKey].records.push({ price: price, record: transaction });
                }
            }
        } else if ((transaction['車位數'] || 0) > 0) {
            // 【補救措施】主表有車位但無附表 -> 歸類為 Unknown
            const count = transaction['車位數'];
            floorStats['Unknown'].allCount += count;

            // 無法得知價格，故只加總數
            for (let k = 0; k < count; k++) {
                floorStats['Unknown'].rawRecords.push({
                    transactionId: transaction['編號'],
                    parkingPrice: 0,
                    parkingArea: 0,
                });
            }
        }
    }

    const rampPlanePriceByFloor = Object.entries(floorStats).map(([floor, data]) => {
        // 使用 allCount 作為顯示數量
        const count = data.allCount;

        if (count === 0) {
            return {
                floor, count: 0, avgPrice: 0, medianPrice: 0, q3Price: 0, maxPrice: 0, minPrice: 0,
                maxPriceProject: null, minPriceUnit: null, maxPriceFloor: null, minPriceFloor: null,
                rawRecords: []
            };
        }

        const sortedPrices = data.prices.sort((a, b) => a - b);
        const hasPrices = sortedPrices.length > 0;

        // 計算統計數字 (僅基於有效價格)
        const avgPrice = hasPrices ? safeDivide(sortedPrices.reduce((a, b) => a + b, 0), sortedPrices.length) : 0;
        const medianPrice = hasPrices ? calculateQuantile(sortedPrices, 0.5) : 0;
        const q3Price = hasPrices ? calculateQuantile(sortedPrices, 0.75) : 0;

        // 為了找最大最小值的詳細資訊，我們需要回頭找 records
        // 注意：data.records 已經是有效價格的子集
        const sortedRecords = data.records.sort((a, b) => a.price - b.price);
        const minRecord = sortedRecords.length > 0 ? sortedRecords[0] : null;
        const maxRecord = sortedRecords.length > 0 ? sortedRecords[sortedRecords.length - 1] : null;

        return {
            floor,
            count: count, // 這是包含無效價格的總數
            avgPrice,
            medianPrice,
            q3Price,
            maxPrice: maxRecord ? maxRecord.price : 0,
            maxPriceProject: maxRecord ? maxRecord.record['建案名稱'] : null,
            maxPriceUnit: maxRecord ? finalUnitIds.get(maxRecord.record['編號']) || null : null,
            maxPriceFloor: maxRecord ? maxRecord.record['樓層'] : null,
            minPrice: minRecord ? minRecord.price : 0,
            minPriceProject: minRecord ? minRecord.record['建案名稱'] : null,
            minPriceUnit: minRecord ? finalUnitIds.get(minRecord.record['編號']) || null : null,
            minPriceFloor: minRecord ? minRecord.record['樓層'] : null,
            rawRecords: data.rawRecords
        };
    });

    return { parkingRatio, avgPriceByType, rampPlanePriceByFloor };
}
// ▲▲▲ 【修改結束】 ▲▲▲

export function calculateSalesVelocity(allRawData: any[]) {
    const getWeekLabel = (date: Date): string => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    };

    const velocityData: any = { weekly: {}, monthly: {}, quarterly: {}, yearly: {}, allRoomTypes: new Set<string>() };
    const initPeriodData = () => ({ count: 0, priceSum: 0, areaSum: 0 });

    for (const record of allRawData) {
        if (!record['交易日'] || !record['交易總價(萬)'] || !record['房屋面積(坪)']) continue;
        const transactionDate = new Date(record['交易日']);
        if (isNaN(transactionDate.getTime())) continue;

        const roomCategory = getRoomCategory(record); // <-- 使用統一的分類函式
        velocityData.allRoomTypes.add(roomCategory);

        const year = transactionDate.getFullYear();
        const month = String(transactionDate.getMonth() + 1).padStart(2, '0');
        const quarter = Math.floor(transactionDate.getMonth() / 3) + 1;
        const timeKeys = { weekly: getWeekLabel(transactionDate), monthly: `${year}-${month}`, quarterly: `${year}-Q${quarter}`, yearly: String(year) };

        for (const [view, timeKey] of Object.entries(timeKeys)) {
            if (!velocityData[view][timeKey]) velocityData[view][timeKey] = {};
            if (!velocityData[view][timeKey][roomCategory]) velocityData[view][timeKey][roomCategory] = initPeriodData();
            const stats = velocityData[view][timeKey][roomCategory];
            stats.count += 1;
            stats.priceSum += record['交易總價(萬)'] || 0;
            stats.areaSum += record['房屋面積(坪)'] || 0;
        }
    }

    velocityData.allRoomTypes = Array.from(velocityData.allRoomTypes).sort((a, b) => {
        const sortOrder = ['套房', '1房', '2房', '3房', '4房', '5房以上', '毛胚', '店舖', '辦公/事務所', '工廠/倉庫', '其他'];
        const indexA = sortOrder.indexOf(a);
        const indexB = sortOrder.indexOf(b);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    return velocityData;
}


export function calculatePriceGridAnalysis(allRawData: any[], parkDataMap: Map<string, any[]>, finalUnitIds: Map<string, string>, userFloorPremium: number) {

    const performAnalysis = (projectData: any[], projectUnitIds: Map<string, string>, averageFloorPremium: number) => {

        const summary = { totalBaselineHousePrice: 0, totalActualHousePrice: 0, totalPricePremiumValue: 0, totalSoldArea: 0, transactionCount: 0 };
        const transactions = projectData.map(r => ({ ...r, unitType: projectUnitIds.get(r['編號']) || null }));
        const anchorPrices = new Map<string, { price: number, floor: number }>();
        const unitTypeGroups = new Map<string, any[]>();
        const excludedTypesForAnchor = ['店面', '店舖', '店鋪', '工廠', '倉庫', '辦公', '事務所', '廠辦']; // 補全店鋪
        transactions.forEach(t => { if (t.unitType) { if (!unitTypeGroups.has(t.unitType)) unitTypeGroups.set(t.unitType, []); unitTypeGroups.get(t.unitType)!.push(t); } });

        for (const [unitType, typeTransactions] of unitTypeGroups.entries()) {
            const eligibleTransactions = typeTransactions.filter(t =>
                !excludedTypesForAnchor.some(exType => (t['建物型態'] || '').includes(exType)) && // 確保建物型態不為空
                !(t['主要用途'] || '').includes('商業') && // 確保主要用途不為空
                typeof t['房屋單價(萬)'] === 'number' && t['房屋單價(萬)'] > 0
            );

            if (eligibleTransactions.length === 0) continue;
            const sortedTransactions = eligibleTransactions.sort((a, b) => new Date(a['交易日']).getTime() - new Date(b['交易日']).getTime());
            const firstSaleDate = new Date(sortedTransactions[0]['交易日']);
            const windowEndDate = new Date(firstSaleDate);
            windowEndDate.setDate(windowEndDate.getDate() + 14);
            const transactionsInWindow = sortedTransactions.filter(t => new Date(t['交易日']) <= windowEndDate);
            if (transactionsInWindow.length > 0) {
                let anchorRecord = transactionsInWindow[0];
                for (let i = 1; i < transactionsInWindow.length; i++) {
                    const currentRecord = transactionsInWindow[i];
                    const floorDifference = anchorRecord['樓層'] - currentRecord['樓層'];
                    const theoreticalPrice = anchorRecord['房屋單價(萬)'] - (floorDifference * averageFloorPremium);
                    if (currentRecord['房屋單價(萬)'] < theoreticalPrice) { anchorRecord = currentRecord; }
                }
                anchorPrices.set(unitType, { price: anchorRecord['房屋單價(萬)'], floor: anchorRecord['樓層'] });
            }
        }

        const unitTypeSummaries = new Map<string, { count: number; premiumValue: number; baselinePrice: number; soldArea: number; anchorInfo: { price: number; floor: number; } | null; }>();
        unitTypeGroups.forEach((_transactions, unitType) => { unitTypeSummaries.set(unitType, { count: 0, premiumValue: 0, baselinePrice: 0, soldArea: 0, anchorInfo: anchorPrices.get(unitType) || null }); });

        const horizontalGrid: Record<string, Record<string, any[]>> = {};
        const uniqueFloors = new Set<string>();
        const uniqueUnits = new Set<string>();

        transactions.forEach(r => {
            const floor = r['樓層'];
            const unitType = r.unitType;
            if (!floor || !unitType || typeof r['房屋單價(萬)'] !== 'number' || r['房屋單價(萬)'] <= 0) return;

            uniqueFloors.add(String(floor));
            uniqueUnits.add(unitType);

            if (!horizontalGrid[floor]) horizontalGrid[floor] = {};
            if (!horizontalGrid[floor][unitType]) horizontalGrid[floor][unitType] = [];

            const anchor = anchorPrices.get(unitType);
            let premium = null;
            let tooltip = `成交價: ${r['房屋單價(萬)'].toFixed(1)}萬`;

            const category = getRoomCategory(r);
            const isStorefront = category === '店舖';
            const isOffice = category === '辦公/事務所';

            if (isStorefront) {
                premium = null;
                tooltip = `店舖類型 - 成交價: ${r['房屋單價(萬)'].toFixed(1)}萬`;
            } else if (isOffice) {
                premium = null;
                tooltip = `辦公用途 - 成交價: ${r['房屋單價(萬)'].toFixed(1)}萬`;
            } else if (anchor) {
                const floorDifference = r['樓層'] - anchor.floor;
                const floorPriceAdjustment = floorDifference * averageFloorPremium;
                const theoreticalOpeningPrice = anchor.price + floorPriceAdjustment;
                const timePremiumValue = r['房屋單價(萬)'] - theoreticalOpeningPrice;
                premium = safeDivide(timePremiumValue, theoreticalOpeningPrice) * 100;
                tooltip = `成交價: ${r['房屋單價(萬)'].toFixed(1)}萬 | 基準價(${unitType}): ${anchor.price.toFixed(1)}萬 | 樓層調整: ${floorPriceAdjustment.toFixed(2)}萬 | 調價幅度: ${premium.toFixed(1)}%`;

                if (typeof r['房屋總價(萬)'] === 'number' && typeof r['房屋面積(坪)'] === 'number' && r['房屋面積(坪)'] > 0) {
                    const theoreticalHousePrice = theoreticalOpeningPrice * r['房屋面積(坪)'];
                    const pricePremiumInValue = r['房屋總價(萬)'] - theoreticalHousePrice;

                    summary.totalBaselineHousePrice += theoreticalHousePrice;
                    summary.totalActualHousePrice += r['房屋總價(萬)'];
                    summary.totalPricePremiumValue += pricePremiumInValue;
                    summary.totalSoldArea += r['房屋面積(坪)'];
                    summary.transactionCount += 1;

                    const unitSummary = unitTypeSummaries.get(unitType);
                    if (unitSummary) {
                        unitSummary.count += 1;
                        unitSummary.premiumValue += pricePremiumInValue;
                        unitSummary.baselinePrice += theoreticalHousePrice;
                        unitSummary.soldArea += r['房屋面積(坪)'];
                    }
                }
            } else {
                tooltip += ` (無合格基準戶可供比較)`;
            }

            const parkRecords = parkDataMap.get(r['編號']) || [];
            const parkPriceSum = parkRecords.reduce((sum, park) => sum + (park['車位價格(萬)'] || park['車位價格'] || 0), 0);

            horizontalGrid[floor][unitType].push({
                unitPrice: r['房屋單價(萬)'],
                transactionDate: r['交易日'],
                hasParking: (r['車位數'] || 0) > 0,
                premium: premium,
                isStorefront: isStorefront,
                isOffice: isOffice,
                tooltip: tooltip,
                remark: r['備註'] || '',
                tooltipInfo: {
                    totalPrice: r['交易總價(萬)'],
                    housePrice: r['房屋總價(萬)'],
                    houseArea: r['房屋面積(坪)'],
                    parkingPrice: parkPriceSum,
                    rooms: r['房數']
                }
            });
        });

        const anchorFloors = Array.from(anchorPrices.values()).map(a => a.floor);
        const floorCounts = anchorFloors.reduce((acc, floor) => { acc[floor] = (acc[floor] || 0) + 1; return acc; }, {} as Record<number, number>);
        const refFloor = parseInt(Object.entries(floorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '0');
        const horizontalComparisonData = Array.from(unitTypeSummaries.entries()).map(([unitType, uSummary]) => {
            let baselinePriceOnRefFloor: number | null = null;
            if (uSummary.anchorInfo && refFloor > 0) { baselinePriceOnRefFloor = uSummary.anchorInfo.price + (refFloor - uSummary.anchorInfo.floor) * averageFloorPremium; }
            return { unitType, ...uSummary, baselinePriceOnRefFloor };
        });
        if (refFloor > 0) {
            const validBaselines = horizontalComparisonData.map(d => d.baselinePriceOnRefFloor).filter((p): p is number => p !== null && p > 0);
            if (validBaselines.length > 0) {
                const minBaseline = Math.min(...validBaselines);
                horizontalComparisonData.forEach(d => { if (d.baselinePriceOnRefFloor) { (d as any).horizontalPriceDiff = d.baselinePriceOnRefFloor - minBaseline; } });
            }
        }
        const finalHorizontalComparison = horizontalComparisonData.map(d => ({
            unitType: d.unitType,
            anchorInfo: d.anchorInfo ? `F${d.anchorInfo.floor} / ${d.anchorInfo.price.toFixed(1)}萬` : '無',
            horizontalPriceDiff: (d as any).horizontalPriceDiff || null,
            unitsSold: d.count,
            timePremiumContribution: d.premiumValue,
            contributionPercentage: safeDivide(d.premiumValue, summary.totalPricePremiumValue) * 100,
            baselineHousePrice: d.baselinePrice,
            avgPriceAdjustment: safeDivide(d.premiumValue, d.soldArea)
        })).sort((a, b) => a.unitType.localeCompare(b.unitType, undefined, { numeric: true, sensitivity: 'base' }));
        const sortedFloors = Array.from(uniqueFloors).sort((a, b) => (parseInt(b) || 0) - (parseInt(a) || 0));
        const sortedUnits = Array.from(uniqueUnits).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        const colors = ['#374151', '#4b5563', '#52525b', '#3f3f46', '#1f2937', '#334155', '#475569', '#365314', '#14532d', '#064e3b', '#115e59', '#164e63', '#0c4a6e', '#1e3a8a', '#312e81', '#4c1d95', '#581c87', '#831843', '#881337', '#7f1d1d'];
        const unitColorMap: Record<string, string> = {};
        sortedUnits.forEach((unit, index) => { unitColorMap[unit] = colors[index % colors.length]; });
        return { horizontalGrid, sortedFloors, sortedUnits, unitColorMap, summary, horizontalComparison: finalHorizontalComparison, refFloorForComparison: refFloor };
    };

    const projects = new Map<string, any[]>();
    allRawData.forEach(r => { const projectName = r['建案名稱']; if (projectName) { if (!projects.has(projectName)) projects.set(projectName, []); projects.get(projectName)!.push(r); } });
    const byProjectAnalysis: Record<string, ReturnType<typeof performAnalysis>> = {};
    for (const [projectName, projectData] of projects.entries()) {
        const projectRecordIds = new Set(projectData.map(r => r['編號']));
        const projectUnitIds = new Map<string, string>();
        finalUnitIds.forEach((id, recordId) => { if (projectRecordIds.has(recordId)) { projectUnitIds.set(recordId, id); } });
        byProjectAnalysis[projectName] = performAnalysis(projectData, projectUnitIds, userFloorPremium);
    }
    const allProjectsAnalysis = performAnalysis(allRawData, finalUnitIds, userFloorPremium);
    return { allProjects: allProjectsAnalysis, byProject: byProjectAnalysis, projectNames: Array.from(projects.keys()).sort() };
}

export function calculateAreaDistribution(allRawData: any[]) {
    const distribution: Record<string, number[]> = {};

    for (const record of allRawData) {
        const houseArea = record['房屋面積(坪)'];
        if (typeof houseArea !== 'number' || houseArea <= 0) continue;
        const roomCategory = getRoomCategory(record);
        if (!distribution[roomCategory]) {
            distribution[roomCategory] = [];
        }
        distribution[roomCategory].push(houseArea);
    }
    for (const roomType in distribution) {
        distribution[roomType].sort((a, b) => a - b);
    }
    return distribution;
}