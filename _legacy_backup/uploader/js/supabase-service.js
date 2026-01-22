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

        // 【新增】連線成功後，載入建案名稱對應表
        state.projectNameMappings = await getProjectNameMappings();
    } catch (error) {
        addLog(`連線失敗: ${error.message}`, 'error', 'error');
        updateConnectionStatus(false);
        state.supabase = null;
    }
}

// ▼▼▼ 【這就是修改處】 ▼▼▼
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
                    // 【新增】紀錄新增的資料
                    state.summary.newRecords.push(newRecord);
                } else if (!isEqual(newRecord, existingRecord, fileInfo.tableType)) {
                    idsToDeleteForUpdate.push(newRecord['編號']);
                    updatedData.push(newRecord);
                    // 【新增】紀錄更新的資料 (包含新舊對比)
                    state.summary.updatedRecords.push({ oldData: existingRecord, newData: newRecord });
                } else {
                    identicalCount++;
                    // 【新增】紀錄相同的資料
                    state.summary.identicalRecords.push(existingRecord);
                }
            }

            addLog(`${fileInfo.fullPath} (區塊 ${Math.floor(i / chunkSize) + 1}): 新增 ${newData.length}, 更新 ${updatedData.length}, 跳過 ${identicalCount}`, 'info');
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
// ▲▲▲ 【修改結束】 ▲▲▲

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


// ▼▼▼ 【最終修正】搜尋資料函式 ▼▼▼
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

    // 【邏輯修正】使用 select('*') 抓取所有實際存在的欄位，徹底避免 'id does not exist' 錯誤
    let query = state.supabase
        .from(tableName)
        .select('*')
        .ilike(searchField, `%${keyword}%`)
        .limit(2500);

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
 * @param {string} [oldValue] - 舊的欄位內容（用於建案名稱對應）
 * @param {string} [district] - 行政區（用於建案名稱對應）
 * @param {string} [city] - 縣市（用於建案名稱對應）
 * @returns {Promise<{error: any}>} - 更新結果
 */
export async function batchUpdateData(tableName, ids, fieldToUpdate, newValue, oldValue = null, district = null, city = null) {
    if (!state.supabase) throw new Error("Supabase 未連線");
    if (!ids || ids.length === 0) throw new Error("沒有選擇任何要更新的資料");

    const updateObject = {
        [fieldToUpdate]: newValue === '' ? null : newValue
    };

    addLog(`準備更新資料表 [${tableName}] 中 ${ids.length} 筆紀錄的 [${fieldToUpdate}] 欄位...`, 'info');

    const { error } = await state.supabase
        .from(tableName)
        .update(updateObject)
        .in('編號', ids);

    if (error) {
        addLog(`批次更新失敗: ${error.message}`, 'error', 'error');
        throw error;
    }

    addLog(`成功更新 ${ids.length} 筆紀錄！`, 'success');

    // 【Debug】顯示參數以便追蹤
    console.log('[DEBUG] batchUpdateData params:', { fieldToUpdate, oldValue, newValue, district, city });

    // 【新增】如果更新的是「建案名稱」欄位，且舊名稱包含「？」（表示亂碼），儲存對應關係
    const hasEncodingIssue = oldValue && oldValue.includes('?');
    if (fieldToUpdate === '建案名稱' && oldValue && newValue && oldValue !== newValue && hasEncodingIssue) {
        addLog(`偵測到建案名稱亂碼修正，準備儲存對應: "${oldValue}" → "${newValue}"`, 'info');
        await saveProjectNameMapping(oldValue, newValue, district, city);
    } else if (fieldToUpdate === '建案名稱' && oldValue && newValue && oldValue !== newValue && !hasEncodingIssue) {
        addLog(`建案名稱修改完成（舊名稱無亂碼，不儲存對應規則）`, 'info');
    }

    return { error };
}

/**
 * 儲存建案名稱對應 (舊名稱 → 新名稱)
 * @param {string} oldName - 原始名稱
 * @param {string} newName - 修正後的名稱
 * @param {string} [district] - 行政區（可選）
 * @param {string} [city] - 縣市（可選）
 */
export async function saveProjectNameMapping(oldName, newName, district = null, city = null) {
    if (!state.supabase) return;

    try {
        // 使用 upsert：如果 old_name 已存在則更新，否則新增
        const insertData = {
            old_name: oldName,
            new_name: newName,
            updated_at: new Date().toISOString()
        };

        // 只有當 district 有值時才加入
        if (district) {
            insertData.district = district;
        }

        // 【新增】只有當 city 有值時才加入
        if (city) {
            insertData.city = city;
        }

        const { error } = await state.supabase
            .from('project_name_mappings')
            .upsert(insertData, {
                onConflict: 'old_name'
            });

        if (error) {
            addLog(`儲存建案名稱對應失敗: ${error.message}`, 'warning', 'status');
        } else {
            const extraInfo = [district, city].filter(Boolean).join(', ');
            const infoStr = extraInfo ? ` (${extraInfo})` : '';
            addLog(`已儲存建案名稱對應: "${oldName}" → "${newName}"${infoStr}`, 'success');
        }
    } catch (e) {
        addLog(`儲存建案名稱對應時發生錯誤: ${e.message}`, 'warning', 'status');
    }
}

/**
 * 載入所有建案名稱對應
 * @returns {Promise<Map<string, string>>} - 對應表 Map(舊名稱 => 新名稱)
 */
export async function getProjectNameMappings() {
    if (!state.supabase) return new Map();

    try {
        const { data, error } = await state.supabase
            .from('project_name_mappings')
            .select('old_name, new_name');

        if (error) {
            console.warn('載入建案名稱對應失敗:', error.message);
            return new Map();
        }

        const mappings = new Map();
        if (data) {
            data.forEach(row => {
                mappings.set(row.old_name, row.new_name);
            });
        }

        addLog(`已載入 ${mappings.size} 筆建案名稱對應規則`, 'info');
        return mappings;
    } catch (e) {
        console.warn('載入建案名稱對應時發生錯誤:', e.message);
        return new Map();
    }
}
