(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/vibe01/next-app/src/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://zxbmbbfrzbtuueysicoc.supabase.co");
const supabaseKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4Ym1iYmZyemJ0dXVleXNpY29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODg5ODksImV4cCI6MjA2NjI2NDk4OX0.1IUynv5eK1xF_3pb-oasqaTrPvbeAOC4Sc1oykPBy4M");
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/lib/uploader-config.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// uploader-config.ts
// 縣市代碼與中文名稱對照表
__turbopack_context__.s([
    "columnMappings",
    ()=>columnMappings,
    "counties",
    ()=>counties
]);
const counties = {
    'A': '臺北市',
    'B': '臺中市',
    'C': '基隆市',
    'D': '臺南市',
    'E': '高雄市',
    'F': '新北市',
    'G': '宜蘭縣',
    'H': '桃園市',
    'I': '嘉義市',
    'J': '新竹縣',
    'K': '苗栗縣',
    'M': '南投縣',
    'N': '彰化縣',
    'O': '新竹市',
    'P': '雲林縣',
    'Q': '嘉義縣',
    'T': '屏東縣',
    'U': '花蓮縣',
    'V': '臺東縣',
    'W': '金門縣',
    'X': '澎湖縣',
    'Z': '連江縣'
};
const columnMappings = {
    'a': {
        '編號': '編號',
        '鄉鎮市區': '行政區',
        '交易標的': '交易標的',
        '土地位置建物門牌': '地址',
        '交易年月日': '交易日',
        '交易筆棟數': '交易筆棟數',
        '移轉層次': '樓層',
        '建物型態': '建物型態',
        '主要用途': '主要用途',
        '建物移轉總面積平方公尺': '產權面積_房車',
        '建物現況格局-房': '房數',
        '建物現況格局-廳': '廳數',
        '建物現況格局-衛': '衛浴數',
        '總價元': '交易總價',
        '車位類別': '車位類別',
        '車位移轉總面積平方公尺': '車位總面積',
        '車位總價元': '車位總價',
        '備註': '備註',
        '主建物面積': '主建物面積',
        '附屬建物面積': '附屬建物面積',
        '陽台面積': '陽台面積'
    },
    'a_build': {
        '編號': '編號',
        '屋齡': '交易屋齡',
        '主要建材': '結構',
        '建築完成年月日': '完工日',
        '建築完成日期': '完工日',
        '總層數': '總樓層',
        '移轉情形': '移轉情形'
    },
    'a_land': {
        '編號': '編號',
        '土地位置': '地號_段',
        '地號': '地號',
        '土地移轉面積平方公尺': '土地持分面積',
        '使用分區或編定': '使用分區',
        '非都市土地使用分區': '使用分區',
        '權利人持分分母': '持分分母',
        '權利人持分分子': '持分分子'
    },
    'a_park': {
        '編號': '編號',
        '車位類別': '車位類別',
        '車位價格': '車位價格',
        '車位面積平方公尺': '車位面積',
        '車位所在樓層': '車位樓層'
    },
    'b': {
        '編號': '編號',
        '鄉鎮市區': '行政區',
        '交易標的': '交易標的',
        '土地位置建物門牌': '地址',
        '交易年月日': '交易日',
        '交易筆棟數': '交易筆棟數',
        '移轉層次': '樓層',
        '總層數': '總樓層',
        '總樓層數': '總樓層',
        '建物型態': '建物型態',
        '主要用途': '主要用途',
        '建物移轉總面積平方公尺': '產權面積_房車',
        '建物現況格局-房': '房數',
        '建物現況格局-廳': '廳數',
        '建物現況格局-衛': '衛浴數',
        '總價元': '交易總價',
        '車位類別': '車位類別',
        '車位移轉總面積平方公尺': '車位總面積',
        '車位總價元': '車位總價',
        '備註': '備註',
        '建案名稱': '建案名稱',
        '棟及號': '戶別',
        '解約情形': '解約情形'
    },
    'b_land': {
        '編號': '編號',
        '土地位置': '地號_段',
        '地號': '地號',
        '土地移轉面積平方公尺': '土地持分面積',
        '使用分區或編定': '使用分區',
        '非都市土地使用分區': '使用分區',
        '權利人持分分母': '持分分母',
        '權利人持分分子': '持分分子'
    },
    'b_park': {
        '編號': '編號',
        '車位類別': '車位類別',
        '車位價格': '車位價格',
        '車位面積平方公尺': '車位面積',
        '車位所在樓層': '車位樓層'
    },
    'c': {
        '編號': '編號',
        '鄉鎮市區': '行政區',
        '交易標的': '交易標的',
        '土地位置建物門牌': '地址',
        '租賃年月日': '交易日',
        '租賃筆棟數': '交易筆棟數',
        '租賃層次': '樓層',
        '建物型態': '建物型態',
        '主要用途': '主要用途',
        '建物總面積平方公尺': '租賃面積',
        '建物現況格局-房': '房數',
        '建物現況格局-廳': '廳數',
        '建物現況格局-衛': '衛浴數',
        '總額元': '交易總價',
        '車位類別': '車位類別',
        '車位面積平方公尺': '車位總面積',
        '車位總額元': '車位總價',
        '備註': '備註',
        '出租型態': '出租型態',
        '租賃期間': '租賃期間',
        '附屬設備': '附屬設備',
        '租賃住宅服務': '租賃住宅服務'
    },
    'c_build': {
        '編號': '編號',
        '屋齡': '交易屋齡',
        '主要建材': '結構',
        '建築完成年月日': '完工日',
        '建築完成日期': '完工日',
        '總層數': '總樓層',
        '移轉情形': '移轉情形'
    },
    'c_land': {
        '編號': '編號',
        '土地位置': '地號_段',
        '地號': '地號',
        '土地移轉面積平方公尺': '土地租賃面積',
        '使用分區或編定': '使用分區',
        '非都市土地使用分區': '使用分區'
    },
    'c_park': {
        '編號': '編號',
        '車位類別': '車位類別',
        '車位價格': '車位價格',
        '車位面積平方公尺': '車位面積',
        '車位所在樓層': '車位樓層'
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/lib/uploader-utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "isEqual",
    ()=>isEqual,
    "processRow",
    ()=>processRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/uploader-config.ts [app-client] (ecmascript)");
;
/**
 * 清理並轉換字串或數字為純數字型別
 */ function cleanNumber(value) {
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const cleaned = String(value).replace(/,/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}
/**
 * 將民國年字串 (例如 "1130101") 轉換為西元年日期格式 ("YYYY-MM-DD")
 */ function rocToDate(rocDateStr) {
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
 */ function chineseFloorToNumber(floorStr) {
    if (!floorStr || typeof floorStr !== 'string') return null;
    const s = String(floorStr).replace(/層|樓/g, '');
    const charMap = {
        '一': 1,
        '二': 2,
        '三': 3,
        '四': 4,
        '五': 5,
        '六': 6,
        '七': 7,
        '八': 8,
        '九': 9,
        '十': 10
    };
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
function processRow(row, mapping) {
    const newRow = {};
    const targetDbColumns = Array.from(new Set(Object.values(mapping)));
    targetDbColumns.forEach((col)=>newRow[col] = null);
    for(const csvHeader in row){
        const dbColumn = mapping[csvHeader.trim()];
        if (dbColumn) {
            let value = row[csvHeader];
            if (value === undefined || value === '' || value === null) continue;
            if (dbColumn === '樓層' || dbColumn === '總樓層') {
                newRow[dbColumn] = chineseFloorToNumber(value);
            } else if (dbColumn.includes('日')) {
                newRow[dbColumn] = rocToDate(String(value));
            } else if ([
                '交易總價',
                '車位總價',
                '房數',
                '廳數',
                '衛浴數',
                '持分分母',
                '持分分子',
                '交易屋齡',
                '車位價格'
            ].includes(dbColumn)) {
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
function isEqual(objA, objB, tableType) {
    const mapping = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["columnMappings"][tableType];
    if (!mapping) return false;
    const keysToCheck = Object.values(mapping);
    for (const key of keysToCheck){
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/lib/file-handler.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseFile",
    ()=>parseFile,
    "scanDirectory",
    ()=>scanDirectory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$papaparse$2f$papaparse$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/papaparse/papaparse.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/uploader-config.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/uploader-utils.ts [app-client] (ecmascript)");
;
;
;
async function scanDirectory(dirHandle, path = '') {
    let files = [];
    // @ts-ignore - FileSystemDirectoryHandle iteration types might be missing in older TS/DOM lib
    for await (const entry of dirHandle.values()){
        const currentPath = path ? `${path}/${entry.name}` : entry.name;
        if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.csv')) {
            const fileRegex = /^([a-z])_lvr_land_([a-c](?:_build|_land|_park)?)\.csv$/i;
            const match = entry.name.match(fileRegex);
            if (match) {
                files.push({
                    handle: entry,
                    name: entry.name,
                    fullPath: currentPath,
                    countyCode: match[1].toLowerCase(),
                    tableType: match[2].toLowerCase(),
                    isMain: !match[2].includes('_')
                });
            }
        } else if (entry.kind === 'directory') {
            files.push(...await scanDirectory(entry, currentPath));
        }
    }
    return files;
}
async function parseFile(fileInfo, projectNameMappings, onLog) {
    const file = await fileInfo.handle.getFile();
    const parseResult = await new Promise((resolve)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$papaparse$2f$papaparse$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header)=>header.trim(),
            complete: resolve
        });
    });
    if (parseResult.errors && parseResult.errors.length > 0) {
        const nonCriticalErrorCodes = [
            'TooManyFields',
            'TooFewFields',
            'MissingQuotes'
        ];
        const criticalErrors = parseResult.errors.filter((e)=>!nonCriticalErrorCodes.includes(e.code));
        if (criticalErrors.length > 0) {
            throw new Error(`CSV 嚴重解析錯誤: ${criticalErrors[0].message}`);
        }
        if (onLog) {
            parseResult.errors.forEach((warning)=>{
                onLog(`檔案 ${fileInfo.fullPath} 有解析警告 (已忽略): ${warning.message} (行: ${(warning.row || 0) + 2})`, 'warning');
            });
        }
    }
    if (!parseResult.data || parseResult.data.length === 0) {
        return [];
    }
    let dataRows = parseResult.data;
    // 移除 CSV 檔案中可能存在的英文標頭行
    if (dataRows[0]['編號']?.toLowerCase().includes('serial number')) {
        dataRows.shift();
    }
    const mapping = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["columnMappings"][fileInfo.tableType];
    if (!mapping) {
        throw new Error(`檔案 ${fileInfo.name} 找不到對應的欄位規則。`);
    }
    // 遍歷每一行資料，並使用 processRow 進行格式轉換
    let processedData = dataRows.map((row)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["processRow"])(row, mapping));
    // 套用建案名稱自動替換對應
    if (projectNameMappings && projectNameMappings.size > 0) {
        let replacementCount = 0;
        processedData = processedData.map((row)=>{
            const originalName = row['建案名稱'];
            if (originalName && projectNameMappings.has(originalName)) {
                const newName = projectNameMappings.get(originalName);
                if (newName) {
                    row['建案名稱'] = newName;
                    replacementCount++;
                }
            }
            return row;
        });
        if (replacementCount > 0 && onLog) {
            onLog(`已自動替換 ${replacementCount} 筆建案名稱`, 'info');
        }
    }
    return processedData;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/lib/uploader-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getProjectNameMappings",
    ()=>getProjectNameMappings,
    "getUploadSummary",
    ()=>getUploadSummary,
    "resetUploaderState",
    ()=>resetUploaderState,
    "uploadMainFileWithSmartUpdate",
    ()=>uploadMainFileWithSmartUpdate,
    "uploadSubFile",
    ()=>uploadSubFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/uploader-utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$file$2d$handler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/file-handler.ts [app-client] (ecmascript)");
;
;
;
let projectNameMappings = new Map();
let processedMainIds = new Set();
let currentSummary = {
    new: 0,
    updated: 0,
    identical: 0,
    subAdded: 0,
    errors: 0,
    warnings: 0,
    newRecords: [],
    updatedRecords: [],
    identicalRecords: []
};
function resetUploaderState() {
    processedMainIds = new Set();
    currentSummary = {
        new: 0,
        updated: 0,
        identical: 0,
        subAdded: 0,
        errors: 0,
        warnings: 0,
        newRecords: [],
        updatedRecords: [],
        identicalRecords: []
    };
}
function getUploadSummary() {
    return currentSummary;
}
async function getProjectNameMappings(onLog) {
    try {
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('project_name_mappings').select('old_name, new_name');
        if (error) {
            if (onLog) onLog(`載入建案名稱對應失敗: ${error.message}`, 'warning');
            return new Map();
        }
        const mappings = new Map();
        data?.forEach((row)=>{
            mappings.set(row.old_name, row.new_name);
        });
        if (onLog) onLog(`已載入 ${mappings.size} 筆建案名稱對應規則`, 'info');
        projectNameMappings = mappings;
        return mappings;
    } catch (e) {
        if (onLog) onLog(`載入建案名稱對應時發生錯誤: ${e.message}`, 'warning');
        return new Map();
    }
}
async function uploadMainFileWithSmartUpdate(fileInfo, onLog) {
    try {
        const tableName = `${fileInfo.countyCode}_lvr_land_${fileInfo.tableType}`;
        // Load mappings if not loaded? Assume loaded via page init
        const processedData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$file$2d$handler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseFile"])(fileInfo, projectNameMappings, (msg, type)=>onLog(msg, type));
        if (!processedData || processedData.length === 0) {
            onLog(`${fileInfo.fullPath}: 檔案為空或無有效資料，已跳過`, 'warning');
            return;
        }
        const chunkSize = 500;
        for(let i = 0; i < processedData.length; i += chunkSize){
            const chunk = processedData.slice(i, i + chunkSize);
            const idsToCheck = chunk.map((row)=>row['編號']);
            const { data: existingData, error: fetchError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from(tableName).select('*').in('編號', idsToCheck);
            if (fetchError) throw fetchError;
            const existingDataMap = new Map((existingData || []).map((item)=>[
                    item['編號'],
                    item
                ]));
            const newData = [];
            const updatedData = [];
            const idsToDeleteForUpdate = [];
            let identicalCount = 0;
            for (const newRecord of chunk){
                const existingRecord = existingDataMap.get(newRecord['編號']);
                if (!existingRecord) {
                    newData.push(newRecord);
                    currentSummary.newRecords.push(newRecord);
                } else if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isEqual"])(newRecord, existingRecord, fileInfo.tableType)) {
                    idsToDeleteForUpdate.push(newRecord['編號']);
                    updatedData.push(newRecord);
                    currentSummary.updatedRecords.push({
                        oldData: existingRecord,
                        newData: newRecord
                    });
                } else {
                    identicalCount++;
                    currentSummary.identicalRecords.push(existingRecord);
                }
            }
            onLog(`${fileInfo.fullPath} (區塊 ${Math.floor(i / chunkSize) + 1}): 新增 ${newData.length}, 更新 ${updatedData.length}, 跳過 ${identicalCount}`, 'info');
            currentSummary.new += newData.length;
            currentSummary.updated += updatedData.length;
            currentSummary.identical += identicalCount;
            const idsToProcess = [
                ...newData.map((r)=>r['編號']),
                ...updatedData.map((r)=>r['編號'])
            ];
            idsToProcess.forEach((id)=>processedMainIds.add(id));
            if (idsToDeleteForUpdate.length > 0) {
                const { error: deleteError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from(tableName).delete().in('編號', idsToDeleteForUpdate);
                if (deleteError) throw deleteError;
            }
            const dataToUpload = [
                ...newData,
                ...updatedData
            ];
            if (dataToUpload.length > 0) {
                const { error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from(tableName).insert(dataToUpload);
                if (insertError) throw insertError;
            }
        }
    } catch (error) {
        onLog(`${fileInfo.fullPath} 上傳失敗: ${error.message}`, 'error');
        currentSummary.errors++;
    }
}
async function uploadSubFile(fileInfo, onLog) {
    try {
        const tableName = `${fileInfo.countyCode}_lvr_land_${fileInfo.tableType}`;
        const allSubData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$file$2d$handler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseFile"])(fileInfo, projectNameMappings, (msg, type)=>onLog(msg, type));
        if (!allSubData || allSubData.length === 0) {
            onLog(`${fileInfo.fullPath}: 檔案為空或無有效資料，已跳過`, 'warning');
            return;
        }
        const dataToUpload = allSubData.filter((row)=>processedMainIds.has(row['編號']));
        if (dataToUpload.length > 0) {
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from(tableName).insert(dataToUpload);
            if (error) throw error;
            currentSummary.subAdded += dataToUpload.length;
            onLog(`${fileInfo.fullPath}: 成功新增 ${dataToUpload.length} 筆關聯的附表紀錄`, 'success');
        } else {
            onLog(`${fileInfo.fullPath}: 無對應的主表變更，已跳過`, 'info');
        }
    } catch (error) {
        onLog(`${fileInfo.fullPath} 上傳失敗: ${error.message}`, 'error');
        currentSummary.errors++;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/app/admin/uploader/admin-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "batchUpdateData",
    ()=>batchUpdateData,
    "searchData",
    ()=>searchData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
// Helper to create a dynamic client based on user input
function createDynamicClient(supabaseUrl, supabaseKey) {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('請提供完整的 Supabase URL 和 Service Role Key');
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false
        }
    });
}
async function searchData(countyCode, transactionType, searchField, keyword, dbConfig) {
    try {
        const supabase = createDynamicClient(dbConfig.url, dbConfig.key);
        const tableName = `${countyCode.toLowerCase()}_lvr_land_${transactionType}`;
        console.log(`[AdminService] Searching ${tableName} for ${searchField} like %${keyword}%`);
        const { data, error } = await supabase.from(tableName).select('*').ilike(searchField, `%${keyword}%`).limit(100); // Limit to 100 for performance in UI
        if (error) throw error;
        return {
            success: true,
            data,
            tableName
        };
    } catch (error) {
        console.error('Search error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
async function batchUpdateData(tableName, ids, fieldToUpdate, newValue, oldValue, district, city, dbConfig) {
    try {
        const supabase = createDynamicClient(dbConfig.url, dbConfig.key);
        if (!ids || ids.length === 0) {
            throw new Error('沒有選擇任何要更新的資料');
        }
        const updateObject = {
            [fieldToUpdate]: newValue === '' ? null : newValue
        };
        console.log(`[AdminService] Batch updating ${tableName}, Count: ${ids.length}, Field: ${fieldToUpdate}`);
        const { error } = await supabase.from(tableName).update(updateObject).in('編號', ids);
        if (error) throw error;
        // Check for Project Name Mapping Logic
        // Condition: Updating '建案名稱', old value exists, new value is different, AND old value has '?'
        const hasEncodingIssue = oldValue && oldValue.includes('?');
        if (fieldToUpdate === '建案名稱' && oldValue && newValue && oldValue !== newValue && hasEncodingIssue) {
            console.log(`[AdminService] Detected encoding fix (old: ${oldValue}, new: ${newValue}). Saving mapping.`);
            await saveProjectNameMapping(oldValue, newValue, district, city, supabase);
        }
        return {
            success: true,
            count: ids.length
        };
    } catch (error) {
        console.error('Batch update error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
/**
 * 儲存建案名稱對應 (Internal Helper)
 */ async function saveProjectNameMapping(oldName, newName, district, city, supabase) {
    try {
        const insertData = {
            old_name: oldName,
            new_name: newName,
            updated_at: new Date().toISOString()
        };
        if (district) insertData.district = district;
        if (city) insertData.city = city;
        const { error } = await supabase.from('project_name_mappings').upsert(insertData, {
            onConflict: 'old_name'
        });
        if (error) {
            console.error('Failed to save mapping:', error);
        }
    } catch (e) {
        console.error('Error saving mapping:', e);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UploaderPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$file$2d$handler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/file-handler.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/uploader-service.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/lib/uploader-config.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$app$2f$admin$2f$uploader$2f$admin$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/vibe01/next-app/src/app/admin/uploader/admin-service.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
function UploaderPage() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [logs, setLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isUploading, setIsUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [files, setFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [uploadType, setUploadType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [currentFile, setCurrentFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [summary, setSummary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Database Config State
    const [dbUrl, setDbUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [dbKey, setDbKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isConnected, setIsConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Batch Update State
    const [updateCounty, setUpdateCounty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('f'); // Default to New Taipei (F) as per legacy
    const [updateType, setUpdateType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('b'); // Default to Presale (B)
    const [updateSearchField, setUpdateSearchField] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('建案名稱');
    const [updateKeyword, setUpdateKeyword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [searchResults, setSearchResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showUpdateModal, setShowUpdateModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedIds, setSelectedIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [batchUpdateField, setBatchUpdateField] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('建案名稱');
    const [batchUpdateValue, setBatchUpdateValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isSearching, setIsSearching] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isBatchUpdating, setIsBatchUpdating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentUpdateContext, setCurrentUpdateContext] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [expandedRows, setExpandedRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [showModalSearch, setShowModalSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Initial Auth Check (Optional - relax requirement)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "UploaderPage.useEffect": ()=>{
            const checkAuth = {
                "UploaderPage.useEffect.checkAuth": async ()=>{
                    await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
                // If logged in, maybe pre-fill or just show connected status if we assume env vars?
                // For now, we follow legacy: require manual input or use env vars as default if available
                // We do NOT pre-fill the Service Role Key nor the URL for security/privacy reasons.
                // Users must paste it manually to ensure it's not exposed in client-side code.
                // if (process.env.NEXT_PUBLIC_SUPABASE_URL) setDbUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
                }
            }["UploaderPage.useEffect.checkAuth"];
            checkAuth();
        }
    }["UploaderPage.useEffect"], []);
    const addLog = (text, type)=>{
        const time = new Date().toLocaleTimeString();
        setLogs((prev)=>[
                ...prev,
                {
                    id: Date.now() + Math.random(),
                    text,
                    type,
                    time
                }
            ]);
    };
    const handleTestConnection = async ()=>{
        if (!dbUrl || !dbKey) {
            addLog('請填寫完整的 Supabase URL 和 Service Role Key。', 'error');
            return;
        }
        addLog('正在測試連線...', 'info');
        try {
            // Re-initialize client with manual keys if needed, or just test current
            // Here we might need to dynamically create a client if we want to support custom keys
            // For this version, let's assume we update the global client or just verify connectivity
            // Note: In a real "custom key" scenario, we'd need a way to pass this client to the service
            // For now, purely purely testing reachability:
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('county_codes').select('code', {
                count: 'exact',
                head: true
            });
            // Legacy code ignores 42P01 (undefined table) as success? 
            // "if (error && error.code !== '42P01') throw error;"
            if (error && error.code !== '42P01') throw error;
            addLog('連線成功！', 'success');
            setIsConnected(true);
            // Load mappings
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProjectNameMappings"])((msg, type)=>addLog(msg, type));
        } catch (error) {
            addLog(`連線失敗: ${error.message}`, 'error');
            setIsConnected(false);
        }
    };
    const handleSelectFolders = async ()=>{
        setLogs([]);
        setFiles([]);
        setSummary(null);
        try {
            // @ts-expect-error - showDirectoryPicker is experimental
            if (!window.showDirectoryPicker) {
                addLog('您的瀏覽器不支援資料夾選擇功能，請使用 Chrome 或 Edge。', 'error');
                return;
            }
            addLog('正在掃描資料夾...', 'info');
            // @ts-expect-error - showDirectoryPicker is experimental
            const dirHandle = await window.showDirectoryPicker();
            const scannedFiles = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$file$2d$handler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scanDirectory"])(dirHandle);
            if (scannedFiles.length === 0) {
                addLog('在選擇的資料夾中沒有找到符合命名規則的檔案。', 'warning');
                return;
            }
            setFiles(scannedFiles);
            addLog(`掃描完成！找到 ${scannedFiles.length} 個有效檔案。`, 'success');
        } catch (err) {
            if (err.name !== 'AbortError') {
                addLog(`選擇資料夾時發生錯誤: ${err.message}`, 'error');
            }
        }
    };
    const handleStartUpload = async ()=>{
        if (files.length === 0) return;
        if (!isConnected) {
            addLog('請先確認資料庫連線成功。', 'error');
            return;
        }
        setIsUploading(true);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resetUploaderState"])();
        setLogs([]);
        addLog('開始上傳任務...', 'info');
        const typeNameMap = {
            'all': '全選',
            'a': '中古',
            'b': '預售',
            'c': '租賃'
        };
        let filesToUpload = files;
        if (uploadType !== 'all') {
            filesToUpload = files.filter((file)=>file.tableType.startsWith(uploadType));
        }
        if (filesToUpload.length === 0) {
            addLog(`找不到符合「${typeNameMap[uploadType]}」類型的檔案...`, 'warning');
            setIsUploading(false);
            return;
        }
        const mainTables = filesToUpload.filter((f)=>f.isMain);
        const subTables = filesToUpload.filter((f)=>!f.isMain);
        // Phase 1: Main Tables
        addLog(`--- 階段 1: 主表 (智慧更新) ---`, 'info');
        for(let i = 0; i < mainTables.length; i++){
            const file = mainTables[i];
            setCurrentFile(file.fullPath);
            setProgress(Math.round(i / mainTables.length * 100));
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uploadMainFileWithSmartUpdate"])(file, addLog);
        }
        // Phase 2: Sub Tables
        addLog(`--- 階段 2: 附表 (智慧連動) ---`, 'info');
        for(let i = 0; i < subTables.length; i++){
            const file = subTables[i];
            setCurrentFile(file.fullPath);
            setProgress(Math.round(i / subTables.length * 100));
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uploadSubFile"])(file, addLog);
        }
        setCurrentFile('');
        setProgress(100);
        const finalSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getUploadSummary"])();
        setSummary(finalSummary);
        addLog(`所有檔案處理完成！新增: ${finalSummary.new}, 更新: ${finalSummary.updated}, 錯誤: ${finalSummary.errors}`, 'success');
        setIsUploading(false);
    };
    // --- Batch Update Handlers ---
    const handleSearch = async ()=>{
        if (!dbUrl || !dbKey) {
            addLog('請先填寫資料庫連線資訊 (URL & Key)', 'error');
            return;
        }
        if (!updateKeyword.trim()) {
            addLog('請輸入搜尋關鍵字', 'warning');
            return;
        }
        setIsSearching(true);
        setLogs([]); // Optional: clear logs or keep them
        addLog(`正在搜尋: ${__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["counties"][updateCounty.toUpperCase()]} ${updateType} ${updateSearchField} containing "${updateKeyword}"...`, 'info');
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$app$2f$admin$2f$uploader$2f$admin$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["searchData"])(updateCounty, updateType, updateSearchField, updateKeyword.trim(), {
                url: dbUrl,
                key: dbKey
            });
            if (result.success && result.data) {
                setSearchResults(result.data);
                setCurrentUpdateContext({
                    tableName: result.tableName,
                    city: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["counties"][updateCounty.toUpperCase()]
                });
                setShowUpdateModal(true);
                setSelectedIds(new Set()); // Reset selection
                addLog(`搜尋完成，找到 ${result.data.length} 筆資料`, 'success');
            } else {
                addLog(`搜尋失敗: ${result.error}`, 'error');
            }
        } catch (e) {
            addLog(`搜尋發生錯誤: ${e.message}`, 'error');
        } finally{
            setIsSearching(false);
        }
    };
    const handleExecuteBatchUpdate = async ()=>{
        if (!currentUpdateContext || selectedIds.size === 0) return;
        // Find one sample for old value (legacy logic uses the first selected)
        let oldValue = null;
        let district = null;
        // If updating '建案名稱', try to find old value from the first selected record
        if (batchUpdateField === '建案名稱') {
            const firstId = Array.from(selectedIds)[0];
            const record = searchResults.find((r)=>r['編號'] === firstId);
            if (record) {
                oldValue = record['建案名稱'];
                district = record['行政區'];
            }
        }
        setIsBatchUpdating(true);
        addLog(`開始批次更新 ${selectedIds.size} 筆資料...`, 'info');
        try {
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$app$2f$admin$2f$uploader$2f$admin$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["batchUpdateData"])(currentUpdateContext.tableName, Array.from(selectedIds), batchUpdateField, batchUpdateValue, oldValue, district, currentUpdateContext.city, {
                url: dbUrl,
                key: dbKey
            });
            if (result.success) {
                addLog(`成功更新 ${result.count} 筆資料！`, 'success');
                setShowUpdateModal(false);
            // Optionally re-search to show updated results? 
            // For now just close modal as per legacy
            } else {
                addLog(`批次更新失敗: ${result.error}`, 'error');
            }
        } catch (e) {
            addLog(`批次更新發生錯誤: ${e.message}`, 'error');
        } finally{
            setIsBatchUpdating(false);
        }
    };
    // Toggle checkbox
    const toggleSelection = (id)=>{
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };
    // Toggle All
    const toggleSelectAll = ()=>{
        if (selectedIds.size === searchResults.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(searchResults.map((r)=>r['編號'])));
        }
    };
    // Toggle Details Row
    const toggleDetails = (index)=>{
        const newSet = new Set(expandedRows);
        if (newSet.has(index)) newSet.delete(index);
        else newSet.add(index);
        setExpandedRows(newSet);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-4f044084e7cd90f7" + " " + "min-h-screen bg-[#1a1d29] text-gray-100 p-8 font-sans",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-4f044084e7cd90f7" + " " + "max-w-7xl mx-auto space-y-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-4f044084e7cd90f7" + " " + "flex justify-between items-center bg-[#252836] p-6 rounded-xl border border-gray-700 shadow-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-4f044084e7cd90f7",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "jsx-4f044084e7cd90f7" + " " + "text-3xl font-extrabold text-white tracking-tight",
                                        children: [
                                            "平米內參 ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "text-cyan-400",
                                                children: "資料上傳工具"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 314,
                                                columnNumber: 96
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                        lineNumber: 314,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "jsx-4f044084e7cd90f7" + " " + "text-gray-400 mt-2 text-sm",
                                        children: "高效能、智慧化的實價登錄資料批次處理系統 v2.0 (Next.js)"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                        lineNumber: 315,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                lineNumber: 313,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>router.push('/'),
                                className: "jsx-4f044084e7cd90f7" + " " + "text-gray-400 hover:text-white transition-colors flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                        className: "jsx-4f044084e7cd90f7" + " " + "fas fa-arrow-left"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                        lineNumber: 318,
                                        columnNumber: 25
                                    }, this),
                                    " 返回儀表板"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                lineNumber: 317,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                        lineNumber: 312,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-4f044084e7cd90f7" + " " + "grid grid-cols-1 lg:grid-cols-3 gap-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-4f044084e7cd90f7" + " " + "space-y-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-4f044084e7cd90f7" + " " + "bg-[#252836] p-6 rounded-xl border border-gray-700 shadow-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "text-xl font-bold text-white mb-4 flex items-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "bg-cyan-900 text-cyan-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm",
                                                        children: "1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 328,
                                                        columnNumber: 33
                                                    }, this),
                                                    "資料庫連線"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 327,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "space-y-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "block text-sm font-medium text-gray-400 mb-1",
                                                                children: "Supabase URL"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 333,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                value: dbUrl,
                                                                onChange: (e)=>setDbUrl(e.target.value),
                                                                placeholder: "https://xyz.supabase.co",
                                                                className: "jsx-4f044084e7cd90f7" + " " + "w-full bg-gray-800 border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 334,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 332,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "block text-sm font-medium text-gray-400 mb-1",
                                                                children: "Service Role Key"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 343,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "password",
                                                                value: dbKey,
                                                                onChange: (e)=>setDbKey(e.target.value),
                                                                placeholder: "eyJhhGciOiJIUzI1NiIsInR5cCI...",
                                                                className: "jsx-4f044084e7cd90f7" + " " + "w-full bg-gray-800 border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 344,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 342,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: handleTestConnection,
                                                        className: "jsx-4f044084e7cd90f7" + " " + `w-full font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${isConnected ? 'bg-green-600 hover:bg-green-500 text-white cursor-default' : 'bg-gray-700 hover:bg-gray-600 text-white'}`,
                                                        children: isConnected ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "fas fa-check"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 359,
                                                                    columnNumber: 54
                                                                }, this),
                                                                " 連線成功"
                                                            ]
                                                        }, void 0, true) : '測試連線'
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 352,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 331,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                        lineNumber: 326,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-4f044084e7cd90f7" + " " + "bg-[#252836] p-6 rounded-xl border border-gray-700 shadow-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "text-xl font-bold text-white mb-4 flex items-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "bg-cyan-900 text-cyan-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm",
                                                        children: "2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 367,
                                                        columnNumber: 33
                                                    }, this),
                                                    "選擇資料來源"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 366,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleSelectFolders,
                                                disabled: isUploading,
                                                className: "jsx-4f044084e7cd90f7" + " " + "w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "fas fa-folder-open text-xl"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 375,
                                                        columnNumber: 33
                                                    }, this),
                                                    " 選擇 lvr_land 資料夾"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 370,
                                                columnNumber: 29
                                            }, this),
                                            files.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "mt-4 p-3 bg-gray-800/50 rounded-lg text-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "flex justify-between text-gray-300 mb-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-4f044084e7cd90f7",
                                                                children: "已找到檔案:"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 380,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "font-bold text-white",
                                                                children: [
                                                                    files.length,
                                                                    " 個"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 381,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 379,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "flex justify-between text-gray-400 text-xs",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-4f044084e7cd90f7",
                                                                children: "主表 (Main):"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 384,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-4f044084e7cd90f7",
                                                                children: files.filter((f)=>f.isMain).length
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 385,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 383,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "flex justify-between text-gray-400 text-xs",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-4f044084e7cd90f7",
                                                                children: "附表 (Sub):"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 388,
                                                                columnNumber: 41
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "jsx-4f044084e7cd90f7",
                                                                children: files.filter((f)=>!f.isMain).length
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 389,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 387,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 378,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                        lineNumber: 365,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-4f044084e7cd90f7" + " " + "bg-[#252836] p-6 rounded-xl border border-gray-700 shadow-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "text-xl font-bold text-white mb-4 flex items-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "bg-cyan-900 text-cyan-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm",
                                                        children: "3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 398,
                                                        columnNumber: 33
                                                    }, this),
                                                    "開始處理"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 397,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "space-y-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "block text-sm font-medium text-gray-400 mb-2",
                                                                children: "上傳類型"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 403,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "grid grid-cols-2 gap-2",
                                                                children: [
                                                                    'all',
                                                                    'a',
                                                                    'b',
                                                                    'c'
                                                                ].map((type)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "jsx-4f044084e7cd90f7" + " " + `cursor-pointer border rounded-lg p-2 text-center transition-all ${uploadType === type ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`,
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                type: "radio",
                                                                                name: "uploadType",
                                                                                value: type,
                                                                                checked: uploadType === type,
                                                                                onChange: (e)=>setUploadType(e.target.value),
                                                                                disabled: isUploading,
                                                                                className: "jsx-4f044084e7cd90f7" + " " + "sr-only"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                                lineNumber: 410,
                                                                                columnNumber: 49
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "jsx-4f044084e7cd90f7" + " " + "font-bold",
                                                                                children: type === 'all' ? '全部' : type === 'a' ? '中古' : type === 'b' ? '預售' : '租賃'
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                                lineNumber: 419,
                                                                                columnNumber: 49
                                                                            }, this)
                                                                        ]
                                                                    }, type, true, {
                                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                        lineNumber: 406,
                                                                        columnNumber: 45
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 404,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 402,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: handleStartUpload,
                                                        disabled: !isConnected || files.length === 0 || isUploading,
                                                        className: "jsx-4f044084e7cd90f7" + " " + "w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                                                        children: [
                                                            isUploading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "fas fa-spinner fa-spin"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 429,
                                                                columnNumber: 52
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "fas fa-rocket"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 429,
                                                                columnNumber: 95
                                                            }, this),
                                                            isUploading ? '處理中...' : '開始上傳'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 424,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 401,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                        lineNumber: 396,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-4f044084e7cd90f7" + " " + "bg-[#252836] p-6 rounded-xl border border-gray-700 shadow-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "text-xl font-bold text-white mb-4 flex items-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "bg-cyan-900 text-cyan-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm",
                                                        children: "4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 438,
                                                        columnNumber: 33
                                                    }, this),
                                                    "資料批次修改 (獨立功能)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 437,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "space-y-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "block text-sm font-medium text-gray-400 mb-1",
                                                                children: "選擇縣市"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 443,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                value: updateCounty,
                                                                onChange: (e)=>setUpdateCounty(e.target.value),
                                                                className: "jsx-4f044084e7cd90f7" + " " + "w-full bg-gray-800 border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500",
                                                                children: Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["counties"]).map(([code, name])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: code.toLowerCase(),
                                                                        className: "jsx-4f044084e7cd90f7",
                                                                        children: name
                                                                    }, code, false, {
                                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                        lineNumber: 450,
                                                                        columnNumber: 45
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 444,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 442,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "block text-sm font-medium text-gray-400 mb-2",
                                                                children: "交易類型"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 455,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "grid grid-cols-2 gap-2",
                                                                children: [
                                                                    'a',
                                                                    'b',
                                                                    'c'
                                                                ].map((type)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "jsx-4f044084e7cd90f7" + " " + `cursor-pointer border rounded-lg p-2 text-center transition-all ${updateType === type ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`,
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                type: "radio",
                                                                                name: "updateType",
                                                                                value: type,
                                                                                checked: updateType === type,
                                                                                onChange: (e)=>setUpdateType(e.target.value),
                                                                                disabled: isSearching,
                                                                                className: "jsx-4f044084e7cd90f7" + " " + "sr-only"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                                lineNumber: 462,
                                                                                columnNumber: 49
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "jsx-4f044084e7cd90f7" + " " + "font-bold",
                                                                                children: type === 'a' ? '中古' : type === 'b' ? '預售' : '租賃'
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                                lineNumber: 471,
                                                                                columnNumber: 49
                                                                            }, this)
                                                                        ]
                                                                    }, type, true, {
                                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                        lineNumber: 458,
                                                                        columnNumber: 45
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 456,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 454,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "block text-sm font-medium text-gray-400 mb-1",
                                                                children: "搜尋欄位"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 477,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                value: updateSearchField,
                                                                onChange: (e)=>setUpdateSearchField(e.target.value),
                                                                className: "jsx-4f044084e7cd90f7" + " " + "w-full bg-gray-800 border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500",
                                                                children: [
                                                                    Array.from(new Set(Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["columnMappings"][updateType] || {}))).filter((f)=>![
                                                                            '編號',
                                                                            'id'
                                                                        ].includes(f)).sort().map((field)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                            value: field,
                                                                            className: "jsx-4f044084e7cd90f7",
                                                                            children: field
                                                                        }, field, false, {
                                                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                            lineNumber: 487,
                                                                            columnNumber: 49
                                                                        }, this)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "編號",
                                                                        className: "jsx-4f044084e7cd90f7",
                                                                        children: "編號"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                        lineNumber: 489,
                                                                        columnNumber: 41
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 478,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 476,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "block text-sm font-medium text-gray-400 mb-1",
                                                                children: "關鍵字"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 493,
                                                                columnNumber: 37
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                value: updateKeyword,
                                                                onChange: (e)=>setUpdateKeyword(e.target.value),
                                                                onKeyDown: (e)=>e.key === 'Enter' && handleSearch(),
                                                                placeholder: "輸入關鍵字...",
                                                                className: "jsx-4f044084e7cd90f7" + " " + "w-full bg-gray-800 border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 494,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 492,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: handleSearch,
                                                        disabled: !isConnected || isSearching,
                                                        className: "jsx-4f044084e7cd90f7" + " " + "w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50",
                                                        children: [
                                                            isSearching ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "fas fa-spinner fa-spin"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 508,
                                                                columnNumber: 52
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "fas fa-search"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 508,
                                                                columnNumber: 95
                                                            }, this),
                                                            isSearching ? '搜尋中...' : '搜尋資料'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 503,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 441,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                        lineNumber: 436,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                lineNumber: 324,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-4f044084e7cd90f7" + " " + "lg:col-span-2 space-y-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-4f044084e7cd90f7" + " " + "bg-[#252836] p-6 rounded-xl border border-gray-700 shadow-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "text-gray-300 font-bold mb-4 flex justify-between items-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-4f044084e7cd90f7",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "fas fa-tasks mr-2 text-purple-400"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 520,
                                                                columnNumber: 39
                                                            }, this),
                                                            "執行進度"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 520,
                                                        columnNumber: 33
                                                    }, this),
                                                    isUploading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "text-cyan-400",
                                                        children: [
                                                            progress,
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 521,
                                                        columnNumber: 49
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 519,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "w-full bg-gray-700 rounded-full h-4 mb-2 overflow-hidden",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        width: `${progress}%`
                                                    },
                                                    className: "jsx-4f044084e7cd90f7" + " " + "bg-gradient-to-r from-cyan-500 to-purple-500 h-4 rounded-full transition-all duration-300 relative",
                                                    children: isUploading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "absolute inset-0 bg-white/20 animate-pulse"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 528,
                                                        columnNumber: 53
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 524,
                                                    columnNumber: 33
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 523,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "text-xs text-gray-500 h-5",
                                                children: currentFile && `正在處理: ${currentFile}`
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 531,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                        lineNumber: 518,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-4f044084e7cd90f7" + " " + "bg-black/60 p-4 rounded-xl border border-gray-800 h-[500px] overflow-hidden flex flex-col font-mono text-sm shadow-inner",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "flex justify-between items-center mb-2 border-b border-gray-800 pb-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "text-gray-400 font-bold",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                                className: "jsx-4f044084e7cd90f7" + " " + "fas fa-terminal mr-2"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 539,
                                                                columnNumber: 75
                                                            }, this),
                                                            "系統日誌"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 539,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setLogs([]),
                                                        className: "jsx-4f044084e7cd90f7" + " " + "text-xs text-gray-600 hover:text-gray-300 transition-colors",
                                                        children: "清除"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 540,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 538,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                ref: (el)=>{
                                                    if (el) el.scrollTop = el.scrollHeight;
                                                },
                                                className: "jsx-4f044084e7cd90f7" + " " + "flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar",
                                                children: [
                                                    logs.map((log)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-4f044084e7cd90f7" + " " + `flex gap-3 leading-relaxed border-b border-white/5 pb-1 ${log.type === 'error' ? 'text-red-400 bg-red-900/10' : log.type === 'warning' ? 'text-yellow-400' : log.type === 'success' ? 'text-emerald-400' : 'text-gray-300'}`,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "text-gray-600 select-none",
                                                                    children: [
                                                                        "[",
                                                                        log.time,
                                                                        "]"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 548,
                                                                    columnNumber: 41
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "break-all",
                                                                    children: log.text
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 549,
                                                                    columnNumber: 41
                                                                }, this)
                                                            ]
                                                        }, log.id, true, {
                                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                            lineNumber: 544,
                                                            columnNumber: 37
                                                        }, this)),
                                                    logs.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "text-gray-700 italic text-center mt-20",
                                                        children: "等待任務啟動..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 552,
                                                        columnNumber: 55
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 542,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                        lineNumber: 537,
                                        columnNumber: 25
                                    }, this),
                                    summary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-4f044084e7cd90f7" + " " + "grid grid-cols-2 md:grid-cols-4 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "bg-emerald-900/20 border border-emerald-800 p-4 rounded-xl text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "text-3xl font-bold text-emerald-400",
                                                        children: summary.new
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 560,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "text-sm text-emerald-200/70 uppercase tracking-wider mt-1",
                                                        children: "New"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 561,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 559,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "bg-yellow-900/20 border border-yellow-800 p-4 rounded-xl text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "text-3xl font-bold text-yellow-400",
                                                        children: summary.updated
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 564,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "text-sm text-yellow-200/70 uppercase tracking-wider mt-1",
                                                        children: "Updated"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 565,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 563,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "bg-gray-800/40 border border-gray-700 p-4 rounded-xl text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "text-3xl font-bold text-gray-400",
                                                        children: summary.identical
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 568,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "text-sm text-gray-500 uppercase tracking-wider mt-1",
                                                        children: "Skipped"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 569,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 567,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-4f044084e7cd90f7" + " " + "bg-red-900/20 border border-red-800 p-4 rounded-xl text-center",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "text-3xl font-bold text-red-400",
                                                        children: summary.errors
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 572,
                                                        columnNumber: 37
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "text-sm text-red-200/70 uppercase tracking-wider mt-1",
                                                        children: "Errors"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 573,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 571,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                        lineNumber: 558,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                lineNumber: 516,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                        lineNumber: 322,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                lineNumber: 309,
                columnNumber: 13
            }, this),
            showUpdateModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-4f044084e7cd90f7" + " " + "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-4f044084e7cd90f7" + " " + "bg-[#1a1d29] border border-gray-700 rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-4f044084e7cd90f7" + " " + "p-4 border-b border-gray-700 flex justify-between items-center bg-[#252836] rounded-t-xl",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-4f044084e7cd90f7",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "jsx-4f044084e7cd90f7" + " " + "text-xl font-bold text-white",
                                            children: "批次修改搜尋結果"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 588,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "jsx-4f044084e7cd90f7" + " " + "text-sm text-gray-400 mt-1",
                                            children: [
                                                "資料表: ",
                                                currentUpdateContext?.tableName,
                                                " | 搜尋條件: ",
                                                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["counties"][updateCounty.toUpperCase()],
                                                " ",
                                                updateSearchField,
                                                " like '%",
                                                updateKeyword,
                                                "%' | 共 ",
                                                searchResults.length,
                                                " 筆"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 589,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 587,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowUpdateModal(false),
                                    className: "jsx-4f044084e7cd90f7" + " " + "text-gray-400 hover:text-white transition-colors",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                        className: "jsx-4f044084e7cd90f7" + " " + "fas fa-times text-xl"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                        lineNumber: 599,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 595,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                            lineNumber: 586,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-4f044084e7cd90f7" + " " + "p-4 border-b border-gray-700 bg-gray-800/50 flex gap-4 items-end flex-wrap",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-4f044084e7cd90f7" + " " + "flex items-center gap-2 text-sm text-gray-300",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: selectedIds.size > 0 && selectedIds.size === searchResults.length,
                                            onChange: toggleSelectAll,
                                            className: "jsx-4f044084e7cd90f7" + " " + "form-checkbox h-5 w-5 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 606,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "jsx-4f044084e7cd90f7",
                                            children: [
                                                "全選 (",
                                                selectedIds.size,
                                                " 筆)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 612,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 605,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-4f044084e7cd90f7" + " " + "flex-1"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 615,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-4f044084e7cd90f7" + " " + "flex gap-2 items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-4f044084e7cd90f7",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "jsx-4f044084e7cd90f7" + " " + "block text-xs text-gray-400 mb-1",
                                                    children: "欲修改欄位"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 619,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: batchUpdateField,
                                                    onChange: (e)=>setBatchUpdateField(e.target.value),
                                                    className: "jsx-4f044084e7cd90f7" + " " + "bg-gray-800 border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:ring-cyan-500",
                                                    children: Array.from(new Set(Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["columnMappings"][updateType] || {}))).filter((f)=>![
                                                            '編號',
                                                            'id'
                                                        ].includes(f)).sort().map((field)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: field,
                                                            className: "jsx-4f044084e7cd90f7",
                                                            children: field
                                                        }, field, false, {
                                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                            lineNumber: 629,
                                                            columnNumber: 49
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 620,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 618,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-4f044084e7cd90f7",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "jsx-4f044084e7cd90f7" + " " + "block text-xs text-gray-400 mb-1",
                                                    children: "新數值"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 634,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: batchUpdateValue,
                                                    onChange: (e)=>setBatchUpdateValue(e.target.value),
                                                    placeholder: "輸入新內容...",
                                                    className: "jsx-4f044084e7cd90f7" + " " + "bg-gray-800 border-gray-600 rounded px-3 py-1.5 text-sm text-white w-48 focus:ring-cyan-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 635,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 633,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-4f044084e7cd90f7" + " " + "pb-0.5",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleExecuteBatchUpdate,
                                                disabled: selectedIds.size === 0 || isBatchUpdating,
                                                className: "jsx-4f044084e7cd90f7" + " " + "bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-4 rounded transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed h-[34px]",
                                                children: isBatchUpdating ? '更新中...' : '執行批次更新'
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 644,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 643,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 617,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                            lineNumber: 604,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-4f044084e7cd90f7" + " " + "flex-1 overflow-auto p-4 custom-scrollbar",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "jsx-4f044084e7cd90f7" + " " + "w-full text-left border-collapse",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            className: "jsx-4f044084e7cd90f7" + " " + "bg-gray-800 sticky top-0 z-10",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "jsx-4f044084e7cd90f7",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-12",
                                                        children: "選取"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 660,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-24",
                                                        children: "編號"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 661,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-24",
                                                        children: "行政區"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 662,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-48",
                                                        children: "建案名稱"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 663,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-xs font-bold text-gray-400 border-b border-gray-700",
                                                        children: "地址/位置"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 664,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-16",
                                                        children: "操作"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 665,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 659,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 658,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            className: "jsx-4f044084e7cd90f7" + " " + "text-sm",
                                            children: searchResults.map((row, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            className: "jsx-4f044084e7cd90f7" + " " + "hover:bg-white/5 border-b border-gray-800",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "p-3",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "checkbox",
                                                                        checked: selectedIds.has(row['編號']),
                                                                        onChange: ()=>toggleSelection(row['編號']),
                                                                        className: "jsx-4f044084e7cd90f7" + " " + "form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                        lineNumber: 673,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 672,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "p-3 font-mono text-xs text-gray-400",
                                                                    children: row['編號']
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 680,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "p-3",
                                                                    children: row['行政區']
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 681,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-cyan-300",
                                                                    children: row['建案名稱']
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 682,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-gray-400 truncate max-w-[200px]",
                                                                    children: row['其他門牌'] || row['地址'] || row['土地位置建物門牌']
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 683,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "p-3",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>toggleDetails(idx),
                                                                        className: "jsx-4f044084e7cd90f7" + " " + "text-gray-500 hover:text-white text-xs underline",
                                                                        children: expandedRows.has(idx) ? '收合' : '明細'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                        lineNumber: 685,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 684,
                                                                    columnNumber: 49
                                                                }, this)
                                                            ]
                                                        }, row['編號'], true, {
                                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                            lineNumber: 671,
                                                            columnNumber: 45
                                                        }, this),
                                                        expandedRows.has(idx) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            className: "jsx-4f044084e7cd90f7" + " " + "bg-gray-900/50",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                colSpan: 6,
                                                                className: "jsx-4f044084e7cd90f7" + " " + "p-4 border-b border-gray-800",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "grid grid-cols-2 md:grid-cols-4 gap-4 text-xs",
                                                                    children: Object.entries(row).filter(([k])=>k !== 'id').map(([key, val])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-4f044084e7cd90f7",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "jsx-4f044084e7cd90f7" + " " + "text-gray-500 mb-1",
                                                                                    children: key
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                                    lineNumber: 699,
                                                                                    columnNumber: 69
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "jsx-4f044084e7cd90f7" + " " + "text-gray-300 break-all",
                                                                                    children: String(val)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                                    lineNumber: 700,
                                                                                    columnNumber: 69
                                                                                }, this)
                                                                            ]
                                                                        }, key, true, {
                                                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                            lineNumber: 698,
                                                                            columnNumber: 65
                                                                        }, this))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 696,
                                                                    columnNumber: 57
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 695,
                                                                columnNumber: 53
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                            lineNumber: 694,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true))
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 668,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 657,
                                    columnNumber: 29
                                }, this),
                                searchResults.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-4f044084e7cd90f7" + " " + "text-center py-20 text-gray-500",
                                    children: "無符合資料"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 712,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                            lineNumber: 656,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                    lineNumber: 584,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                lineNumber: 583,
                columnNumber: 17
            }, this),
            showUpdateModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: ()=>setShowUpdateModal(false),
                className: "jsx-4f044084e7cd90f7" + " " + "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-opacity animate-in fade-in duration-200",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    onClick: (e)=>e.stopPropagation(),
                    className: "jsx-4f044084e7cd90f7" + " " + "bg-[#1a1d29] border border-gray-700 rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-4f044084e7cd90f7" + " " + "p-4 border-b border-gray-700 flex justify-between items-center bg-[#252836] rounded-t-xl",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-4f044084e7cd90f7",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "jsx-4f044084e7cd90f7" + " " + "text-xl font-bold text-white",
                                            children: "批次修改搜尋結果"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 734,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "jsx-4f044084e7cd90f7" + " " + "text-sm text-gray-400 mt-1",
                                            children: [
                                                "資料表: ",
                                                currentUpdateContext?.tableName,
                                                " | 搜尋條件: ",
                                                __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["counties"][updateCounty.toUpperCase()],
                                                " ",
                                                updateSearchField,
                                                " like '%",
                                                updateKeyword,
                                                "%' | 共 ",
                                                searchResults.length,
                                                " 筆"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 735,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 733,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowUpdateModal(false),
                                    title: "關閉視窗 (Esc)",
                                    className: "jsx-4f044084e7cd90f7" + " " + "text-gray-400 hover:text-white hover:bg-gray-700/50 p-2 rounded-full transition-colors flex items-center justify-center w-8 h-8",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                        className: "jsx-4f044084e7cd90f7" + " " + "fas fa-times text-xl"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                        lineNumber: 746,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 741,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                            lineNumber: 732,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-4f044084e7cd90f7" + " " + "bg-[#252836] border-b border-gray-700",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setShowModalSearch(!showModalSearch),
                                    className: "jsx-4f044084e7cd90f7" + " " + "w-full text-center py-2 text-xs text-gray-500 hover:text-white hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                            className: "jsx-4f044084e7cd90f7" + " " + `fas fa-search ${showModalSearch ? 'text-cyan-400' : ''}`
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 756,
                                            columnNumber: 33
                                        }, this),
                                        showModalSearch ? '收合搜尋條件' : '再次搜尋 / 修改條件'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 752,
                                    columnNumber: 29
                                }, this),
                                showModalSearch && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-4f044084e7cd90f7" + " " + "p-4 grid grid-cols-1 md:grid-cols-5 gap-4 animate-in slide-in-from-top-2 duration-200",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-4f044084e7cd90f7",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "jsx-4f044084e7cd90f7" + " " + "block text-xs text-gray-400 mb-1",
                                                    children: "縣市"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 763,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: updateCounty,
                                                    onChange: (e)=>setUpdateCounty(e.target.value),
                                                    className: "jsx-4f044084e7cd90f7" + " " + "w-full bg-gray-800 border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:ring-cyan-500",
                                                    children: Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["counties"]).map(([code, name])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: code.toLowerCase(),
                                                            className: "jsx-4f044084e7cd90f7",
                                                            children: name
                                                        }, code, false, {
                                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                            lineNumber: 770,
                                                            columnNumber: 49
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 764,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 762,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-4f044084e7cd90f7",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "jsx-4f044084e7cd90f7" + " " + "block text-xs text-gray-400 mb-1",
                                                    children: "類型"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 775,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-4f044084e7cd90f7" + " " + "flex bg-gray-800 rounded border border-gray-600 p-0.5",
                                                    children: [
                                                        'a',
                                                        'b',
                                                        'c'
                                                    ].map((type)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setUpdateType(type),
                                                            className: "jsx-4f044084e7cd90f7" + " " + `flex-1 text-xs py-1 rounded transition-colors ${updateType === type ? 'bg-cyan-900 text-cyan-400' : 'text-gray-400 hover:text-white'}`,
                                                            children: type === 'a' ? '中古' : type === 'b' ? '預售' : '租賃'
                                                        }, type, false, {
                                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                            lineNumber: 778,
                                                            columnNumber: 49
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 776,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 774,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-4f044084e7cd90f7",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "jsx-4f044084e7cd90f7" + " " + "block text-xs text-gray-400 mb-1",
                                                    children: "欄位"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 791,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: updateSearchField,
                                                    onChange: (e)=>setUpdateSearchField(e.target.value),
                                                    className: "jsx-4f044084e7cd90f7" + " " + "w-full bg-gray-800 border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:ring-cyan-500",
                                                    children: [
                                                        Array.from(new Set(Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["columnMappings"][updateType] || {}))).filter((f)=>![
                                                                '編號',
                                                                'id'
                                                            ].includes(f)).sort().map((field)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: field,
                                                                className: "jsx-4f044084e7cd90f7",
                                                                children: field
                                                            }, field, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 801,
                                                                columnNumber: 53
                                                            }, this)),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "編號",
                                                            className: "jsx-4f044084e7cd90f7",
                                                            children: "編號"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                            lineNumber: 803,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 792,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 790,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-4f044084e7cd90f7",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "jsx-4f044084e7cd90f7" + " " + "block text-xs text-gray-400 mb-1",
                                                    children: "關鍵字"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 807,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: updateKeyword,
                                                    onChange: (e)=>setUpdateKeyword(e.target.value),
                                                    onKeyDown: (e)=>e.key === 'Enter' && handleSearch(),
                                                    placeholder: "關鍵字...",
                                                    className: "jsx-4f044084e7cd90f7" + " " + "w-full bg-gray-800 border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:ring-cyan-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 808,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 806,
                                            columnNumber: 37
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-4f044084e7cd90f7" + " " + "flex items-end",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleSearch,
                                                disabled: isSearching,
                                                className: "jsx-4f044084e7cd90f7" + " " + "w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-1.5 px-4 rounded transition-colors text-sm h-[34px] flex items-center justify-center gap-2 disabled:opacity-50",
                                                children: [
                                                    isSearching ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "fas fa-spinner fa-spin"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 823,
                                                        columnNumber: 60
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "fas fa-search"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 823,
                                                        columnNumber: 103
                                                    }, this),
                                                    "搜尋"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 818,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 817,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 761,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                            lineNumber: 751,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-4f044084e7cd90f7" + " " + "p-4 border-b border-gray-700 bg-gray-800/50 flex gap-4 items-end flex-wrap",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-4f044084e7cd90f7" + " " + "flex items-center gap-2 text-sm text-gray-300",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: selectedIds.size > 0 && selectedIds.size === searchResults.length,
                                            onChange: toggleSelectAll,
                                            className: "jsx-4f044084e7cd90f7" + " " + "form-checkbox h-5 w-5 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 834,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "jsx-4f044084e7cd90f7",
                                            children: [
                                                "全選 (",
                                                selectedIds.size,
                                                " 筆)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 840,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 833,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-4f044084e7cd90f7" + " " + "flex-1"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 843,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-4f044084e7cd90f7" + " " + "flex gap-2 items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-4f044084e7cd90f7",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "jsx-4f044084e7cd90f7" + " " + "block text-xs text-gray-400 mb-1",
                                                    children: "欲修改欄位"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 847,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    value: batchUpdateField,
                                                    onChange: (e)=>setBatchUpdateField(e.target.value),
                                                    className: "jsx-4f044084e7cd90f7" + " " + "bg-gray-800 border-gray-600 rounded px-3 py-1.5 text-sm text-white focus:ring-cyan-500",
                                                    children: Array.from(new Set(Object.values(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$src$2f$lib$2f$uploader$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["columnMappings"][updateType] || {}))).filter((f)=>![
                                                            '編號',
                                                            'id'
                                                        ].includes(f)).sort().map((field)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: field,
                                                            className: "jsx-4f044084e7cd90f7",
                                                            children: field
                                                        }, field, false, {
                                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                            lineNumber: 857,
                                                            columnNumber: 49
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 848,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 846,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-4f044084e7cd90f7",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "jsx-4f044084e7cd90f7" + " " + "block text-xs text-gray-400 mb-1",
                                                    children: "新數值"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 862,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: batchUpdateValue,
                                                    onChange: (e)=>setBatchUpdateValue(e.target.value),
                                                    placeholder: "輸入新內容...",
                                                    className: "jsx-4f044084e7cd90f7" + " " + "bg-gray-800 border-gray-600 rounded px-3 py-1.5 text-sm text-white w-48 focus:ring-cyan-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                    lineNumber: 863,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 861,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-4f044084e7cd90f7" + " " + "pb-0.5",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleExecuteBatchUpdate,
                                                disabled: selectedIds.size === 0 || isBatchUpdating,
                                                className: "jsx-4f044084e7cd90f7" + " " + "bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-4 rounded transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed h-[34px]",
                                                children: isBatchUpdating ? '更新中...' : '執行批次更新'
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 872,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 871,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 845,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                            lineNumber: 832,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-4f044084e7cd90f7" + " " + "flex-1 overflow-auto p-4 custom-scrollbar",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "jsx-4f044084e7cd90f7" + " " + "w-full text-left border-collapse",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            className: "jsx-4f044084e7cd90f7" + " " + "bg-gray-800 sticky top-0 z-10",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "jsx-4f044084e7cd90f7",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-12",
                                                        children: "選取"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 888,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-24",
                                                        children: "編號"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 889,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-24",
                                                        children: "行政區"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 890,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-48",
                                                        children: "建案名稱"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 891,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-xs font-bold text-gray-400 border-b border-gray-700",
                                                        children: "地址/位置"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 892,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-xs font-bold text-gray-400 border-b border-gray-700 w-16",
                                                        children: "操作"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                        lineNumber: 893,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                lineNumber: 887,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 886,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            className: "jsx-4f044084e7cd90f7" + " " + "text-sm",
                                            children: searchResults.map((row, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            className: "jsx-4f044084e7cd90f7" + " " + "hover:bg-white/5 border-b border-gray-800",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "p-3",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "checkbox",
                                                                        checked: selectedIds.has(row['編號']),
                                                                        onChange: ()=>toggleSelection(row['編號']),
                                                                        className: "jsx-4f044084e7cd90f7" + " " + "form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                        lineNumber: 901,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 900,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "p-3 font-mono text-xs text-gray-400",
                                                                    children: row['編號']
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 908,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "p-3",
                                                                    children: row['行政區']
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 909,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-cyan-300",
                                                                    children: row['建案名稱']
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 910,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "p-3 text-gray-400 truncate max-w-[200px]",
                                                                    children: row['其他門牌'] || row['地址'] || row['土地位置建物門牌']
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 911,
                                                                    columnNumber: 49
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "p-3",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>toggleDetails(idx),
                                                                        className: "jsx-4f044084e7cd90f7" + " " + "text-gray-500 hover:text-white text-xs underline",
                                                                        children: expandedRows.has(idx) ? '收合' : '明細'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                        lineNumber: 913,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 912,
                                                                    columnNumber: 49
                                                                }, this)
                                                            ]
                                                        }, row['編號'], true, {
                                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                            lineNumber: 899,
                                                            columnNumber: 45
                                                        }, this),
                                                        expandedRows.has(idx) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            className: "jsx-4f044084e7cd90f7" + " " + "bg-gray-900/50",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                colSpan: 6,
                                                                className: "jsx-4f044084e7cd90f7" + " " + "p-4 border-b border-gray-800",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-4f044084e7cd90f7" + " " + "grid grid-cols-2 md:grid-cols-4 gap-4 text-xs",
                                                                    children: Object.entries(row).filter(([k])=>k !== 'id').map(([key, val])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-4f044084e7cd90f7",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "jsx-4f044084e7cd90f7" + " " + "text-gray-500 mb-1",
                                                                                    children: key
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                                    lineNumber: 927,
                                                                                    columnNumber: 69
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "jsx-4f044084e7cd90f7" + " " + "text-gray-300 break-all",
                                                                                    children: String(val)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                                    lineNumber: 928,
                                                                                    columnNumber: 69
                                                                                }, this)
                                                                            ]
                                                                        }, key, true, {
                                                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                            lineNumber: 926,
                                                                            columnNumber: 65
                                                                        }, this))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                    lineNumber: 924,
                                                                    columnNumber: 57
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                                lineNumber: 923,
                                                                columnNumber: 53
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                                            lineNumber: 922,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true))
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                            lineNumber: 896,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 885,
                                    columnNumber: 29
                                }, this),
                                searchResults.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-4f044084e7cd90f7" + " " + "text-center py-20 text-gray-500",
                                    children: "無符合資料"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                                    lineNumber: 940,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                            lineNumber: 884,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                    lineNumber: 727,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
                lineNumber: 723,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "4f044084e7cd90f7",
                children: ".custom-scrollbar::-webkit-scrollbar{width:8px}.custom-scrollbar::-webkit-scrollbar-track{background:#0003}.custom-scrollbar::-webkit-scrollbar-thumb{background:#ffffff1a;border-radius:4px}.custom-scrollbar::-webkit-scrollbar-thumb:hover{background:#fff3}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/vibe01/next-app/src/app/admin/uploader/page.tsx",
        lineNumber: 308,
        columnNumber: 9
    }, this);
}
_s(UploaderPage, "9y5OeaBo5Yl3ldyuM7QVHOtRJmE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$vibe01$2f$next$2d$app$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = UploaderPage;
var _c;
__turbopack_context__.k.register(_c, "UploaderPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_vibe01_next-app_src_5093be40._.js.map