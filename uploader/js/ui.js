// uploader/js/ui.js
import { DOM } from './dom.js';
import { state, resetSummary } from './state.js';

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
    
    // 使用 flex 佈局確保時間戳和訊息內容對齊
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
 * 更新進度圈和狀態文字
 * @param {number} current - 目前完成的項目數
 * @param {number} total - 總項目數
 * @param {string} [phase=''] - 目前的階段名稱
 */
export function updateProgress(current, total, phase = '') {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    const circumference = 2 * Math.PI * 40; // 圓周長
    const offset = circumference - (percentage / 100) * circumference;
    
    DOM.progressCircle.style.strokeDashoffset = offset;
    DOM.progressPercent.textContent = `${Math.round(percentage)}%`;
    DOM.progressStatus.textContent = phase || `${current} / ${total}`;
}

/**
 * 將所有 UI 元素重設回初始狀態
 */
export function resetUI() {
    DOM.fileListContainer.classList.add('hidden');
    DOM.statusContainer.innerHTML = '<div class="text-gray-400">等待操作...</div>';
    DOM.errorLogContainer.innerHTML = '<div class="text-gray-400">無錯誤記錄</div>';
    DOM.fileList.innerHTML = '';
    
    if (DOM.startUploadButton) DOM.startUploadButton.disabled = false;
    if (DOM.selectFoldersButton) DOM.selectFoldersButton.disabled = false;
    
    // 【修改】重設時，禁用詳情按鈕
    if (DOM.showUploadDetailsButton) DOM.showUploadDetailsButton.disabled = true;

    state.allFiles = [];
    state.processedMainIds.clear();
    resetSummary();
    
    updateProgress(0, 0, '等待開始...');
    DOM.currentFileName.textContent = '';
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

// ▼▼▼ 【這就是修改處 1】 ▼▼▼
/**
 * 顯示最終的統計總結報告
 */
export function displayFinalSummary() {
    const summary = state.summary;
    const summaryContent = `
        <div class="space-y-1 text-sm font-mono p-2 border border-gray-700 rounded-md">
            <div><strong class="text-white">主表處理結果:</strong>
                <ul class="list-disc list-inside pl-4">
                    <li>新增紀錄: <span class="font-bold text-green-400">${summary.new}</span> 筆</li>
                    <li>更新紀錄: <span class="font-bold text-yellow-400">${summary.updated}</span> 筆</li>
                    <li>內容相同跳過: <span class="font-bold text-gray-400">${summary.identical}</span> 筆</li>
                </ul>
            </div>
            <div><strong class="text-white">附表處理結果:</strong>
                <ul class="list-disc list-inside pl-4">
                    <li>新增關聯紀錄: <span class="font-bold text-green-400">${summary.subAdded}</span> 筆</li>
                </ul>
            </div>
            <div class="pt-1 mt-1 border-t border-gray-700"><strong class="text-white">整體狀況:</strong>
                <ul class="list-disc list-inside pl-4">
                    <li>解析警告 (已忽略): <span class="font-bold text-yellow-400">${summary.warnings}</span> 次</li>
                    <li>上傳失敗檔案: <span class="font-bold text-red-400">${summary.errors}</span> 個</li>
                </ul>
            </div>
        </div>
    `;
    addLog('--- <strong>上傳結果總結</strong> ---', 'success');
    addLog(summaryContent, 'info');

    // 【新增】如果
    if (summary.new > 0 || summary.updated > 0 || summary.identical > 0) {
        DOM.showUploadDetailsButton.disabled = false;
    }
}
// ▲▲▲ 【修改結束】 ▲▲▲


// ▼▼▼ 【這就是修改處 2：新增整個函式區塊】 ▼▼▼
/**
 * 根據目前的頁籤，渲染上傳詳情 Modal 的內容
 * @param {string} activeTab - 目前要顯示的頁籤 ('new', 'updated', 'identical')
 */
export function renderUploadDetailsModal(activeTab = 'new') {
    const { newRecords, updatedRecords, identicalRecords } = state.summary;
    const contentContainer = DOM.uploadDetailsContent;
    let html = '';

    // 更新頁籤按鈕的 active 狀態
    DOM.uploadDetailsTabs.querySelectorAll('.details-tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === activeTab);
    });

    switch (activeTab) {
        case 'new':
            html = generateSimpleTable(newRecords, '新增紀錄');
            break;
        case 'updated':
            html = generateDiffTable(updatedRecords);
            break;
        case 'identical':
            html = generateSimpleTable(identicalRecords, '內容相同紀錄');
            break;
    }
    contentContainer.innerHTML = html;
}

