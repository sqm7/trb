// uploader/js/main.js

import { DOM } from './dom.js';
import { state, resetSummary } from './state.js';
import { addLog, resetUI, updateProgress, updateTime, displayFinalSummary, clearLogs } from './ui.js';
import { scanDirectory } from './file-handler.js';
import { testConnection, uploadMainFileWithSmartUpdate, uploadSubFile, searchData, batchUpdateData } from './supabase-service.js';
import { columnMappings, counties } from './config.js';

let currentUpdateContext = {
    tableName: null,
    results: [],
    criteriaString: '' // 【新增】用來儲存原始搜尋條件
};

async function handleSelectFolders() {
    resetUI();
    if (!window.showDirectoryPicker) {
        addLog('您的瀏覽器不支援資料夾選擇功能...', 'error', 'error');
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
                countyCode: match[1].toLowerCase(), tableType: match[2].toLowerCase(), isMain: !match[2].includes('_') 
            } : null;
        }).filter(Boolean);

        if (state.allFiles.length === 0) {
            addLog('在選擇的資料夾中沒有找到符合命名規則的檔案。', 'warning', 'status');
            return;
        }
        DOM.fileList.innerHTML = state.allFiles.map(file => `
            <div class="flex items-center justify-between p-2 bg-gray-700 rounded text-sm">
                <span class="font-mono">${file.fullPath}</span>
                <span class="px-2 py-1 bg-cyan-accent/20 text-cyan-accent rounded text-xs">${file.isMain ? '主表' : '附表'}</span>
            </div>
        `).join('');
        DOM.fileListContainer.classList.remove('hidden');
        addLog(`掃描完成！找到 ${state.allFiles.length} 個有效檔案。`, 'success');
    } catch (err) {
        if (err.name !== 'AbortError') {
            addLog(`選擇資料夾時發生錯誤: ${err.message}`, 'error', 'error');
        }
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
    let filesToUpload = state.allFiles;
    if (selectedType !== 'all') {
        filesToUpload = state.allFiles.filter(file => file.tableType.startsWith(selectedType));
    }

    if (filesToUpload.length === 0) {
        addLog(`找不到符合「${typeNameMap[selectedType]}」類型的檔案...`, 'warning', 'status');
        state.isUploading = false;
        // Re-enable buttons
        DOM.startUploadButton.disabled = false;
        DOM.selectFoldersButton.disabled = false;
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

async function handleSearchForUpdate() {
    if (!state.supabase) {
        addLog('請先成功測試 Supabase 連線', 'error', 'error');
        return;
    }
    const countyCode = DOM.updateCountySelect.value;
    const countyText = DOM.updateCountySelect.options[DOM.updateCountySelect.selectedIndex].text;
    const transactionType = DOM.updateTransactionType.value;
    const searchField = DOM.updateSearchField.value;
    const keyword = DOM.updateSearchKeyword.value.trim();

    if (!countyCode) {
        addLog('請選擇要查詢的縣市', 'warning', 'error');
        return;
    }
    if (!keyword) {
        addLog('請輸入搜尋關鍵字', 'warning', 'error');
        return;
    }
    try {
        const { data, tableName } = await searchData(countyCode, transactionType, searchField, keyword);
        currentUpdateContext.tableName = tableName;
        currentUpdateContext.results = data;
        currentUpdateContext.criteriaString = `搜尋條件：${countyText} > ${searchField} (包含 '${keyword}')`;
        
        populateUpdateModal(data);
        updateCriteriaDisplay(); // 【修正】呼叫新的函式來顯示條件
        populateUpdateFieldSelect(transactionType);
        
        DOM.batchUpdateModal.classList.remove('hidden');
    } catch (error) {
        addLog(`執行搜尋時發生錯誤: ${error.message}`, 'error', 'error');
    }
}

function populateUpdateModal(data) {
    DOM.modalFilterInput.value = '';
    const container = DOM.searchResultsContainer;
    container.innerHTML = '';
    
    if (data.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-gray-500">無符合條件的資料</div>';
    } else {
        container.innerHTML = data.map(item => {
            const detailsHtml = Object.entries(item).map(([key, value]) => {
                if (value !== null && value !== '' && key !== 'id') {
                    return `<div class="truncate"><span class="font-semibold text-gray-400">${key}:</span> <span class="text-white">${value}</span></div>`;
                }
                return '';
            }).join('');

            return `
                <label class="flex items-start p-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-800/50 cursor-pointer result-item">
                    <input type="checkbox" data-id="${item['編號']}" class="form-checkbox h-5 w-5 text-cyan-accent bg-gray-700 border-gray-600 focus:ring-cyan-accent rounded mr-4 mt-1 flex-shrink-0">
                    <div class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">${detailsHtml}</div>
                </label>
            `;
        }).join('');
    }
    filterModalResults(); // 【修正】載入後執行一次篩選來更新計數
}

function populateUpdateFieldSelect(transactionType) {
    const select = DOM.updateFieldSelect;
    select.innerHTML = '';
    const mapping = columnMappings[transactionType];
    const excludedFields = ['id', '編號', '房屋單價(萬)', '房屋面積(坪)', '產權面積_房車', '車位總面積', '土地持分面積'];
    
    if (mapping) {
        const dbColumns = [...new Set(Object.values(mapping))];
        dbColumns.filter(col => !excludedFields.includes(col)).sort().forEach(field => {
            select.add(new Option(field, field));
        });
        const defaultValue = '建案名稱';
        if (Array.from(select.options).some(opt => opt.value === defaultValue)) {
            select.value = defaultValue;
        }
    }
}

async function handleBatchUpdate() {
    const selectedCheckboxes = DOM.searchResultsContainer.querySelectorAll('.result-item:not([style*="display: none"]) input[type="checkbox"]:checked');
    const idsToUpdate = Array.from(selectedCheckboxes).map(cb => cb.dataset.id);
    
    if (idsToUpdate.length === 0) {
        addLog('您沒有選擇任何可見且已勾選的資料進行更新。', 'warning', 'error');
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
        DOM.batchUpdateModal.classList.add('hidden');
    } catch(error) {
        addLog(`批次更新過程中發生錯誤: ${error.message}`, 'error', 'error');
    }
}

function handleSelectAll() {
    const checkboxes = DOM.searchResultsContainer.querySelectorAll('.result-item:not([style*="display: none"]) input[type="checkbox"]');
    if (checkboxes.length === 0) return;
    const allSelected = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allSelected);
}

// 【已修正】二次篩選函式
function filterModalResults() {
    const filterText = DOM.modalFilterInput.value.toLowerCase();
    updateCriteriaDisplay(filterText); // 【修正】更新條件顯示

    const items = DOM.searchResultsContainer.querySelectorAll('.result-item');
    let visibleCount = 0;

    items.forEach(item => {
        const itemText = item.textContent.toLowerCase();
        if (itemText.includes(filterText)) {
            item.style.display = 'flex';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    DOM.searchResultCount.textContent = `找到 ${currentUpdateContext.results.length} 筆資料 (篩選後顯示 ${visibleCount} 筆)`;
}

// 【新增】更新搜尋條件顯示的函式
function updateCriteriaDisplay(filterKeyword = '') {
    let displayText = currentUpdateContext.criteriaString;
    if (filterKeyword) {
        displayText += ` | 篩選: '${filterKeyword}'`;
    }
    DOM.modalSearchCriteriaDisplay.textContent = displayText;
}

function populateCountySelect() {
    const select = DOM.updateCountySelect;
    Object.entries(counties).forEach(([code, name]) => {
        select.add(new Option(name, code.toLowerCase()));
    });
}

function initialize() {
    populateCountySelect();
    
    DOM.testConnectionButton.addEventListener('click', testConnection);
    // 上傳功能
    DOM.selectFoldersButton.addEventListener('click', handleSelectFolders);
    DOM.startUploadButton.addEventListener('click', startUpload);
    // 修改功能
    DOM.searchForUpdateButton.addEventListener('click', handleSearchForUpdate);
    DOM.batchUpdateModalCloseBtn.addEventListener('click', () => DOM.batchUpdateModal.classList.add('hidden'));
    DOM.executeBatchUpdateButton.addEventListener('click', handleBatchUpdate);
    DOM.selectAllCheckbox.addEventListener('click', handleSelectAll);
    // 【修正】將篩選事件綁定到按鈕的 click
    DOM.modalFilterButton.addEventListener('click', filterModalResults);

    window.clearLogs = clearLogs;
    updateTime();
    setInterval(updateTime, 1000);
    resetUI();
}

document.addEventListener('DOMContentLoaded', initialize);
