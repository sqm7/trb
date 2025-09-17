// uploader/js/main.js

import { DOM } from './dom.js';
import { state, resetSummary, resetModifierState } from './state.js';
import { addLog, resetUI, updateProgress, updateTime, displayFinalSummary, clearLogs, renderModifierResultsTable, populateModifierFields } from './ui.js';
import { scanDirectory } from './file-handler.js';
import { testConnection, uploadMainFileWithSmartUpdate, uploadSubFile, searchRecords, batchUpdateRecords } from './supabase-service.js';
import { counties } from './config.js';

// --- 批次上傳工具相關函式 ---

async function handleSelectFolders() {
    resetUI();
    if (!window.showDirectoryPicker) {
        addLog('您的瀏覽器不支援資料夾選擇功能。', 'error', 'error');
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
                fileHandle: item.handle, name: item.handle.name, fullPath: item.path,
                countyCode: match[1].toLowerCase(), tableType: match[2].toLowerCase(), 
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
        if (err.name !== 'AbortError') addLog(`選擇資料夾時發生錯誤: ${err.message}`, 'error', 'error');
    }
}

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
    let filesToUpload = selectedType === 'all' ? state.allFiles : state.allFiles.filter(f => f.tableType.startsWith(selectedType));

    if (filesToUpload.length === 0) {
        addLog(`找不到符合「${typeNameMap[selectedType]}」類型的檔案。`, 'warning', 'status');
        DOM.startUploadButton.disabled = false;
        DOM.selectFoldersButton.disabled = false;
        state.isUploading = false;
        return;
    }
    
    addLog(`開始上傳，類型: ${typeNameMap[selectedType]}，共 ${filesToUpload.length} 個檔案。`, 'info');
    
    const mainTables = filesToUpload.filter(f => f.isMain);
    const subTables = filesToUpload.filter(f => !f.isMain);
    
    await processPhase(mainTables, '階段 1: 主表', true);
    await processPhase(subTables, '階段 2: 附表', false);
    
    addLog('所有檔案處理完成！', 'success');
    displayFinalSummary();

    DOM.startUploadButton.disabled = false;
    DOM.selectFoldersButton.disabled = false;
    state.isUploading = false;
}

async function processPhase(files, phaseName, isMainTablePhase) {
    if (files.length === 0) {
        addLog(`${phaseName} 無檔案，跳過。`, 'info');
        return;
    }
    addLog(`--- ${phaseName} ---`, 'info');
    for (let i = 0; i < files.length; i++) {
        updateProgress(i, files.length, phaseName);
        DOM.currentFileName.textContent = files[i].fullPath;
        if (isMainTablePhase) await uploadMainFileWithSmartUpdate(files[i]);
        else await uploadSubFile(files[i]);
        updateProgress(i + 1, files.length, phaseName);
    }
    DOM.currentFileName.textContent = '';
}

// --- ▼▼▼【新增】批次修改工具相關函式 ▼▼▼ ---

/**
 * 處理查詢按鈕點擊事件
 */
async function handleModifierSearch() {
    const { countySelect, typeSelect, searchBySelect, keywordInput, searchBtn } = DOM.modifier;
    if (!state.supabase) {
        addLog('執行查詢前，請先成功連線到資料庫。', 'error', 'error');
        return;
    }
    const countyCode = countySelect.value;
    const type = typeSelect.value;
    const searchBy = searchBySelect.value;
    const keyword = keywordInput.value.trim();

    if (!countyCode || !keyword) {
        addLog('請選擇縣市並輸入搜尋關鍵字。', 'warning', 'status');
        return;
    }

    searchBtn.disabled = true;
    searchBtn.textContent = '查詢中...';
    addLog(`開始查詢: [縣市: ${countyCode}, 類型: ${type}, 方式: ${searchBy}, 關鍵字: ${keyword}]`, 'info');
    
    try {
        const results = await searchRecords(countyCode, type, searchBy, keyword);
        state.modifier.searchResults = results;
        addLog(`查詢完成，找到 ${results.length} 筆資料。`, 'success');
        renderModifierResultsTable();
        populateModifierFields();
    } catch (error) {
        addLog(`查詢失敗: ${error.message}`, 'error', 'error');
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = '查詢';
    }
}

/**
 * 處理結果表格中的 checkbox 點擊事件
 * @param {Event} e - 事件物件
 */
