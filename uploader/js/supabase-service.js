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
        // 建立一個暫時的客戶端實例來測試
        const testSupabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        // 嘗試讀取一個肯定存在的表格 (即使是空的)，以驗證金鑰是否有效
        // head: true 只獲取標頭資訊，不下載資料，速度更快
        const { error } = await testSupabase.from('county_codes').select('code', { count: 'exact', head: true });
        
        // 如果回傳的錯誤不是 'relation "county_codes" does not exist'，則代表金鑰或 URL 錯誤
        if (error && error.code !== '42P01') throw error;

        addLog('連線成功！', 'success');
        updateConnectionStatus(true);
        // 連線成功後，將實例存儲到 state 中
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

        const chunkSize = 500; // 每次處理 500 筆
        for (let i = 0; i < processedData.length; i += chunkSize) {
            const chunk = processedData.slice(i, i + chunkSize);
            const idsToCheck = chunk.map(row => row['編號']);

            // 1. 從資料庫撈出現有的資料
            const { data: existingData, error: fetchError } = await state.supabase.from(tableName).select('*').in('編號', idsToCheck);
            if (fetchError) throw fetchError;

            const existingDataMap = new Map(existingData.map(item => [item['編號'], item]));
            
            const newData = [];
            const updatedData = [];
            const idsToDeleteForUpdate = [];
            let identicalCount = 0;

            // 2. 比對新舊資料
            for (const newRecord of chunk) {
                const existingRecord = existingDataMap.get(newRecord['編號']);
                if (!existingRecord) {
                    newData.push(newRecord);
                } else if (!isEqual(newRecord, existingRecord, fileInfo.tableType)) {
                    // 如果資料不同，先記錄要刪除的舊ID，再將新資料加入待上傳列表
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
            
            // 記錄所有需要處理的 ID，供附表上傳時參考
            const idsToProcess = [...newData.map(r => r['編號']), ...updatedData.map(r => r['編號'])];
            idsToProcess.forEach(id => state.processedMainIds.add(id));

            // 3. 執行資料庫操作 (先刪後增，確保唯一性)
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
 * 上傳附表檔案，只上傳與已變更主表相關的資料
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
        
        // 只篩選出 '編號' 存在於 processedMainIds 中的附表資料
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