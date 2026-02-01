
/**
 * src/lib/room-utils.ts
 * 用於前端一致地判斷房型分類的工具函數
 */

export function getRoomType(record: any): string {
    // 為了與後端邏輯一致，也進行標準化處理
    const normalizeString = (str: any) => {
        if (!str) return '';
        return String(str).normalize('NFKC').toUpperCase().replace(/\s+/g, '');
    };

    // Support both API raw keys (Chinese) and normalized keys (CamelCase)
    const buildingType = normalizeString(record['建物型態'] || record.buildingType);
    const mainPurpose = normalizeString(record['主要用途'] || record.mainPurpose);
    const unitName = normalizeString(record['戶別'] || record.unit);

    const rooms = record['房數'] !== undefined ? record['房數'] : record.rooms;
    const houseArea = record['房屋面積(坪)'] !== undefined ? parseFloat(record['房屋面積(坪)']) : parseFloat(record.houseArea || 0);

    // 【新增規則】處理住宅大樓內含 'S' 的特殊店舖情況
    if (buildingType.includes('住宅大樓') && unitName.includes('S')) {
        return '店舖';
    }

    // 第零優先級：從「戶別」文字直接判斷 (補全關鍵字)
    if (unitName.includes('店舖') || unitName.includes('店面') || unitName.includes('店鋪')) return '店舖';
    if (unitName.includes('事務所') || unitName.includes('辦公')) return '辦公/事務所';

    // 第一優先級：特殊商業用途 (建物型態/主要用途) (補全關鍵字)
    if (buildingType.includes('店舖') || buildingType.includes('店面') || buildingType.includes('店鋪')) return '店舖';
    if (buildingType.includes('工廠') || buildingType.includes('倉庫') || buildingType.includes('廠辦')) return '廠辦/工廠';
    if (mainPurpose.includes('商業') || buildingType.includes('辦公') || buildingType.includes('事務所')) return '辦公/事務所';

    // 第二優先級：特殊住宅格局 (0房)
    const isResidentialBuilding = buildingType.includes('住宅大樓') || buildingType.includes('華廈');
    if (isResidentialBuilding && rooms === 0) {
        if (houseArea > 35) return '毛胚';
        if (houseArea <= 35) return '套房';
    }

    // 第三優先級：標準住宅房型
    if (typeof rooms === 'number' && !isNaN(rooms)) {
        if (rooms === 1) return '1房';
        if (rooms === 2) return '2房';
        if (rooms === 3) return '3房';
        if (rooms === 4) return '4房';
        if (rooms >= 5) return '5房以上';
    }

    return '其他';
}

/**
 * 從「戶別」欄位中提取簡化的「戶型」代號
 * 例如: "A2棟14F號" -> "A2", "B1-5F" -> "B1"
 */
export function extractUnitType(unitName: string): string {
    if (!unitName) return '-';

    // 1. 移除 "棟", "號", "樓", "F" 等後綴及其後的內容 (如果有明確分隔)
    // 常見格式: "A2棟14F號", "A5棟10樓", "B1-5F", "T1-12F"

    let processed = unitName.trim();

    // Case 1: "A2棟..." -> "A2"
    if (processed.includes('棟')) {
        processed = processed.split('棟')[0];
    }

    // Case 2: "XXX號" (通常出現在最後，且前面可能是樓層)
    // 很多時候 "A2棟14F號" -> "A2" (已經被 Case 1 處理)
    // 如果沒有棟，例如 "14F-5號" -> 可能是透天或公寓，較難處理，暫不強行截斷

    // Case 3: 含有 "-" (通常是 戶型-樓層，如 B1-5F)
    // 但要小心 "B1-1" 這種可能是戶型本身
    // 判斷 "-" 後面是否為樓層 (數字+F 或 純數字)
    if (processed.includes('-')) {
        const parts = processed.split('-');
        // 如果 part[1] 看起來像樓層 (5F, 12, 12F)
        if (/^\d+F?$/.test(parts[1])) {
            processed = parts[0];
        }
    }

    // Case 4: 含有樓層關鍵字但沒有明確分隔符 (比較危險，需保守)
    // 例如 "A1戶10樓"
    if (processed.includes('戶')) {
        processed = processed.split('戶')[0];
    }

    // Advanced cleaning: 移除可能殘留的 "F" 如果它在末尾且前面是數字 (通常被 Case 1/3 處理了，但以防萬一)

    return processed;
}
