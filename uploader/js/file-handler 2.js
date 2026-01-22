// uploader/js/file-handler.js

import { addLog } from './ui.js';
import { state } from './state.js';
import { columnMappings } from './config.js';
import { processRow } from './utils.js';

/**
 * 遞迴掃描指定目錄，找出所有 .csv 檔案
 * @param {FileSystemDirectoryHandle} dirHandle - 目錄控制代碼
 * @param {string} [path=''] - 目前的相對路徑
 * @returns {Promise<Array<object>>} - 包含檔案控制代碼和路徑的物件陣列
 */
export async function scanDirectory(dirHandle, path = '') {
    let files = [];
    for await (const entry of dirHandle.values()) {
        const currentPath = path ? `${path}/${entry.name}` : entry.name;
        if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.csv')) {
            files.push({ handle: entry, path: currentPath });
        } else if (entry.kind === 'directory') {
            // 如果是子資料夾，就遞迴掃描
            files.push(...await scanDirectory(entry, currentPath));
        }
    }
    return files;
}

/**
 * 使用 PapaParse 解析單一 CSV 檔案的內容
 * @param {object} fileInfo - 包含檔案控制代碼和路徑的檔案資訊物件
 * @returns {Promise<Array<object>>} - 解析並處理過的資料陣列
 */
export async function parseFile(fileInfo) {
    const file = await fileInfo.fileHandle.getFile();

    // 使用 Promise 包裝 PapaParse 的回呼函式
    const parseResult = await new Promise((resolve) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            trimHeaders: true,
            complete: resolve
        });
    });

    // 錯誤處理
    if (parseResult.errors && parseResult.errors.length > 0) {
        // 定義可忽略的非嚴重錯誤
        const nonCriticalErrorCodes = ['TooManyFields', 'TooFewFields', 'MissingQuotes'];
        const criticalErrors = parseResult.errors.filter(e => !nonCriticalErrorCodes.includes(e.code));

        if (criticalErrors.length > 0) {
            // 如果有嚴重錯誤，直接拋出異常
            throw new Error(`CSV 嚴重解析錯誤: ${criticalErrors[0].message}`);
        }

        // 對於非嚴重錯誤，視為警告並記錄
        parseResult.errors.forEach(warning => {
            addLog(`檔案 ${fileInfo.fullPath} 有解析警告 (已忽略): ${warning.message} (行: ${warning.row + 2})`, 'warning', 'status');
            state.summary.warnings++;
        });
    }

    if (!parseResult.data || parseResult.data.length === 0) {
        return [];
    }

    let dataRows = parseResult.data;
    // 移除 CSV 檔案中可能存在的英文標頭行
    if (dataRows[0]['編號']?.toLowerCase().includes('serial number')) {
        dataRows.shift();
    }

    const mapping = columnMappings[fileInfo.tableType];
    if (!mapping) {
        throw new Error(`檔案 ${fileInfo.name} 找不到對應的欄位規則。`);
    }

    // 遍歷每一行資料，並使用 processRow 進行格式轉換
    let processedData = dataRows.map(row => processRow(row, mapping));

    // 【新增】套用建案名稱自動替換對應
    if (state.projectNameMappings && state.projectNameMappings.size > 0) {
        let replacementCount = 0;
        processedData = processedData.map(row => {
            const originalName = row['建案名稱'];
            if (originalName && state.projectNameMappings.has(originalName)) {
                row['建案名稱'] = state.projectNameMappings.get(originalName);
                replacementCount++;
            }
            return row;
        });
        if (replacementCount > 0) {
            addLog(`已自動替換 ${replacementCount} 筆建案名稱`, 'info');
        }
    }

    return processedData;
}