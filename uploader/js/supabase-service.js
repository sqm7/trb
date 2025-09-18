// uploader/js/supabase-service.js

import { DOM } from './dom.js';
import { state } from './state.js';
import { addLog, updateConnectionStatus } from './ui.js';
import { isEqual, processRow } from './utils.js';
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

// ▼▼▼ 【已修正】搜尋資料函式 ▼▼▼
/**
 * 從 Supabase 查詢符合條件的資料
 * @param {string} countyCode - 縣市代碼 (e.g., 'a', 'f')
 * @param {string} transactionType - 交易類型 ('a', 'b', 'c')
 * @param {string} searchField - 搜尋欄位 ('建案名稱' 或 '編號')
 * @param {string} keyword - 搜尋關鍵字
 * @returns {Promise<{data: any[], error: any, tableName: string}>} - 查詢結果
 */
export async function searchData(countyCode, transactionType, searchField, keyword) {
    if (!state.supabase) throw new Error("Supabase 未連線");
    if (!countyCode) throw new Error("未選擇縣市");

    const tableName = `${countyCode.toLowerCase()}_lvr_land_${transactionType}`;
    
    addLog(`正在從資料表 [${tableName}] 中，以欄位 [${searchField}] 模糊搜尋關鍵字 [${keyword}]...`, 'info');

    // 【邏輯修正】不再查詢不存在的 'id' 欄位
    let query = state.supabase
        .from(tableName)
        .select('編號, 地址, 備註, 解約情形') 
        .ilike(searchField, `%${keyword}%`)
        .limit(500);

    const { data, error } = await query;

    if (error) {
        addLog(`查詢失敗: ${error.message}`, 'error', 'error');
        throw error;
    }

    return { data, error, tableName };
}

/**
 * 批次更新 Supabase 中的資料
 * @param {string} tableName - 要更新的資料表名稱
 * @param {Array<string>} ids - 要更新的紀錄【編號】陣列
 * @param {string} fieldToUpdate - 要更新的欄位名稱
 * @param {string} newValue - 新的欄位內容
 * @returns {Promise<{error: any}>} - 更新結果
 */
export async function batchUpdateData(tableName, ids, fieldToUpdate, newValue) {
    if (!state.supabase) throw new Error("Supabase 未連線");
    if (!ids || ids.length === 0) throw new Error("沒有選擇任何要更新的資料");

    const updateObject = {
        [fieldToUpdate]: newValue === '' ? null : newValue
    };
    
    addLog(`準備更新資料表 [${tableName}] 中 ${ids.length} 筆紀錄的 [${fieldToUpdate}] 欄位...`, 'info');

    // 【邏輯修正】從 .in('id', ids) 改為 .in('編號', ids)
    const { error } = await state.supabase
        .from(tableName)
        .update(updateObject)
        .in('編號', ids);

    if (error) {
        addLog(`批次更新失敗: ${error.message}`, 'error', 'error');
        throw error;
    }
    
    addLog(`成功更新 ${ids.length} 筆紀錄！`, 'success');
    return { error };
}
