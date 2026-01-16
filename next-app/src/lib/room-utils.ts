
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
