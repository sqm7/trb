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
            DOM.openBatchEditButton.disabled = true; // No files, disable edit button
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
        DOM.openBatchEditButton.disabled = false; // Enable edit button
        
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
    DOM.openBatchEditButton.disabled = true;
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
        DOM.openBatchEditButton.disabled = false;
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
    DOM.openBatchEditButton.disabled = false;
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

// --- NEW: Batch Edit Modal Logic ---

/**
 * Opens the batch edit modal and loads data (currently mocked).
 */
function openBatchEditModal() {
    // In a real scenario, you would fetch data based on some criteria.
    // Here we just mock it for demonstration.
    const mockData = generateMockData(500);
    renderBatchResults(mockData);
    DOM.batchEditModal.classList.remove('hidden');
}

/**
 * Renders the list of items in the batch edit modal.
 * @param {Array<object>} data - The data to render.
 */
function renderBatchResults(data) {
    DOM.batchResultsList.innerHTML = '';
    DOM.batchResultsCount.textContent = data.length;

    const summaryFields = ['編號', '行政區', '建案名稱', '總樓層', '地址', '建物型態', '主要用途', '備註'];
    
    data.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'batch-item bg-dark-sidebar/50 p-4 rounded-lg border border-gray-700/80';
        
        const allFields = Object.keys(item);
        const detailFields = allFields.filter(f => !summaryFields.includes(f));

        const summaryHTML = summaryFields.map(field => `
            <div>
                <strong class="text-gray-400 block">${field}:</strong>
                <span>${item[field] || '<span class="italic text-gray-500">(無)</span>'}</span>
            </div>
        `).join('');

        const detailsHTML = detailFields.map(field => `
            <div>
                <strong class="text-gray-400 block">${field}:</strong>
                <span>${item[field] || '<span class="italic text-gray-500">(無)</span>'}</span>
            </div>
        `).join('');

        itemEl.innerHTML = `
            <div class="summary-view flex items-start gap-4">
                <input type="checkbox" class="form-checkbox h-4 w-4 text-cyan-accent bg-gray-700 border-gray-600 focus:ring-cyan-accent mt-1 flex-shrink-0">
                <div class="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm">
                    ${summaryHTML}
                </div>
                <button class="details-toggle-btn flex-shrink-0 text-cyan-400 hover:text-cyan-300 text-sm font-medium p-1">明細</button>
            </div>
            <div class="details-view pt-4 mt-4 border-t border-gray-700">
                 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                    ${detailsHTML}
                </div>
            </div>
        `;
        DOM.batchResultsList.appendChild(itemEl);
    });
}

/**
 * Handles clicks inside the batch results list using event delegation.
 * @param {Event} e - The click event.
 */
function handleBatchListClick(e) {
    const toggleBtn = e.target.closest('.details-toggle-btn');
    if (toggleBtn) {
        const detailsView = toggleBtn.closest('.batch-item').querySelector('.details-view');
        const isExpanded = detailsView.classList.toggle('expanded');
        toggleBtn.textContent = isExpanded ? '收合' : '明細';
    }
}

/**
 * Toggles all detail views in the batch list.
 */
function handleToggleAllDetails() {
    const btn = DOM.batchToggleAllBtn;
    const isExpanding = btn.textContent === '全部展開';
    btn.textContent = isExpanding ? '全部收合' : '全部展開';
    
    DOM.batchResultsList.querySelectorAll('.batch-item').forEach(item => {
        const detailsView = item.querySelector('.details-view');
        const toggleBtn = item.querySelector('.details-toggle-btn');
        if (isExpanding) {
            detailsView.classList.add('expanded');
            toggleBtn.textContent = '收合';
        } else {
            detailsView.classList.remove('expanded');
            toggleBtn.textContent = '明細';
        }
    });
}

/**
 * Selects or deselects all checkboxes.
 */
function handleSelectAll() {
    const isChecked = DOM.batchSelectAll.checked;
    DOM.batchResultsList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = isChecked;
    });
}

/**
 * Mock data for demonstration purposes.
 */
function generateMockData(count) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            '編號': `RPUNMLTKJJGFCB${i.toString().padStart(4, '0')}`,
            '行政區': '西屯區',
            '建案名稱': '國雄無?',
            '總樓層': 9 + (i % 5),
            '地址': '臺中市西屯區臺灣大道二段與東興路',
            '建物型態': '住宅大樓(11層含以上有電梯)',
            '主要用途': '住家用',
            '備註': i % 10 === 0 ? '特殊交易' : '',
            '交易標的': '房地(土地+建物)+車位',
            '交易年月日': '2024-11-12',
            '交易筆棟數': '土地1建物1車位1',
            '移轉層次': (i % 9) + 1,
            '屋齡': 2,
            '房/廳/衛': '2/2/2',
            '產權面積(坪)': 128.22,
            '戶別': `B棟B06-${((i%9)+1).toString().padStart(2,'0')}F號`,
            '車位類別': '坡道平面',
            '車位總價(萬)': 2250000,
            '交易總價(萬)': 19680000 + (i*1000)
        });
    }
    return data;
}

// --- End of Batch Edit Modal Logic ---

/**
 * 初始化應用程式
 */
function initialize() {
    // 綁定所有事件監聽器
    DOM.selectFoldersButton.addEventListener('click', handleSelectFolders);
    DOM.startUploadButton.addEventListener('click', startUpload);
    DOM.testConnectionButton.addEventListener('click', testConnection);
    DOM.openBatchEditButton.addEventListener('click', openBatchEditModal);

    // New Event Listeners for Batch Edit Modal
    DOM.batchEditModalCloseBtn.addEventListener('click', () => DOM.batchEditModal.classList.add('hidden'));
    DOM.batchResultsList.addEventListener('click', handleBatchListClick);
    DOM.batchToggleAllBtn.addEventListener('click', handleToggleAllDetails);
    DOM.batchSelectAll.addEventListener('change', handleSelectAll);
    // Placeholder for execute update button
    DOM.batchExecuteUpdateBtn.addEventListener('click', () => {
        alert('執行更新功能尚未實作。');
    });


    // 將清除日誌的功能掛載到 window 物件上，以便 HTML 中的 onclick 可以呼叫到
    window.clearLogs = clearLogs;

    // 啟動每秒更新一次時間的計時器
    updateTime();
    setInterval(updateTime, 1000);

    // 初始化 UI 狀態
    resetUI();
    DOM.openBatchEditButton.disabled = true; // Initially disable batch edit
}

// 當 DOM 載入完成後，執行初始化函式
document.addEventListener('DOMContentLoaded', initialize);
