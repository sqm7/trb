import { columnMappings } from './uploader-config';

/**
 * 清理並轉換字串或數字為純數字型別
 */
function cleanNumber(value: string | number | null | undefined): number | null {
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const cleaned = String(value).replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

/**
 * 將民國年字串 (例如 "1130101") 轉換為西元年日期格式 ("YYYY-MM-DD")
 */
function rocToDate(rocDateStr: string | number | null | undefined): string | null {
    if (!rocDateStr) return null;
    const match = String(rocDateStr).match(/(\d{2,3})[^\d]*(\d{1,2})[^\d]*(\d{1,2})/);
    if (!match) return null;
    try {
        const rocYear = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const day = parseInt(match[3], 10);
        if (isNaN(rocYear) || isNaN(month) || isNaN(day)) return null;
        const adYear = rocYear + 1911;
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const date = new Date(`${adYear}-${monthStr}-${dayStr}`);
        // 驗證日期是否有效
        if (isNaN(date.getTime()) || date.getDate() !== day) return null;
        return `${adYear}-${monthStr}-${dayStr}`;
    } catch (e) {
        return null;
    }
}

/**
 * 將中文樓層字串 (例如 "十一層", "地下層") 轉換為數字
 */
function chineseFloorToNumber(floorStr: string | null | undefined): number | null {
    if (!floorStr || typeof floorStr !== 'string') return null;
    const s = String(floorStr).replace(/層|樓/g, '');
    const charMap: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
    if (!isNaN(parseInt(s))) return parseInt(s, 10);
    if (s.includes('地下')) return -1;

    let total = 0;
    if (s.startsWith('十')) {
        total = 10 + (charMap[s[1]] || 0);
    } else if (s.includes('十')) {
        const parts = s.split('十');
        const part0 = charMap[parts[0]] || 1;
        const part1 = charMap[parts[1]] || 0;
        total = part0 * 10 + part1;
    } else {
        total = charMap[s] || 0;
    }
    return total > 0 ? total : null;
}

/**
 * 根據欄位對應規則，處理單筆 CSV 資料
 */
export function processRow(row: any, mapping: Record<string, string>): any {
    const newRow: any = {};
    const targetDbColumns = Array.from(new Set(Object.values(mapping)));
    targetDbColumns.forEach(col => newRow[col] = null);

    for (const csvHeader in row) {
        const dbColumn = mapping[csvHeader.trim()];
        if (dbColumn) {
            let value = row[csvHeader];
            if (value === undefined || value === '' || value === null) continue;

            if (dbColumn === '樓層' || dbColumn === '總樓層') {
                newRow[dbColumn] = chineseFloorToNumber(value);
            } else if (dbColumn.includes('日')) {
                newRow[dbColumn] = rocToDate(String(value));
            } else if (['交易總價', '車位總價', '房數', '廳數', '衛浴數', '持分分母', '持分分子', '交易屋齡', '車位價格'].includes(dbColumn)) {
                newRow[dbColumn] = cleanNumber(value); // parseInt removed, consistent with float handling or pure int handled by cleanNumber returning number
            } else if (dbColumn.includes('面積')) {
                newRow[dbColumn] = cleanNumber(value);
            } else {
                newRow[dbColumn] = String(value);
            }
        }
    }
    return newRow;
}

/**
 * 比較兩筆紀錄在指定欄位上是否相同
 */
export function isEqual(objA: any, objB: any, tableType: string): boolean {
    const mapping = columnMappings[tableType];
    if (!mapping) return false;

    const keysToCheck = Object.values(mapping);
    for (const key of keysToCheck) {
        if (key === 'id' || key === '建案名稱') continue;
        const valA = objA[key];
        const valB = objB[key];

        if (valA === null || valA === undefined || valA === '') continue;

        const strValA = valA !== null && valA !== undefined ? String(valA) : '';
        const strValB = valB !== null && valB !== undefined ? String(valB) : '';

        // 對於浮點數（面積），使用容錯比較
        if (key.includes('面積')) {
            const numA = cleanNumber(valA) || 0;
            const numB = cleanNumber(valB) || 0;
            if (Math.abs(numA - numB) > 0.001) return false;
        } else {
            if (strValA !== strValB) return false;
        }
    }
    return true;
}
