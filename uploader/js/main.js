// uploader/js/main.js

import { DOM } from './dom.js';
import { state, resetSummary } from './state.js';
// ▼▼▼ 【修改處 1】 ▼▼▼
import { addLog, resetUI, updateProgress, updateTime, displayFinalSummary, clearLogs, renderUploadDetailsModal } from './ui.js';
// ▲▲▲ 【修改結束】 ▲▲▲
import { scanDirectory } from './file-handler.js';
import { testConnection, uploadMainFileWithSmartUpdate, uploadSubFile, searchData, batchUpdateData } from './supabase-service.js';
import { columnMappings, counties } from './config.js';

let currentUpdateContext = {
    tableName: null,
    results: [],
    criteriaString: '', // 用來儲存原始搜尋條件
    city: null // 【新增】用來儲存當前搜尋的縣市
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
        currentUpdateContext.city = countyText; // 【新增】儲存縣市資訊

        populateUpdateModal(data);
        updateCriteriaDisplay();
        populateUpdateFieldSelect(transactionType);

        DOM.batchUpdateModal.classList.remove('hidden');
    } catch (error) {
        addLog(`執行搜尋時發生錯誤: ${error.message}`, 'error', 'error');
    }
}

// --- ▼▼▼ 【核心修改函式】 ▼▼▼ ---
function populateUpdateModal(data) {
    DOM.modalFilterInput.value = '';
    const container = DOM.searchResultsContainer;

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-gray-500">無符合條件的資料</div>';
        return;
    }

    const summaryFields = ['編號', '行政區', '建案名稱', '總樓層', '地址', '建物型態', '主要用途', '備註'];

    const tableRowsHtml = data.map((item, index) => {
        const summaryCells = summaryFields.map(field => {
            const value = item[field] || '-';
            return `<td class="truncate-cell" title="${value}">${value}</td>`;
        }).join('');

        const allFields = Object.keys(item).filter(key => key !== 'id');
        const detailsGrid = allFields.map(key => {
            const value = item[key] !== null && item[key] !== '' ? item[key] : '-';
            return `
                <div>
                    <div class="key">${key}</div>
                    <div class="value">${value}</div>
                </div>
            `;
        }).join('');

        return `
            <tbody class="result-item border-b border-gray-600 last:border-b-0">
                <tr class="summary-row" data-details-target="#details-${index}">
                    <td><input type="checkbox" data-id="${item['編號']}" class="form-checkbox h-5 w-5 text-cyan-accent bg-gray-700 border-gray-600 focus:ring-cyan-accent rounded"></td>
                    ${summaryCells}
                    <td><button class="details-toggle-btn">明細</button></td>
                </tr>
                <tr class="details-row" id="details-${index}">
                    <td colspan="${summaryFields.length + 2}" class="details-cell">
                        <div class="details-grid">${detailsGrid}</div>
                    </td>
                </tr>
            </tbody>
        `;
    }).join('');

    const summaryHeaders = summaryFields.map(field => `<th>${field}</th>`).join('');
    const tableHeaderHtml = `
        <thead>
            <tr class="text-xs text-gray-400">
                <th style="width: 4%;">選取</th>
                <th style="width: 15%;">編號</th>
                <th style="width: 7%;">行政區</th>
                <th style="width: 12%;">建案名稱</th>
                <th style="width: 5%;">總樓層</th>
                <th style="width: 20%;">地址</th>
                <th style="width: 10%;">建物型態</th>
                <th style="width: 10%;">主要用途</th>
                <th style="width: 10%;">備註</th>
                <th style="width: 7%;">操作</th>
            </tr>
        </thead>
    `;

    container.innerHTML = `<table class="results-table">${tableHeaderHtml}${tableRowsHtml}</table>`;

    filterModalResults();
}

