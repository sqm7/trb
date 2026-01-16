import { supabase } from './supabase';
import { isEqual } from './uploader-utils';
import { parseFile, FileInfo } from './file-handler';

export interface UploadSummary {
    new: number;
    updated: number;
    identical: number;
    subAdded: number;
    errors: number;
    warnings: number;
    newRecords: any[];
    updatedRecords: any[];
    identicalRecords: any[];
}

export type LogCallback = (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
export type ProgressCallback = (current: number, total: number, phase: string) => void;


let projectNameMappings: Map<string, string> = new Map();
let processedMainIds: Set<string> = new Set();
let currentSummary: UploadSummary = {
    new: 0, updated: 0, identical: 0, subAdded: 0, errors: 0, warnings: 0,
    newRecords: [], updatedRecords: [], identicalRecords: []
};

export function resetUploaderState() {
    processedMainIds = new Set();
    currentSummary = {
        new: 0, updated: 0, identical: 0, subAdded: 0, errors: 0, warnings: 0,
        newRecords: [], updatedRecords: [], identicalRecords: []
    };
}

export function getUploadSummary() {
    return currentSummary;
}

/**
 * 載入所有建案名稱對應
 */
export async function getProjectNameMappings(onLog?: LogCallback) {
    try {
        const { data, error } = await supabase.from('project_name_mappings').select('old_name, new_name');

        if (error) {
            if (onLog) onLog(`載入建案名稱對應失敗: ${error.message}`, 'warning');
            return new Map();
        }

        const mappings = new Map<string, string>();
        data?.forEach((row: any) => {
            mappings.set(row.old_name, row.new_name);
        });

        if (onLog) onLog(`已載入 ${mappings.size} 筆建案名稱對應規則`, 'info');
        projectNameMappings = mappings;
        return mappings;
    } catch (e: any) {
        if (onLog) onLog(`載入建案名稱對應時發生錯誤: ${e.message}`, 'warning');
        return new Map();
    }
}


/**
 * 上傳主表檔案，並進行智慧更新檢查
 */
export async function uploadMainFileWithSmartUpdate(fileInfo: FileInfo, onLog: LogCallback) {
    try {
        const tableName = `${fileInfo.countyCode}_lvr_land_${fileInfo.tableType}`;
        // Load mappings if not loaded? Assume loaded via page init
        const processedData = await parseFile(fileInfo, projectNameMappings, (msg, type) => onLog(msg, type as any));

        if (!processedData || processedData.length === 0) {
            onLog(`${fileInfo.fullPath}: 檔案為空或無有效資料，已跳過`, 'warning');
            return;
        }

        const chunkSize = 500;
        for (let i = 0; i < processedData.length; i += chunkSize) {
            const chunk = processedData.slice(i, i + chunkSize);
            const idsToCheck = chunk.map(row => row['編號']);
            const { data: existingData, error: fetchError } = await supabase.from(tableName).select('*').in('編號', idsToCheck);

            if (fetchError) throw fetchError;

            const existingDataMap = new Map((existingData || []).map(item => [item['編號'], item]));
            const newData: any[] = [];
            const updatedData: any[] = [];
            const idsToDeleteForUpdate: string[] = [];
            let identicalCount = 0;

            for (const newRecord of chunk) {
                const existingRecord = existingDataMap.get(newRecord['編號']);
                if (!existingRecord) {
                    newData.push(newRecord);
                    currentSummary.newRecords.push(newRecord);
                } else if (!isEqual(newRecord, existingRecord, fileInfo.tableType)) {
                    idsToDeleteForUpdate.push(newRecord['編號']);
                    updatedData.push(newRecord);
                    currentSummary.updatedRecords.push({ oldData: existingRecord, newData: newRecord });
                } else {
                    identicalCount++;
                    currentSummary.identicalRecords.push(existingRecord);
                }
            }

            onLog(`${fileInfo.fullPath} (區塊 ${Math.floor(i / chunkSize) + 1}): 新增 ${newData.length}, 更新 ${updatedData.length}, 跳過 ${identicalCount}`, 'info');
            currentSummary.new += newData.length;
            currentSummary.updated += updatedData.length;
            currentSummary.identical += identicalCount;

            const idsToProcess = [...newData.map(r => r['編號']), ...updatedData.map(r => r['編號'])];
            idsToProcess.forEach(id => processedMainIds.add(id));

            if (idsToDeleteForUpdate.length > 0) {
                const { error: deleteError } = await supabase.from(tableName).delete().in('編號', idsToDeleteForUpdate);
                if (deleteError) throw deleteError;
            }

            const dataToUpload = [...newData, ...updatedData];
            if (dataToUpload.length > 0) {
                const { error: insertError } = await supabase.from(tableName).insert(dataToUpload);
                if (insertError) throw insertError;
            }
        }
    } catch (error: any) {
        onLog(`${fileInfo.fullPath} 上傳失敗: ${error.message}`, 'error');
        currentSummary.errors++;
    }
}

/**
 * 上傳附表檔案
 */
export async function uploadSubFile(fileInfo: FileInfo, onLog: LogCallback) {
    try {
        const tableName = `${fileInfo.countyCode}_lvr_land_${fileInfo.tableType}`;
        const allSubData = await parseFile(fileInfo, projectNameMappings, (msg, type) => onLog(msg, type as any));

        if (!allSubData || allSubData.length === 0) {
            onLog(`${fileInfo.fullPath}: 檔案為空或無有效資料，已跳過`, 'warning');
            return;
        }

        const dataToUpload = allSubData.filter(row => processedMainIds.has(row['編號']));

        if (dataToUpload.length > 0) {
            const { error } = await supabase.from(tableName).insert(dataToUpload);
            if (error) throw error;
            currentSummary.subAdded += dataToUpload.length;
            onLog(`${fileInfo.fullPath}: 成功新增 ${dataToUpload.length} 筆關聯的附表紀錄`, 'success');
        } else {
            onLog(`${fileInfo.fullPath}: 無對應的主表變更，已跳過`, 'info');
        }
    } catch (error: any) {
        onLog(`${fileInfo.fullPath} 上傳失敗: ${error.message}`, 'error');
        currentSummary.errors++;
    }
}
