// uploader/js/main.js

import { DOM } from './dom.js';
import { state, resetSummary } from './state.js';
import { addLog, resetUI, updateProgress, updateTime, displayFinalSummary, clearLogs } from './ui.js';
import { scanDirectory } from './file-handler.js';
import { testConnection, uploadMainFileWithSmartUpdate, uploadSubFile, searchData, batchUpdateData } from './supabase-service.js';
import { columnMappings } from './config.js';

// 用於存儲當前查詢結果的相關資訊
let currentUpdateContext = {
    tableName: null,
    results: []
};

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
        }).filter(Boolean);

        if (state.allFiles.length === 0) {
            addLog('在選擇的資料夾中沒有找到符合命名規則的檔案。', 'warning', 'status');
            return;
        }
        
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
    resetSummary();
    
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
    
    const mainTables = filesToUpload.filter(f => f.isMain);
    const subTables = filesToUpload.filter(f => !f.isMain);
    
    await processPhase(mainTables, '階段 1: 主表 (智慧更新)', true);
    await processPhase(subTables, '階段 2: 附表 (智慧連動)', false);
    
    addLog('所有檔案處理完成！', 'success');
    
    displayFinalSummary();

    DOM.startUploadButton.disabled = false;
    DOM.selectFoldersButton.disabled = false;
    state.isUploading = false;
}

/**
 * 處理單一上傳階段（主表或附表）
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

// ▼▼▼ 【新增】處理批次修改的相關函式 ▼▼▼

/**
 * 處理查詢按鈕點擊事件
 */
async function handleSearchForUpdate() {
    if (!state.supabase) {
        addLog('請先成功測試 Supabase 連線', 'error', 'error');
        return;
    }
    if (state.allFiles.length === 0) {
        addLog('請先選擇資料夾，以便程式判斷縣市代碼。', 'error', 'error');
        return;
    }

    const transactionType = DOM.updateTransactionType.value;
    const searchField = DOM.updateSearchField.value;
    const keyword = DOM.updateSearchKeyword.value.trim();

    if (!keyword) {
        addLog('請輸入搜尋關鍵字', 'warning', 'error');
        return;
    }

    try {
        const { data, tableName } = await searchData(transactionType, searchField, keyword);
        currentUpdateContext.tableName = tableName;
        currentUpdateContext.results = data;
        
        populateUpdateModal(data);
        populateUpdateFieldSelect(transactionType);
        
        DOM.batchUpdateModal.classList.remove('hidden');
    } catch (error) {
        addLog(`執行搜尋時發生錯誤: ${error.message}`, 'error', 'error');
    }
}

/**
 * 將查詢結果填入互動視窗
 * @param {Array<object>} data - 查詢到的資料陣列
 */
function populateUpdateModal(data) {
    DOM.searchResultCount.textContent = `找到 ${data.length} 筆資料`;
    const container = DOM.searchResultsContainer;
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-gray-500">無符合條件的資料</div>';
        return;
    }

    data.forEach(item => {
        const el = document.createElement('label');
        el.className = 'flex items-center p-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-800/50 cursor-pointer';
        el.innerHTML = `
            <input type="checkbox" data-id="${item.id}" class="form-checkbox h-5 w-5 text-cyan-accent bg-gray-700 border-gray-600 focus:ring-cyan-accent rounded mr-4">
            <div class="flex-1 text-sm">
                <p class="font-mono text-white">編號: ${item['編號']}</p>
                <p class="text-gray-400">地址: ${item['地址'] || 'N/A'}</p>
            </div>
        `;
        container.appendChild(el);
    });
}

/**
 * 根據交易類型，動態產生可修改的欄位下拉選單
 * @param {string} transactionType - 交易類型 ('a', 'b', 'c')
 */
function populateUpdateFieldSelect(transactionType) {
    const select = DOM.updateFieldSelect;
    select.innerHTML = '';

    const mapping = columnMappings[transactionType];
    const excludedFields = ['id', '編號', '房屋單價(萬)', '房屋面積(坪)']; // 排除不可直接修改的欄位
    
    if (mapping) {
        // 使用 Set 去除重複的資料庫欄位
        const dbColumns = [...new Set(Object.values(mapping))];
        dbColumns.filter(col => !excludedFields.includes(col)).sort().forEach(field => {
            const option = new Option(field, field);
            select.appendChild(option);
        });
    }
}

/**
 * 執行批次更新
 */
async function handleBatchUpdate() {
    const selectedCheckboxes = DOM.searchResultsContainer.querySelectorAll('input[type="checkbox"]:checked');
    const idsToUpdate = Array.from(selectedCheckboxes).map(cb => parseInt(cb.dataset.id));
    
    if (idsToUpdate.length === 0) {
        addLog('您沒有選擇任何要更新的資料。', 'warning', 'error');
        return;
    }

    const fieldToUpdate = DOM.updateFieldSelect.value;
    const newValue = DOM.updateValueInput.value;
    const { tableName } = currentUpdateContext;

    if (!tableName || !fieldToUpdate) {
        addLog('無法執行更新：缺少資料表名稱或欄位資訊。', 'error', 'error');
        return;
    }
    
    try {
        await batchUpdateData(tableName, idsToUpdate, fieldToUpdate, newValue);
        // 成功後關閉視窗並清空
        DOM.batchUpdateModal.classList.add('hidden');
        DOM.searchResultsContainer.innerHTML = '';
        DOM.updateValueInput.value = '';

    } catch(error) {
        addLog(`批次更新過程中發生錯誤: ${error.message}`, 'error', 'error');
    }
}

/**
 * 處理全選/全不選
 */
function handleSelectAll() {
    const checkboxes = DOM.searchResultsContainer.querySelectorAll('input[type="checkbox"]');
    if (checkboxes.length === 0) return;
    
    // 檢查目前是否已全選
    const allSelected = Array.from(checkboxes).every(cb => cb.checked);

    // 根據是否已全選來決定接下來的操作
    checkboxes.forEach(cb => cb.checked = !allSelected);
}


/**
 * 初始化應用程式
 */
function initialize() {
    // 綁定所有事件監聽器
    DOM.selectFoldersButton.addEventListener('click', handleSelectFolders);
    DOM.startUploadButton.addEventListener('click', startUpload);
    DOM.testConnectionButton.addEventListener('click', testConnection);
    
    // 【新增】批次修改功能的事件監聽
    DOM.searchForUpdateButton.addEventListener('click', handleSearchForUpdate);
    DOM.batchUpdateModalCloseBtn.addEventListener('click', () => DOM.batchUpdateModal.classList.add('hidden'));
    DOM.executeBatchUpdateButton.addEventListener('click', handleBatchUpdate);
    DOM.selectAllCheckbox.addEventListener('click', handleSelectAll);

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