function handleDetailsToggle(event) {
    const target = event.target;
    if (target.classList.contains('details-toggle-btn')) {
        const summaryRow = target.closest('.summary-row');
        const detailsRowSelector = summaryRow.dataset.detailsTarget;
        const detailsRow = document.querySelector(detailsRowSelector);

        if (detailsRow) {
            const isVisible = detailsRow.style.display === 'table-row';
            detailsRow.style.display = isVisible ? 'none' : 'table-row';
            target.textContent = isVisible ? '明細' : '收合';
        }
    }
}
// --- ▲▲▲ 【核心修改結束】 ▲▲▲ ---

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
    const { tableName, results } = currentUpdateContext;

    if (!tableName || !fieldToUpdate) {
        addLog('無法執行更新：缺少資料表名稱或欄位資訊。', 'error', 'error');
        return;
    }

    // 【新增】如果更新的是建案名稱，取得第一筆的舊值和行政區作為對應來源
    let oldValue = null;
    let district = null;
    if (fieldToUpdate === '建案名稱' && results && results.length > 0) {
        const firstSelectedId = idsToUpdate[0];
        const firstSelectedRecord = results.find(r => r['編號'] === firstSelectedId);
        if (firstSelectedRecord) {
            oldValue = firstSelectedRecord['建案名稱'];
            district = firstSelectedRecord['行政區'] || null;
        }
    }

    try {
        await batchUpdateData(tableName, idsToUpdate, fieldToUpdate, newValue, oldValue, district, currentUpdateContext.city);
        DOM.batchUpdateModal.classList.add('hidden');
    } catch (error) {
        addLog(`批次更新過程中發生錯誤: ${error.message}`, 'error', 'error');
    }
}

function handleSelectAll() {
    const checkboxes = DOM.searchResultsContainer.querySelectorAll('.result-item:not([style*="display: none"]) input[type="checkbox"]');
    if (checkboxes.length === 0) return;
    const allSelected = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allSelected);
}

function filterModalResults() {
    const filterText = DOM.modalFilterInput.value.toLowerCase();
    updateCriteriaDisplay(filterText);

    const items = DOM.searchResultsContainer.querySelectorAll('.result-item');
    let visibleCount = 0;

    items.forEach(item => {
        const itemText = item.textContent.toLowerCase();
        if (itemText.includes(filterText)) {
            item.style.display = 'table-row-group'; // Use 'table-row-group' for tbody
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    DOM.searchResultCount.textContent = `找到 ${currentUpdateContext.results.length} 筆資料 (篩選後顯示 ${visibleCount} 筆)`;
}

function updateCriteriaDisplay(filterKeyword = '') {
    let displayText = currentUpdateContext.criteriaString;
    if (filterKeyword) {
        displayText += ` | 再篩選: '${filterKeyword}'`;
    }
    DOM.modalSearchCriteriaDisplay.textContent = displayText;
}

function populateCountySelect() {
    const select = DOM.updateCountySelect;
    Object.entries(counties).forEach(([code, name]) => {
        select.add(new Option(name, code.toLowerCase()));
    });
}

// ▼▼▼ 【修改處 2】 ▼▼▼
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
    DOM.modalFilterButton.addEventListener('click', filterModalResults);
    DOM.modalFilterInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            filterModalResults();
        }
    });

    DOM.searchResultsContainer.addEventListener('click', handleDetailsToggle);

    // 【新增】上傳詳情 Modal 的事件綁定
    DOM.showUploadDetailsButton.addEventListener('click', () => {
        renderUploadDetailsModal(); // 預設顯示 'new' 頁籤
        DOM.uploadDetailsModal.classList.remove('hidden');
    });
    DOM.uploadDetailsModalCloseBtn.addEventListener('click', () => {
        DOM.uploadDetailsModal.classList.add('hidden');
    });
    DOM.uploadDetailsTabs.addEventListener('click', (e) => {
        if (e.target.matches('.details-tab-button')) {
            renderUploadDetailsModal(e.target.dataset.tab);
        }
    });

    window.clearLogs = clearLogs;
    updateTime();
    setInterval(updateTime, 1000);
    resetUI();
}
// ▲▲▲ 【修改結束】 ▲▲▲

document.addEventListener('DOMContentLoaded', initialize);
