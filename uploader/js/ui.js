// uploader/js/ui.js
import { DOM } from './dom.js';
import { state, resetSummary, resetModifierState } from './state.js';

/**
 * 將日誌訊息添加到指定的容器中
 * @param {string} message - 要顯示的訊息，可以是 HTML 字串
 * @param {string} type - 訊息類型 ('info', 'success', 'warning', 'error')
 * @param {string} container - 目標容器 ('status' 或 'error')
 */
export function addLog(message, type = 'info', container = 'status') {
    const timestamp = new Date().toLocaleTimeString();
    const logContainer = container === 'status' ? DOM.statusContainer : DOM.errorLogContainer;
    const typeClass = `terminal-${type}`;
    const logEntry = document.createElement('div');
    
    logEntry.className = 'flex items-start';
    logEntry.innerHTML = `
        <span class="text-gray-500 mr-2">[${timestamp}]</span>
        <div class="flex-1 ${typeClass}">${message}</div>
    `;
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

/**
 * 更新連線狀態指示燈和文字
 * @param {boolean} isConnected - 是否已連線
 */
export function updateConnectionStatus(isConnected) {
    const statusClass = isConnected ? 'status-online' : 'status-offline';
    const statusText = isConnected ? '已連線' : '未連線';
    DOM.connectionStatus.className = `status-indicator ${statusClass}`;
    DOM.connectionText.textContent = statusText;
}

/**
 * 更新上傳進度圈和狀態文字
 * @param {number} current - 目前完成的項目數
 * @param {number} total - 總項目數
 * @param {string} [phase=''] - 目前的階段名稱
 */
export function updateProgress(current, total, phase = '') {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (percentage / 100) * circumference;
    
    DOM.progressCircle.style.strokeDashoffset = offset;
    DOM.progressPercent.textContent = `${Math.round(percentage)}%`;
    DOM.progressStatus.textContent = phase || `${current} / ${total}`;
}

/**
 * 將所有 UI 元素重設回初始狀態
 */
export function resetUI() {
    // 重設上傳工具
    DOM.fileListContainer.classList.add('hidden');
    DOM.statusContainer.innerHTML = '<div class="text-gray-400">等待操作...</div>';
    DOM.errorLogContainer.innerHTML = '<div class="text-gray-400">無錯誤記錄</div>';
    DOM.fileList.innerHTML = '';
    if (DOM.startUploadButton) DOM.startUploadButton.disabled = false;
    if (DOM.selectFoldersButton) DOM.selectFoldersButton.disabled = false;
    state.allFiles = [];
    state.processedMainIds.clear();
    resetSummary();
    updateProgress(0, 0, '等待開始...');
    DOM.currentFileName.textContent = '';

    // ▼▼▼【新增】重設批次修改工具 ▼▼▼
    DOM.modifier.resultsContainer.classList.add('hidden');
    DOM.modifier.tableBody.innerHTML = '';
    DOM.modifier.resultsCount.textContent = '0';
    DOM.modifier.keywordInput.value = '';
    DOM.modifier.newValueInput.value = '';
    DOM.modifier.updateBtn.disabled = true;
    resetModifierState();
}

/**
 * 清除指定類型的日誌
 * @param {'status' | 'error'} type - 要清除的日誌類型
 */
export function clearLogs(type) {
    if (type === 'status') {
        DOM.statusContainer.innerHTML = '<div class="text-gray-400">日誌已清除</div>';
    } else {
        DOM.errorLogContainer.innerHTML = '<div class="text-gray-400">無錯誤記錄</div>';
    }
}

/**
 * 更新顯示的系統時間
 */
export function updateTime() {
    DOM.currentTime.textContent = new Date().toLocaleTimeString();
}

/**
 * 顯示上傳工具的最終統計總結報告
 */
export function displayFinalSummary() {
    const summary = state.summary;
    const summaryContent = `...`; // 內容不變，為節省篇幅省略
    addLog('--- <strong>上傳結果總結</strong> ---', 'success');
    addLog(summaryContent, 'info');
}

/**
 * ▼▼▼【新增】將查詢結果渲染到批次修改工具的表格中 ▼▼▼
 */
export function renderModifierResultsTable() {
    const { tableBody, resultsCount, resultsContainer } = DOM.modifier;
    const results = state.modifier.searchResults;

    tableBody.innerHTML = ''; // 清空舊結果
    
    if (results.length === 0) {
        resultsCount.textContent = '0';
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-gray-500 p-4">找不到符合條件的資料。</td></tr>`;
    } else {
        resultsCount.textContent = results.length;
        const rowsHtml = results.map(row => {
            const typeMap = { 'a': '中古', 'b': '預售', 'c': '租賃' };
            const typeName = typeMap[row.tableType] || '未知';
            return `
                <tr class="hover:bg-gray-700/50">
                    <td class="p-2 w-12 text-center"><input type="checkbox" class="form-checkbox modifier-row-checkbox" data-id="${row.id}" data-type="${row.tableType}"></td>
                    <td class="p-2 font-mono">${row['編號'] || '-'}</td>
                    <td class="p-2">${row['建案名稱'] || '-'}</td>
                    <td class="p-2">${row['地址'] || '-'}</td>
                    <td class="p-2">${row['交易日'] || '-'}</td>
                    <td class="p-2">${typeName}</td>
                </tr>
            `;
        }).join('');
        tableBody.innerHTML = rowsHtml;
    }
    
    // 顯示結果區塊
    resultsContainer.classList.remove('hidden');
    // 重設勾選狀態
    DOM.modifier.selectAllCheckbox.checked = false;
    state.modifier.selectedIds.clear();
    DOM.modifier.updateBtn.disabled = true;
}

/**
 * ▼▼▼【新增】根據查詢結果，填充可供修改的欄位下拉選單 ▼▼▼
 */
export function populateModifierFields() {
    const { fieldSelect } = DOM.modifier;
    const results = state.modifier.searchResults;
    
    fieldSelect.innerHTML = ''; // 清空舊選項

    if (results.length === 0) {
        fieldSelect.disabled = true;
        return;
    }

    // 從第一筆結果中獲取所有欄位作為代表
    const allFields = Object.keys(results[0]);
    
    // 定義不應被手動修改的欄位
    const excludedFields = ['id', '編號', 'tableType'];

    const optionsHtml = allFields
        .filter(field => !excludedFields.includes(field))
        .map(field => `<option value="${field}">${field}</option>`)
        .join('');

    fieldSelect.innerHTML = `<option value="">請選擇欄位...</option>` + optionsHtml;
    fieldSelect.disabled = false;
}
