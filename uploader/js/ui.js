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
}