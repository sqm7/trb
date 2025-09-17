// uploader/js/main.js

import { DOM } from './dom.js';
import { state, resetSummary } from './state.js';
import { addLog, resetUI, updateProgress, updateTime, displayFinalSummary, clearLogs } from './ui.js';
import { scanDirectory } from './file-handler.js';
import { testConnection, uploadMainFileWithSmartUpdate, uploadSubFile } from './supabase-service.js';

/**
 * 處理使用者選擇資料夾的操作
 */
async function handleSelectFolders() {
    resetUI();
    if (!window.showDirectoryPicker) {
        addLog('您的瀏覽器不支援資料夾選擇功能，請使用最新版本的 Chrome 或 Edge 瀏覽器。', 'error', 'error');
        return;
    }
    try {
        addLog('正在掃描資料夾...', 'info');
        const dirHandle = await window.showDirectoryPicker();
        const fileInfoList = await scanDirectory(dirHandle);
        
        // 根據檔名規則過濾和解析檔案資訊
        const fileRegex = /^([a-z])_lvr_land_([a-c](?:_build|_land|_park)?)\.csv$/i;
        state.allFiles = fileInfoList.map(item => {
            const match = item.handle.name.match(fileRegex);
            return match ? { 
                fileHandle: item.handle, 
                name: item.handle.name,
                fullPath: item.path,
                countyCode: match[1].toLowerCase(), 
                tableType: match[2].toLowerCase(), 
                isMain: !match[2].includes('_') 
            } : null;
        }).filter(Boolean); // 移除為 null 的項目

        if (state.allFiles.length === 0) {
            addLog('在選擇的資料夾中沒有找到符合命名規則的檔案。', 'warning', 'status');
            return;
        }
        
        // 在 UI 上顯示找到的檔案列表
        DOM.fileList.innerHTML = '';
        state.allFiles.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'flex items-center justify-between p-2 bg-gray-700 rounded text-sm';
            fileItem.innerHTML = `<span class="font-mono">${file.fullPath}</span><span class="px-2 py-1 bg-cyan-accent/20 text-cyan-accent rounded text-xs">${file.isMain ? '主表' : '附表'}</span>`;
            DOM.fileList.appendChild(fileItem);
        });
        DOM.fileListContainer.classList.remove('hidden');
        addLog(`掃描完成！找到 ${state.allFiles.length} 個有效檔案。`, 'success');
        
    } catch (err) {
        // 使用者取消選擇時，會拋出 AbortError，這種情況不需要顯示錯誤訊息
        if (err.name !== 'AbortError') {
            addLog(`選擇資料夾時發生錯誤: ${err.message}`, 'error', 'error');
        }
    }
}

/**
 * 開始執行上傳流程
 */
async function startUpload() {
    if (!state.supabase) {
        addLog('請先成功測試 Supabase 連線', 'error', 'error');
        return;
    }
    if (state.allFiles.length === 0) {
        addLog('請先選擇包含 CSV 檔案的資料夾', 'error', 'error');
        return;
    }

    state.isUploading = true;
    DOM.startUploadButton.disabled = true;
    DOM.selectFoldersButton.disabled = true;
    resetSummary(); // 重置統計數據
    
    // 根據使用者選擇的上傳類型篩選檔案
    const selectedType = document.querySelector('input[name="uploadType"]:checked').value;
    const typeNameMap = { 'all': '全選', 'a': '中古', 'b': '預售', 'c': '租賃' };
    let filesToUpload = state.allFiles;
    if (selectedType !== 'all') {
        filesToUpload = state.allFiles.filter(file => file.tableType.startsWith(selectedType));
    }

    if (filesToUpload.length === 0) {
        addLog(`找不到符合「${typeNameMap[selectedType]}」類型的檔案，已中止上傳。`, 'warning', 'status');
        DOM.startUploadButton.disabled = false;
        DOM.selectFoldersButton.disabled = false;
        state.isUploading = false;
        return;
    }
    
    addLog(`已選擇上傳類型: ${typeNameMap[selectedType]}。共 ${filesToUpload.length} 個檔案待處理。`, 'info');
    
    // 將檔案分為主表和附表
    const mainTables = filesToUpload.filter(f => f.isMain);
    const subTables = filesToUpload.filter(f => !f.isMain);
    
    // 依次處理主表和附表
    await processPhase(mainTables, '階段 1: 主表 (智慧更新)', true);
    await processPhase(subTables, '階段 2: 附表 (智慧連動)', false);
    
    addLog('所有檔案處理完成！', 'success');
    
    displayFinalSummary(); // 顯示最終報告

    DOM.startUploadButton.disabled = false;
    DOM.selectFoldersButton.disabled = false;
    state.isUploading = false;
}

/**
 * 處理單一上傳階段（主表或附表）
 * @param {Array<object>} files - 該階段要處理的檔案列表
 * @param {string} phaseName - 階段名稱
 * @param {boolean} isMainTablePhase - 是否為主表階段
 */
async function processPhase(files, phaseName, isMainTablePhase) {
    if (files.length === 0) {
        addLog(`在 ${phaseName} 中沒有需要上傳的檔案，跳過此階段。`, 'info');
        return;
    }
    addLog(`--- ${phaseName} ---`, 'info');
    for (let i = 0; i < files.length; i++) {
        const fileInfo = files[i];
        updateProgress(i, files.length, phaseName);
        DOM.currentFileName.textContent = fileInfo.fullPath;

        if (isMainTablePhase) {
            await uploadMainFileWithSmartUpdate(fileInfo);
        } else {
            await uploadSubFile(fileInfo);
        }

        updateProgress(i + 1, files.length, phaseName);
    }
    DOM.currentFileName.textContent = '';
}


/**
 * 初始化應用程式
 */
function initialize() {
    // 綁定所有事件監聽器
    DOM.selectFoldersButton.addEventListener('click', handleSelectFolders);
    DOM.startUploadButton.addEventListener('click', startUpload);
    DOM.testConnectionButton.addEventListener('click', testConnection);

    // 將清除日誌的功能掛載到 window 物件上，以便 HTML 中的 onclick 可以呼叫到
    window.clearLogs = clearLogs;

    // 啟動每秒更新一次時間的計時器
    updateTime();
    setInterval(updateTime, 1000);

    // 初始化 UI 狀態
    resetUI();
}

// 當 DOM 載入完成後，執行初始化函式
document.addEventListener('DOMContentLoaded', initialize);