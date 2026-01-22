// uploader/js/utils.js
import { columnMappings } from './config.js';

/**
 * 清理並轉換字串或數字為純數字型別
 * @param {string | number} value - 輸入值
 * @returns {number | null} - 清理後的數字，或在無效時返回 null
 */
function cleanNumber(value) {
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const cleaned = String(value).replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

/**
 * 將民國年字串 (例如 "1130101") 轉換為西元年日期格式 ("YYYY-MM-DD")
 * @param {string} rocDateStr - 民國年日期字串
 * @returns {string | null} - 西元年日期字串，或在無效時返回 null
 */
function rocToDate(rocDateStr) {
    if (!rocDateStr || typeof rocDateStr !== 'string') return null;
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
        // 驗證日期是否有效 (例如，處理 2月30日 這種不存在的日期)
        if (isNaN(date.getTime()) || date.getDate() !== day) return null;
        return `${adYear}-${monthStr}-${dayStr}`;
    } catch (e) {
        return null;
    }
}

/**
 * 將中文樓層字串 (例如 "十一層", "地下層") 轉換為數字
 * @param {string} floorStr - 中文樓層字串
 * @returns {number | null} - 阿拉伯數字樓層，或在無效時返回 null
 */
function chineseFloorToNumber(floorStr) {
    if (!floorStr || typeof floorStr !== 'string') return null;
    const s = String(floorStr).replace(/層|樓/g, '');
    const charMap = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
    if (!isNaN(s)) return parseInt(s, 10);
    if (s.includes('地下')) return -1; // 簡單處理地下層

    let total = 0;
    if (s.startsWith('十')) {
        total = 10 + (charMap[s[1]] || 0);
    } else if (s.includes('十')) {
        const parts = s.split('十');
        const part0 = charMap[parts[0]] || 1;
        const part1 = charMap[parts[1]] || 0;
        total = part0 * 10 + part1;
    } else {
        total = charMap[s] || null;
    }
    return total > 0 ? total : null;
}

/**
 * 根據欄位對應規則，處理單筆 CSV 資料
 * @param {object} row - 從 PapaParse 解析出的一行資料物件
 * @param {object} mapping - 對應的欄位規則
 * @returns {object} - 處理過並符合資料庫格式的物件
 */
export function processRow(row, mapping) {
    const newRow = {};
    const targetDbColumns = [...new Set(Object.values(mapping))];
    targetDbColumns.forEach(col => newRow[col] = null);

    for (const csvHeader in row) {
        const dbColumn = mapping[csvHeader.trim()]; // 增加 trim() 確保比對正確
        if (dbColumn) {
            let value = row[csvHeader];
            if (value === undefined || value === '' || value === null) continue;

            if (dbColumn === '樓層' || dbColumn === '總樓層') {
                newRow[dbColumn] = chineseFloorToNumber(value);
            } else if (dbColumn.includes('日')) {
                newRow[dbColumn] = rocToDate(String(value));
            } else if (['交易總價', '車位總價', '房數', '廳數', '衛浴數', '持分分母', '持分分子', '交易屋齡', '車位價格'].includes(dbColumn)) {
                newRow[dbColumn] = parseInt(cleanNumber(value), 10);
                if (isNaN(newRow[dbColumn])) newRow[dbColumn] = null;
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
 * @param {object} objA - 新紀錄
 * @param {object} objB - 資料庫中的舊紀錄
 * @param {string} tableType - 表格類型 ('a', 'b', 'c'...)
 * @returns {boolean} - 是否相同
 */
export function isEqual(objA, objB, tableType) {
    const keysToCheck = Object.values(columnMappings[tableType]);
    for (const key of keysToCheck) {
        if (key === 'id' || key === '建案名稱') continue;
        const valA = objA[key];
        const valB = objB[key];

        // 如果 CSV 中的新值為空 (null/undefined/'')，則跳過比對（假設不覆蓋舊有資料）
        // 這避免了像 '交易總價' 這種資料庫自動計算但 CSV 為空的欄位導致誤判為「不同」
        if (valA === null || valA === undefined || valA === '') continue;

        const strValA = valA !== null && valA !== undefined ? String(valA) : '';
        const strValB = valB !== null && valB !== undefined ? String(valB) : '';

        // 對於浮點數（面積），使用容錯比較
        if (key.includes('面積')) {
            if (Math.abs(cleanNumber(valA) - cleanNumber(valB)) > 0.001) return false;
        } else {
            // 其他都轉為字串比較
            if (strValA !== strValB) return false;
        }
    }
    return true;
}