/**
 * 產生用於「新增」和「相同」頁籤的簡單表格
 * @param {Array<object>} records - 要顯示的紀錄陣列
 * @param {string} title - 表格標題
 * @returns {string} - HTML 表格字串
 */
function generateSimpleTable(records, title) {
    if (records.length === 0) return `<p class="text-center text-gray-500 py-8">此分類下沒有任何紀錄。</p>`;

    const headers = Object.keys(records[0] || {}).filter(h => h !== 'id');
    const headerHtml = `<thead><tr class="bg-gray-800 text-xs text-gray-400 sticky top-0">${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
    
    const bodyHtml = `<tbody>${records.map(record => 
        `<tr class="hover:bg-gray-800/50">${headers.map(h => 
            `<td class="text-xs p-2 border-b border-gray-700 font-mono">${record[h] ?? ''}</td>`
        ).join('')}</tr>`
    ).join('')}</tbody>`;

    return `<h3 class="text-lg font-semibold mb-4 text-white">${title} (${records.length} 筆)</h3><div class="overflow-auto" style="max-height: calc(80vh - 150px);"><table class="w-full min-w-max">${headerHtml}${bodyHtml}</table></div>`;
}

/**
 * 產生用於「更新」頁籤的差異比對表格
 * @param {Array<{oldData: object, newData: object}>} records - 要顯示的紀錄陣列
 * @returns {string} - HTML 表格字串
 */
function generateDiffTable(records) {
    if (records.length === 0) return `<p class="text-center text-gray-500 py-8">此分類下沒有任何紀錄。</p>`;

    const allHeaders = new Set(['欄位名稱']);
    records.forEach(({ oldData, newData }) => {
        Object.keys(oldData).forEach(k => allHeaders.add(k));
        Object.keys(newData).forEach(k => allHeaders.add(k));
    });
    
    const headers = ['欄位名稱', ...Array.from(allHeaders).filter(h => h !== 'id' && h !== '欄位名稱').sort()];

    let bodyHtml = '';
    records.forEach(({ oldData, newData }, index) => {
        // 為每一筆更新紀錄加上分隔標題
        bodyHtml += `<tr class="bg-dark-card"><td colspan="${headers.length}" class="p-2 font-bold text-cyan-400 border-b-2 border-cyan-700">更新 #${index + 1} - 編號: ${newData['編號']}</td></tr>`;
        
        // 舊資料列
        bodyHtml += `<tr class="bg-red-900/20"><td class="p-2 border-b border-gray-700 text-red-400 font-bold">舊資料</td>`;
        headers.slice(1).forEach(header => {
            const value = oldData[header] ?? '';
            bodyHtml += `<td class="text-xs p-2 border-b border-gray-700 font-mono">${value}</td>`;
        });
        bodyHtml += `</tr>`;

        // 新資料列
        bodyHtml += `<tr class="bg-green-900/20"><td class="p-2 border-b border-gray-700 text-green-400 font-bold">新資料</td>`;
        headers.slice(1).forEach(header => {
            const oldValue = String(oldData[header] ?? '');
            const newValue = String(newData[header] ?? '');
            const isDifferent = oldValue !== newValue && header !== '建案名稱';
            bodyHtml += `<td class="text-xs p-2 border-b border-gray-700 font-mono ${isDifferent ? 'diff-highlight' : ''}">${newValue}</td>`;
        });
        bodyHtml += `</tr>`;
    });

    const headerHtml = `<thead><tr class="bg-gray-800 text-xs text-gray-400 sticky top-0">${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
    return `<h3 class="text-lg font-semibold mb-4 text-white">更新紀錄 (${records.length} 筆)</h3><div class="overflow-auto" style="max-height: calc(80vh - 150px);"><table class="w-full min-w-max">${headerHtml}<tbody>${bodyHtml}</tbody></table></div>`;
}
// ▲▲▲ 【新增結束】 ▲▲▲
