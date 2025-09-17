// uploader/js/supabase-service.js

import { DOM } from './dom.js';
import { state } from './state.js';
import { addLog, updateConnectionStatus } from './ui.js';
import { isEqual } from './utils.js';
import { parseFile } from './file-handler.js';

/**
 * 測試與 Supabase 的連線
 */
export async function testConnection() {
    const supabaseUrl = DOM.supabaseUrlInput.value;
    const supabaseKey = DOM.supabaseKeyInput.value;
    if (!supabaseUrl || !supabaseKey) {
        addLog('請填寫完整的 Supabase URL 和 Service Role Key。', 'error', 'error');
        return;
    }
    addLog('正在測試連線...', 'info');
    try {
        const testSupabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        const { error } = await testSupabase.from('county_codes').select('code', { count: 'exact', head: true });
        
        if (error && error.code !== '42P01') throw error;

        addLog('連線成功！', 'success');
        updateConnectionStatus(true);
        state.supabase = testSupabase;
    } catch (error) {
        addLog(`連線失敗: ${error.message}`, 'error', 'error');
        updateConnectionStatus(false);
        state.supabase = null;
    }
}

/**
 * 上傳主表檔案，並進行智慧更新檢查
 * @param {object} fileInfo - 檔案資訊物件
 */
export async function uploadMainFileWithSmartUpdate(fileInfo) {
    try {
        const tableName = `${fileInfo.countyCode}_lvr_land_${fileInfo.tableType}`;
        const processedData = await parseFile(fileInfo);

        if (!processedData || processedData.length === 0) {
            addLog(`${fileInfo.fullPath}: 檔案為空或無有效資料，已跳過`, 'warning', 'status');
            return;
        }

        const chunkSize = 500;
        for (let i = 0; i < processedData.length; i += chunkSize) {
            const chunk = processedData.slice(i, i + chunkSize);
            const idsToCheck = chunk.map(row => row['編號']);

            const { data: existingData, error: fetchError } = await state.supabase.from(tableName).select('*').in('編號', idsToCheck);
            if (fetchError) throw fetchError;

            const existingDataMap = new Map(existingData.map(item => [item['編號'], item]));
            
            const newData = [];
            const updatedData = [];
            const idsToDeleteForUpdate = [];
            let identicalCount = 0;

            for (const newRecord of chunk) {
                const existingRecord = existingDataMap.get(newRecord['編號']);
                if (!existingRecord) {
                    newData.push(newRecord);
                } else if (!isEqual(newRecord, existingRecord, fileInfo.tableType)) {
                    idsToDeleteForUpdate.push(newRecord['編號']);
                    updatedData.push(newRecord);
                } else {
                    identicalCount++;
                }
            }
            
            addLog(`${fileInfo.fullPath} (區塊 ${Math.floor(i/chunkSize) + 1}): 新增 ${newData.length}, 更新 ${updatedData.length}, 跳過 ${identicalCount}`, 'info');
            state.summary.new += newData.length;
            state.summary.updated += updatedData.length;
            state.summary.identical += identicalCount;
            
            const idsToProcess = [...newData.map(r => r['編號']), ...updatedData.map(r => r['編號'])];
            idsToProcess.forEach(id => state.processedMainIds.add(id));

            if (idsToDeleteForUpdate.length > 0) {
                const { error: deleteError } = await state.supabase.from(tableName).delete().in('編號', idsToDeleteForUpdate);
                if (deleteError) throw deleteError;
            }

            const dataToUpload = [...newData, ...updatedData];
            if (dataToUpload.length > 0) {
                const { error: insertError } = await state.supabase.from(tableName).insert(dataToUpload);
                if (insertError) throw insertError;
            }
        }
    } catch (error) {
        addLog(`${fileInfo.fullPath} 上傳失敗: ${error.message}`, 'error', 'error');
        state.summary.errors++;
    }
}

/**
 * 上傳附表檔案
 * @param {object} fileInfo - 檔案資訊物件
 */
export async function uploadSubFile(fileInfo) {
    try {
        const tableName = `${fileInfo.countyCode}_lvr_land_${fileInfo.tableType}`;
        const allSubData = await parseFile(fileInfo);

        if (!allSubData || allSubData.length === 0) {
            addLog(`${fileInfo.fullPath}: 檔案為空或無有效資料，已跳過`, 'warning', 'status');
            return;
        }
        
        const dataToUpload = allSubData.filter(row => state.processedMainIds.has(row['編號']));

        if (dataToUpload.length > 0) {
            const { error } = await state.supabase.from(tableName).insert(dataToUpload);
            if (error) throw error;
            state.summary.subAdded += dataToUpload.length;
            addLog(`${fileInfo.fullPath}: 成功新增 ${dataToUpload.length} 筆關聯的附表紀錄`, 'success');
        } else {
            addLog(`${fileInfo.fullPath}: 無對應的主表變更，已跳過`, 'info');
        }
    } catch (error) {
        addLog(`${fileInfo.fullPath} 上傳失敗: ${error.message}`, 'error', 'error');
        state.summary.errors++;
    }
}

/**
 * ▼▼▼【新增】根據條件查詢紀錄 ▼▼▼
 * @param {string} countyCode - 縣市代碼 (e.g., 'a')
 * @param {string} type - 交易類型 ('a', 'b', 'c', or 'all')
 * @param {string} searchBy - 搜尋欄位 ('建案名稱' or '編號')
 * @param {string} keyword - 搜尋關鍵字
 * @returns {Promise<Array<object>>} - 查詢結果
 */
export async function searchRecords(countyCode, type, searchBy, keyword) {
    const typesToQuery = type === 'all' ? ['b', 'a', 'c'] : [type];
    let allResults = [];

    for (const t of typesToQuery) {
        const tableName = `${countyCode}_lvr_land_${t}`;
        // 預售屋才有建案名稱，其他類型則跳過
        if (searchBy === '建案名稱' && t !== 'b') {
            continue;
        }

        const query = state.supabase
            .from(tableName)
            .select('id, 編號, 建案名稱, 地址, 交易日')
            .ilike(searchBy, `%${keyword}%`); // ilike 是大小寫不敏感的模糊比對

        const { data, error } = await query;
        if (error) {
            // 如果表格不存在，就忽略錯誤並繼續查詢下一個
            if (error.code === '42P01') {
                addLog(`表格 ${tableName} 不存在，已跳過查詢。`, 'warning');
                continue;
            }
            throw new Error(`查詢 ${tableName} 時發生錯誤: ${error.message}`);
        }
        
        // 為每筆結果加上 tableType 屬性，方便後續更新時知道要操作哪個表格
        const resultsWithType = data.map(row => ({ ...row, tableType: t }));
        allResults = [...allResults, ...resultsWithType];
    }
    return allResults;
}

/**
 * ▼▼▼【新增】批次更新紀錄 ▼▼▼
 * @param {string} countyCode - 縣市代碼
 * @param {Map<string, Array<number>>} updatesByType - 按類型分類的待更新紀錄 ID
 * @param {string} field - 要更新的欄位
 * @param {string} newValue - 新的值
 */
export async function batchUpdateRecords(countyCode, updatesByType, field, newValue) {
    for (const [type, ids] of updatesByType.entries()) {
        const tableName = `${countyCode}_lvr_land_${type}`;
        const updateObject = { [field]: newValue };

        const { data, error } = await state.supabase
            .from(tableName)
            .update(updateObject)
            .in('id', ids);
            
        if (error) {
            throw new Error(`更新表格 ${tableName} 時失敗: ${error.message}`);
        }
    }
}