function handleModifierSelectionChange(e) {
    const { selectedIds } = state.modifier;
    const { selectAllCheckbox, updateBtn } = DOM.modifier;

    if (e.target.id === 'modifier-select-all') {
        const isChecked = e.target.checked;
        const allCheckboxes = document.querySelectorAll('.modifier-row-checkbox');
        allCheckboxes.forEach(cb => {
            cb.checked = isChecked;
            const id = parseInt(cb.dataset.id);
            const type = cb.dataset.type;
            if (isChecked) {
                selectedIds.add(`${type}-${id}`);
            } else {
                selectedIds.delete(`${type}-${id}`);
            }
        });
    } else if (e.target.classList.contains('modifier-row-checkbox')) {
        const id = parseInt(e.target.dataset.id);
        const type = e.target.dataset.type;
        const key = `${type}-${id}`;
        if (e.target.checked) {
            selectedIds.add(key);
        } else {
            selectedIds.delete(key);
        }
        // 檢查是否所有項目都被選中，以同步 "全選" checkbox 的狀態
        const allRowCount = document.querySelectorAll('.modifier-row-checkbox').length;
        selectAllCheckbox.checked = selectedIds.size === allRowCount;
    }
    
    // 只有在有選取項目時才啟用更新按鈕
    updateBtn.disabled = selectedIds.size === 0;
}

/**
 * 處理執行批次更新按鈕點擊事件
 */
async function handleModifierUpdate() {
    const { countySelect, fieldSelect, newValueInput, updateBtn } = DOM.modifier;
    const { selectedIds, searchResults } = state.modifier;

    const countyCode = countySelect.value;
    const field = fieldSelect.value;
    const newValue = newValueInput.value;

    if (selectedIds.size === 0) {
        addLog('沒有選擇任何要更新的資料。', 'warning', 'status');
        return;
    }
    if (!field) {
        addLog('請選擇要修改的欄位。', 'warning', 'status');
        return;
    }

    // 彈出確認視窗
    const confirmation = confirm(`確定要將 ${selectedIds.size} 筆資料的「${field}」欄位更新為「${newValue}」嗎？\n\n此操作無法復原！`);
    if (!confirmation) {
        addLog('使用者取消了操作。', 'info');
        return;
    }

    updateBtn.disabled = true;
    updateBtn.textContent = '更新中...';
    addLog(`開始批次更新...`, 'info');

    try {
        // 將 selectedIds 轉換為 Map<string, Array<number>> 格式
        const updatesByType = new Map();
        selectedIds.forEach(key => {
            const [type, idStr] = key.split('-');
            const id = parseInt(idStr);
            if (!updatesByType.has(type)) {
                updatesByType.set(type, []);
            }
            updatesByType.get(type).push(id);
        });

        await batchUpdateRecords(countyCode, updatesByType, field, newValue);
        addLog(`成功更新了 ${selectedIds.size} 筆資料！`, 'success');
        
        // 更新成功後，重新執行一次查詢以顯示最新結果
        await handleModifierSearch();

    } catch (error) {
        addLog(`批次更新失敗: ${error.message}`, 'error', 'error');
    } finally {
        updateBtn.disabled = false;
        updateBtn.textContent = '執行批次更新';
    }
}

/**
 * 初始化批次修改工具
 */
function initializeModifier() {
    // 填充縣市下拉選單
    const countyOptions = Object.entries(counties)
        .map(([code, name]) => `<option value="${code.toLowerCase()}">${name}</option>`)
        .join('');
    DOM.modifier.countySelect.innerHTML = `<option value="">請選擇縣市</option>` + countyOptions;

    // 綁定事件
    DOM.modifier.searchBtn.addEventListener('click', handleModifierSearch);
    DOM.modifier.tableWrapper.addEventListener('change', handleModifierSelectionChange);
    DOM.modifier.updateBtn.addEventListener('click', handleModifierUpdate);
}


// --- 主初始化函式 ---

function initialize() {
    // 綁定上傳工具的事件
    DOM.selectFoldersButton.addEventListener('click', handleSelectFolders);
    DOM.startUploadButton.addEventListener('click', startUpload);
    DOM.testConnectionButton.addEventListener('click', testConnection);

    // 初始化批次修改工具
    initializeModifier();

    // 將清除日誌的功能掛載到 window 物件上
    window.clearLogs = clearLogs;

    // 啟動時間更新
    updateTime();
    setInterval(updateTime, 1000);

    // 初始化 UI
    resetUI();
}

// DOM 載入完成後執行
document.addEventListener('DOMContentLoaded', initialize);
